const ActivityLog = require('../models/ActivityLog');

/**
 * Log user activity
 * @param {String} userId - User ID
 * @param {String} category - Activity category
 * @param {String} action - Action performed
 * @param {Object} options - Additional options
 */
const logActivity = async (userId, category, action, options = {}) => {
  try {
    const logData = {
      user: userId,
      category,
      action,
      description: options.description || action,
      targetResource: options.targetResource || {},
      metadata: options.metadata || {},
      severity: options.severity || 'Low',
      status: options.status || 'Success',
      errorDetails: options.errorDetails || {},
      changes: options.changes || [],
      additionalData: options.additionalData || {},
    };

    await ActivityLog.create(logData);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to prevent breaking the main flow
  }
};

/**
 * Log authentication events
 */
const logAuth = {
  login: (userId, metadata = {}) => {
    return logActivity(userId, 'Authentication', 'User login', {
      description: 'User successfully logged in',
      metadata,
      severity: 'Low',
      status: 'Success',
    });
  },

  logout: (userId, metadata = {}) => {
    return logActivity(userId, 'Authentication', 'User logout', {
      description: 'User logged out',
      metadata,
      severity: 'Low',
      status: 'Success',
    });
  },

  loginFailed: (email, metadata = {}) => {
    return logActivity(null, 'Authentication', 'Login failed', {
      description: `Failed login attempt for email: ${email}`,
      metadata,
      severity: 'Medium',
      status: 'Failed',
      additionalData: { email },
    });
  },

  passwordChange: (userId, metadata = {}) => {
    return logActivity(userId, 'Authentication', 'Password changed', {
      description: 'User changed password',
      metadata,
      severity: 'Medium',
      status: 'Success',
    });
  },

  tokenRefresh: (userId, metadata = {}) => {
    return logActivity(userId, 'Authentication', 'Token refreshed', {
      description: 'User refreshed access token',
      metadata,
      severity: 'Low',
      status: 'Success',
    });
  },
};

/**
 * Log CRUD operations
 */
const logCRUD = {
  create: (userId, resourceType, resourceId, resourceName, changes = []) => {
    return logActivity(userId, getCategory(resourceType), `Created ${resourceType}`, {
      description: `Created new ${resourceType}: ${resourceName}`,
      targetResource: {
        resourceType,
        resourceId,
        resourceName,
      },
      changes,
      severity: 'Low',
      status: 'Success',
    });
  },

  update: (userId, resourceType, resourceId, resourceName, changes = []) => {
    return logActivity(userId, getCategory(resourceType), `Updated ${resourceType}`, {
      description: `Updated ${resourceType}: ${resourceName}`,
      targetResource: {
        resourceType,
        resourceId,
        resourceName,
      },
      changes,
      severity: 'Low',
      status: 'Success',
    });
  },

  delete: (userId, resourceType, resourceId, resourceName) => {
    return logActivity(userId, getCategory(resourceType), `Deleted ${resourceType}`, {
      description: `Deleted ${resourceType}: ${resourceName}`,
      targetResource: {
        resourceType,
        resourceId,
        resourceName,
      },
      severity: 'Medium',
      status: 'Success',
    });
  },

  view: (userId, resourceType, resourceId, resourceName) => {
    return logActivity(userId, getCategory(resourceType), `Viewed ${resourceType}`, {
      description: `Viewed ${resourceType}: ${resourceName}`,
      targetResource: {
        resourceType,
        resourceId,
        resourceName,
      },
      severity: 'Low',
      status: 'Success',
    });
  },
};

/**
 * Log test-related activities
 */
const logTest = {
  testCreated: (userId, testId, testTitle) => {
    return logActivity(userId, 'Test Management', 'Test created', {
      description: `Created test: ${testTitle}`,
      targetResource: {
        resourceType: 'Test',
        resourceId: testId,
        resourceName: testTitle,
      },
      severity: 'Low',
      status: 'Success',
    });
  },

  testStarted: (userId, testId, testTitle) => {
    return logActivity(userId, 'Test Management', 'Test started', {
      description: `Started attempting test: ${testTitle}`,
      targetResource: {
        resourceType: 'Test',
        resourceId: testId,
        resourceName: testTitle,
      },
      severity: 'Low',
      status: 'Success',
    });
  },

  testSubmitted: (userId, testId, testTitle, score) => {
    return logActivity(userId, 'Test Management', 'Test submitted', {
      description: `Submitted test: ${testTitle} with score: ${score}`,
      targetResource: {
        resourceType: 'Test',
        resourceId: testId,
        resourceName: testTitle,
      },
      additionalData: { score },
      severity: 'Low',
      status: 'Success',
    });
  },

  testPublished: (userId, testId, testTitle) => {
    return logActivity(userId, 'Test Management', 'Test published', {
      description: `Published test: ${testTitle}`,
      targetResource: {
        resourceType: 'Test',
        resourceId: testId,
        resourceName: testTitle,
      },
      severity: 'Medium',
      status: 'Success',
    });
  },
};

/**
 * Log email activities
 */
const logEmail = {
  sent: (userId, recipient, subject) => {
    return logActivity(userId, 'Email', 'Email sent', {
      description: `Sent email to ${recipient}: ${subject}`,
      additionalData: { recipient, subject },
      severity: 'Low',
      status: 'Success',
    });
  },

  failed: (userId, recipient, subject, error) => {
    return logActivity(userId, 'Email', 'Email failed', {
      description: `Failed to send email to ${recipient}: ${subject}`,
      additionalData: { recipient, subject },
      errorDetails: { errorMessage: error },
      severity: 'Medium',
      status: 'Failed',
    });
  },
};

/**
 * Get category based on resource type
 */
const getCategory = (resourceType) => {
  const categoryMap = {
    User: 'User Management',
    Admin: 'User Management',
    Teacher: 'User Management',
    Student: 'User Management',
    Test: 'Test Management',
    Question: 'Question Management',
    Result: 'Result Management',
    Class: 'Class Management',
    Section: 'Class Management',
    Subject: 'Subject Management',
    StudentGroup: 'Class Management',
    ProfileChangeRequest: 'Profile Management',
    SubjectAssignmentRequest: 'Subject Management',
  };

  return categoryMap[resourceType] || 'System';
};

/**
 * Get activity logs with pagination and filtering
 */
const getActivityLogs = async (filters = {}, pagination = {}) => {
  try {
    const {
      userId,
      category,
      severity,
      status,
      startDate,
      endDate,
      resourceType,
    } = filters;

    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;

    // Build query
    const query = {};

    if (userId) query.user = userId;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (resourceType) query['targetResource.resourceType'] = resourceType;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('user', 'firstName lastName email role')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};

module.exports = {
  logActivity,
  logAuth,
  logCRUD,
  logTest,
  logEmail,
  getActivityLogs,
};