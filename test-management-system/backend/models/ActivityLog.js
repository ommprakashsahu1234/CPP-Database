const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: [
      'Authentication',
      'User Management',
      'Test Management',
      'Question Management',
      'Result Management',
      'Class Management',
      'Subject Management',
      'Profile Management',
      'Email',
      'Report Generation',
      'System Configuration',
      'Data Import/Export'
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  targetResource: {
    resourceType: {
      type: String,
      enum: ['User', 'Test', 'Question', 'Result', 'Class', 'Section', 'Subject', 'StudentGroup', 'System'],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    resourceName: String,
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    requestMethod: String,
    requestUrl: String,
    responseStatus: Number,
    executionTime: Number, // in milliseconds
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low',
  },
  status: {
    type: String,
    enum: ['Success', 'Failed', 'Warning'],
    default: 'Success',
  },
  errorDetails: {
    errorCode: String,
    errorMessage: String,
    stackTrace: String,
  },
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
  }],
  additionalData: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index for better performance
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ category: 1, createdAt: -1 });
activityLogSchema.index({ severity: 1, status: 1 });
activityLogSchema.index({ 'targetResource.resourceType': 1, 'targetResource.resourceId': 1 });

// TTL index to automatically delete old logs (optional - keep logs for 1 year)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);