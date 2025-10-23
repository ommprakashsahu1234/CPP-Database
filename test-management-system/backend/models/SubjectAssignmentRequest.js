const mongoose = require('mongoose');

const subjectAssignmentRequestSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
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
subjectAssignmentRequestSchema.index({ teacher: 1, status: 1 });
subjectAssignmentRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SubjectAssignmentRequest', subjectAssignmentRequestSchema);
