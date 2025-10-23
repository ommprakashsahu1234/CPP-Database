const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { verifyToken, adminOnly, logActivity } = require('../middlewares/auth');
const { catchAsync, AppError } = require('../middlewares/errorHandler');
const { validatePagination } = require('../middlewares/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// @route   GET /api/logs/activities
// @desc    Get activity logs
// @access  Private (Admin only)
router.get('/activities', adminOnly, validatePagination, logActivity('view_activity_logs', 'logs'), catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const userId = req.query.userId;
  const action = req.query.action;
  const resource = req.query.resource;
  const status = req.query.status;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Build filter object
  const filter = {};
  if (userId) filter.user = userId;
  if (action) filter.action = { $regex: action, $options: 'i' };
  if (resource) filter.resource = { $regex: resource, $options: 'i' };
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const activities = await ActivityLog.find(filter)
    .populate('user', 'firstName lastName email role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await ActivityLog.countDocuments(filter);

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

// @route   GET /api/logs/activities/:id
// @desc    Get specific activity log
// @access  Private (Admin only)
router.get('/activities/:id', adminOnly, catchAsync(async (req, res) => {
  const activity = await ActivityLog.findById(req.params.id)
    .populate('user', 'firstName lastName email role');

  if (!activity) {
    throw new AppError('Activity log not found', 404);
  }

  res.json({
    success: true,
    data: { activity }
  });
}));

// @route   GET /api/logs/statistics
// @desc    Get log statistics
// @access  Private (Admin only)
router.get('/statistics', adminOnly, catchAsync(async (req, res) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

  // Total activities
  const totalActivities = await ActivityLog.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  // Activities by status
  const activitiesByStatus = await ActivityLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Activities by action
  const activitiesByAction = await ActivityLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Activities by resource
  const activitiesByResource = await ActivityLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$resource',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Activities by user
  const activitiesByUser = await ActivityLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$user',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        _id: 1,
        count: 1,
        'user.firstName': 1,
        'user.lastName': 1,
        'user.email': 1,
        'user.role': 1
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Daily activity count
  const dailyActivities = await ActivityLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  res.json({
    success: true,
    data: {
      totalActivities,
      activitiesByStatus,
      activitiesByAction,
      activitiesByResource,
      activitiesByUser,
      dailyActivities,
      period: {
        startDate,
        endDate
      }
    }
  });
}));

// @route   DELETE /api/logs/activities
// @desc    Clear old activity logs
// @access  Private (Admin only)
router.delete('/activities', adminOnly, logActivity('clear_activity_logs', 'logs'), catchAsync(async (req, res) => {
  const { olderThanDays = 90 } = req.body;
  
  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  
  const result = await ActivityLog.deleteMany({
    createdAt: { $lt: cutoffDate }
  });

  res.json({
    success: true,
    message: `Deleted ${result.deletedCount} activity logs older than ${olderThanDays} days`
  });
}));

// @route   GET /api/logs/export
// @desc    Export activity logs
// @access  Private (Admin only)
router.get('/export', adminOnly, logActivity('export_activity_logs', 'logs'), catchAsync(async (req, res) => {
  const { format = 'json', startDate, endDate } = req.query;
  
  const filter = {};
  if (startDate) filter.createdAt = { $gte: new Date(startDate) };
  if (endDate) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$lte = new Date(endDate);
  }

  const activities = await ActivityLog.find(filter)
    .populate('user', 'firstName lastName email role')
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    // Convert to CSV format
    const csvHeader = 'Date,User,Action,Resource,Status,IP Address,User Agent\n';
    const csvData = activities.map(activity => {
      const user = activity.user ? `${activity.user.firstName} ${activity.user.lastName} (${activity.user.email})` : 'Unknown';
      return [
        activity.createdAt.toISOString(),
        user,
        activity.action,
        activity.resource,
        activity.status,
        activity.ipAddress || '',
        activity.userAgent || ''
      ].join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=activity_logs.csv');
    res.send(csvHeader + csvData);
  } else {
    // Return JSON format
    res.json({
      success: true,
      data: {
        activities,
        exportedAt: new Date().toISOString(),
        total: activities.length
      }
    });
  }
}));

module.exports = router;