const express = require('express');
const User = require('../models/User');
const { verifyToken, anyUser, logActivity } = require('../middlewares/auth');
const { catchAsync, AppError } = require('../middlewares/errorHandler');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// @route   PUT /api/profile
// @desc    Update current user profile
// @access  Private
router.put('/', logActivity('update_profile', 'profile'), catchAsync(async (req, res) => {
  const allowedUpdates = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'address', 'profilePicture'];
  const updates = {};

  // Only allow certain fields to be updated
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
}));

// @route   POST /api/profile/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', logActivity('change_password', 'profile'), catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400);
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  
  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @route   GET /api/profile/activity
// @desc    Get user activity logs
// @access  Private
router.get('/activity', catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const ActivityLog = require('../models/ActivityLog');
  
  const activities = await ActivityLog.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await ActivityLog.countDocuments({ user: req.user._id });

  res.json({
    success: true,
    data: {
      activities,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   GET /api/profile/statistics
// @desc    Get user statistics based on role
// @access  Private
router.get('/statistics', catchAsync(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  let statistics = {};

  if (role === 'student') {
    const Result = require('../models/Result');
    
    const totalTests = await Result.countDocuments({ student: userId });
    const passedTests = await Result.countDocuments({ 
      student: userId, 
      status: 'pass' 
    });
    const failedTests = await Result.countDocuments({ 
      student: userId, 
      status: 'fail' 
    });

    // Calculate average percentage
    const results = await Result.find({ 
      student: userId, 
      status: { $in: ['pass', 'fail'] } 
    });
    const averagePercentage = results.length > 0 
      ? Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length)
      : 0;

    statistics = {
      totalTests,
      passedTests,
      failedTests,
      averagePercentage,
      passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    };

  } else if (role === 'teacher') {
    const Test = require('../models/Test');
    const Result = require('../models/Result');
    
    const totalTests = await Test.countDocuments({ teacher: userId });
    const activeTests = await Test.countDocuments({ 
      teacher: userId, 
      isActive: true, 
      isPublished: true 
    });
    const totalResults = await Result.countDocuments({ 
      test: { $in: await Test.find({ teacher: userId }).distinct('_id') }
    });

    statistics = {
      totalTests,
      activeTests,
      totalResults
    };

  } else if (role === 'admin') {
    const User = require('../models/User');
    const Test = require('../models/Test');
    const Class = require('../models/Class');
    
    const totalUsers = await User.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalClasses = await Class.countDocuments();
    const totalTests = await Test.countDocuments();

    statistics = {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalClasses,
      totalTests
    };
  }

  res.json({
    success: true,
    data: { statistics }
  });
}));

module.exports = router;