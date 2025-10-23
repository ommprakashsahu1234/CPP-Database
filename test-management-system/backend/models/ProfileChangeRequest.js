const mongoose = require('mongoose');

const profileChangeRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changes: {
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    rollNumber: String,
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    }
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  adminComments: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
profileChangeRequestSchema.index({ user: 1, status: 1 });
profileChangeRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ProfileChangeRequest', profileChangeRequestSchema);
