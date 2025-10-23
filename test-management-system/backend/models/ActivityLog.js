const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  resource: {
    type: String,
    required: true,
    trim: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  message: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ resource: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

// Static method to log activity
activityLogSchema.statics.logActivity = function(data) {
  return this.create({
    user: data.user,
    action: data.action,
    resource: data.resource,
    resourceId: data.resourceId,
    details: data.details,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    status: data.status || 'success',
    message: data.message
  });
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);