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
    ref: 'Section'
  },
  academicYear: {
    type: String,
    required: true
  },
  reason: {
    type: String,
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
  comments: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
subjectAssignmentRequestSchema.index({ teacher: 1, status: 1 });
subjectAssignmentRequestSchema.index({ subject: 1, status: 1 });
subjectAssignmentRequestSchema.index({ reviewedBy: 1 });
subjectAssignmentRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SubjectAssignmentRequest', subjectAssignmentRequestSchema);