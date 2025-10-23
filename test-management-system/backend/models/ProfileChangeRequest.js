const mongoose = require('mongoose');

const profileChangeRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestType: {
    type: String,
    enum: ['Profile Update', 'Role Change', 'Account Deactivation', 'Password Reset', 'Email Change'],
    required: true,
  },
  changes: [{
    field: {
      type: String,
      required: true,
    },
    currentValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    requestedValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
  }],
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Partially Approved'],
    default: 'Pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewDate: {
    type: Date,
  },
  reviewComments: {
    type: String,
    trim: true,
  },
  approvedChanges: [{
    field: String,
    approvedValue: mongoose.Schema.Types.Mixed,
  }],
  rejectedChanges: [{
    field: String,
    rejectionReason: String,
  }],
  documents: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
  isUrgent: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
  },
  notificationsSent: [{
    type: {
      type: String,
      enum: ['Email', 'SMS', 'In-App'],
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    recipient: String,
  }],
}, {
  timestamps: true,
});

// Index for better performance
profileChangeRequestSchema.index({ requester: 1, status: 1 });
profileChangeRequestSchema.index({ targetUser: 1, status: 1 });
profileChangeRequestSchema.index({ reviewedBy: 1, reviewDate: -1 });
profileChangeRequestSchema.index({ status: 1, priority: 1, createdAt: -1 });

// Check if request is overdue
profileChangeRequestSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return new Date() > this.dueDate && this.status === 'Pending';
});

// Calculate days pending
profileChangeRequestSchema.virtual('daysPending').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
profileChangeRequestSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ProfileChangeRequest', profileChangeRequestSchema);