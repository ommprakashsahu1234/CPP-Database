const express = require('express');
const User = require('../models/User');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Test = require('../models/Test');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');
const SubjectAssignmentRequest = require('../models/SubjectAssignmentRequest');
const ActivityLog = require('../models/ActivityLog');
const { verifyToken, adminOnly, logActivity } = require('../middlewares/auth');
const { catchAsync, AppError } = require('../middlewares/errorHandler');
const { validateUser, validateClass, validateSection, validateSubject, validateObjectId, validatePagination } = require('../middlewares/validation');

const router = express.Router();

// Apply admin middleware to all routes
router.use(verifyToken, adminOnly);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', logActivity('view_dashboard', 'admin'), catchAsync(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalTeachers = await User.countDocuments({ role: 'teacher' });
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalClasses = await Class.countDocuments();
  const totalTests = await Test.countDocuments();
  const pendingRequests = await ProfileChangeRequest.countDocuments({ status: 'pending' });
  const subjectRequests = await SubjectAssignmentRequest.countDocuments({ status: 'pending' });

  // Recent activities
  const recentActivities = await ActivityLog.find()
    .populate('user', 'firstName lastName role')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalClasses,
        totalTests,
        pendingRequests,
        subjectRequests
      },
      recentActivities
    }
  });
}));

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin only)
router.get('/users', validatePagination, logActivity('view_users', 'admin'), catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const role = req.query.role;
  const search = req.query.search;
  const isActive = req.query.isActive;

  // Build filter object
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('subjects', 'name code')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/users', validateUser, logActivity('create_user', 'admin'), catchAsync(async (req, res) => {
  const userData = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  const user = new User(userData);
  await user.save();

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user }
  });
}));

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private (Admin only)
router.get('/users/:id', validateObjectId('id'), catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('subjects', 'name code');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/users/:id', validateObjectId('id'), logActivity('update_user', 'admin'), catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update user data
  Object.keys(req.body).forEach(key => {
    if (key !== 'password' && key !== '_id') {
      user[key] = req.body[key];
    }
  });

  await user.save();

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
}));

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', validateObjectId('id'), logActivity('delete_user', 'admin'), catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private (Admin only)
router.put('/users/:id/toggle-status', validateObjectId('id'), logActivity('toggle_user_status', 'admin'), catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user }
  });
}));

// @route   GET /api/admin/classes
// @desc    Get all classes
// @access  Private (Admin only)
router.get('/classes', validatePagination, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const academicYear = req.query.academicYear;

  const filter = {};
  if (academicYear) filter.academicYear = academicYear;

  const classes = await Class.find(filter)
    .populate('sections', 'name capacity currentStrength')
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Class.countDocuments(filter);

  res.json({
    success: true,
    data: {
      classes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   POST /api/admin/classes
// @desc    Create a new class
// @access  Private (Admin only)
router.post('/classes', validateClass, logActivity('create_class', 'admin'), catchAsync(async (req, res) => {
  const classData = {
    ...req.body,
    createdBy: req.user._id
  };

  const newClass = new Class(classData);
  await newClass.save();

  res.status(201).json({
    success: true,
    message: 'Class created successfully',
    data: { class: newClass }
  });
}));

// @route   GET /api/admin/sections
// @desc    Get all sections
// @access  Private (Admin only)
router.get('/sections', validatePagination, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const classId = req.query.classId;
  const academicYear = req.query.academicYear;

  const filter = {};
  if (classId) filter.class = classId;
  if (academicYear) filter.academicYear = academicYear;

  const sections = await Section.find(filter)
    .populate('class', 'name')
    .populate('subjects', 'name code')
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Section.countDocuments(filter);

  res.json({
    success: true,
    data: {
      sections,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   POST /api/admin/sections
// @desc    Create a new section
// @access  Private (Admin only)
router.post('/sections', validateSection, logActivity('create_section', 'admin'), catchAsync(async (req, res) => {
  const sectionData = {
    ...req.body,
    createdBy: req.user._id
  };

  const newSection = new Section(sectionData);
  await newSection.save();

  res.status(201).json({
    success: true,
    message: 'Section created successfully',
    data: { section: newSection }
  });
}));

// @route   GET /api/admin/subjects
// @desc    Get all subjects
// @access  Private (Admin only)
router.get('/subjects', validatePagination, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const classId = req.query.classId;
  const academicYear = req.query.academicYear;

  const filter = {};
  if (classId) filter.class = classId;
  if (academicYear) filter.academicYear = academicYear;

  const subjects = await Subject.find(filter)
    .populate('class', 'name')
    .populate('teacher', 'firstName lastName email')
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Subject.countDocuments(filter);

  res.json({
    success: true,
    data: {
      subjects,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   POST /api/admin/subjects
// @desc    Create a new subject
// @access  Private (Admin only)
router.post('/subjects', validateSubject, logActivity('create_subject', 'admin'), catchAsync(async (req, res) => {
  const subjectData = {
    ...req.body,
    createdBy: req.user._id
  };

  const newSubject = new Subject(subjectData);
  await newSubject.save();

  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: { subject: newSubject }
  });
}));

// @route   GET /api/admin/requests/profile-changes
// @desc    Get profile change requests
// @access  Private (Admin only)
router.get('/requests/profile-changes', validatePagination, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  const filter = {};
  if (status) filter.status = status;

  const requests = await ProfileChangeRequest.find(filter)
    .populate('user', 'firstName lastName email role')
    .populate('requestedBy', 'firstName lastName email')
    .populate('reviewedBy', 'firstName lastName email')
    .populate('changes.class', 'name')
    .populate('changes.section', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await ProfileChangeRequest.countDocuments(filter);

  res.json({
    success: true,
    data: {
      requests,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   PUT /api/admin/requests/profile-changes/:id
// @desc    Approve/reject profile change request
// @access  Private (Admin only)
router.put('/requests/profile-changes/:id', validateObjectId('id'), logActivity('review_profile_request', 'admin'), catchAsync(async (req, res) => {
  const { status, comments } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Invalid status. Must be approved or rejected', 400);
  }

  const request = await ProfileChangeRequest.findById(req.params.id)
    .populate('user');

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  request.status = status;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.comments = comments;

  // If approved, apply changes to user
  if (status === 'approved') {
    const user = request.user;
    Object.keys(request.changes).forEach(key => {
      if (request.changes[key] !== undefined) {
        user[key] = request.changes[key];
      }
    });
    await user.save();
  }

  await request.save();

  res.json({
    success: true,
    message: `Profile change request ${status} successfully`,
    data: { request }
  });
}));

// @route   GET /api/admin/requests/subject-assignments
// @desc    Get subject assignment requests
// @access  Private (Admin only)
router.get('/requests/subject-assignments', validatePagination, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  const filter = {};
  if (status) filter.status = status;

  const requests = await SubjectAssignmentRequest.find(filter)
    .populate('teacher', 'firstName lastName email')
    .populate('subject', 'name code')
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('reviewedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await SubjectAssignmentRequest.countDocuments(filter);

  res.json({
    success: true,
    data: {
      requests,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   PUT /api/admin/requests/subject-assignments/:id
// @desc    Approve/reject subject assignment request
// @access  Private (Admin only)
router.put('/requests/subject-assignments/:id', validateObjectId('id'), logActivity('review_subject_request', 'admin'), catchAsync(async (req, res) => {
  const { status, comments } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Invalid status. Must be approved or rejected', 400);
  }

  const request = await SubjectAssignmentRequest.findById(req.params.id)
    .populate('teacher')
    .populate('subject');

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  request.status = status;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.comments = comments;

  // If approved, assign subject to teacher
  if (status === 'approved') {
    const teacher = request.teacher;
    if (!teacher.subjects.includes(request.subject._id)) {
      teacher.subjects.push(request.subject._id);
      await teacher.save();
    }

    // Update subject teacher
    request.subject.teacher = teacher._id;
    await request.subject.save();
  }

  await request.save();

  res.json({
    success: true,
    message: `Subject assignment request ${status} successfully`,
    data: { request }
  });
}));

module.exports = router;