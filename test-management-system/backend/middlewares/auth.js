const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Check user role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Activity logging middleware
const logActivity = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log activity after response is sent
      setImmediate(async () => {
        try {
          await ActivityLog.logActivity({
            user: req.user?._id,
            action: action,
            resource: resource,
            resourceId: req.params.id || req.body.id,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: req.method !== 'GET' ? req.body : undefined
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            status: res.statusCode < 400 ? 'success' : 'failure',
            message: res.statusCode < 400 ? 'Operation completed successfully' : 'Operation failed'
          });
        } catch (error) {
          console.error('Activity logging error:', error);
        }
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Admin only middleware
const adminOnly = checkRole('admin');

// Teacher only middleware
const teacherOnly = checkRole('teacher');

// Student only middleware
const studentOnly = checkRole('student');

// Teacher or Admin middleware
const teacherOrAdmin = checkRole('teacher', 'admin');

// All authenticated users middleware
const anyUser = checkRole('admin', 'teacher', 'student');

module.exports = {
  verifyToken,
  checkRole,
  logActivity,
  adminOnly,
  teacherOnly,
  studentOnly,
  teacherOrAdmin,
  anyUser
};