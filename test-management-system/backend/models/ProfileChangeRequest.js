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
    email: String,
    phone: String,
    dateOfBirth: Date,
    address: String,
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    }
  },
  currentData: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    dateOfBirth: Date,
    address: String,
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    }
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
  comments: {
    type: String,
    trim: true
  },
  reason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
profileChangeRequestSchema.index({ user: 1, status: 1 });
profileChangeRequestSchema.index({ requestedBy: 1, status: 1 });
profileChangeRequestSchema.index({ reviewedBy: 1 });
profileChangeRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ProfileChangeRequest', profileChangeRequestSchema);