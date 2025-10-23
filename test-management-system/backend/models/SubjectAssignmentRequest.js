const mongoose = require('mongoose');

const subjectAssignmentRequestSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  }],
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  }],
  requestType: {
    type: String,
    enum: ['New Assignment', 'Additional Classes', 'Transfer', 'Temporary Assignment'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  qualifications: {
    type: String,
    trim: true,
  },
  experience: {
    subjectExperience: {
      type: Number, // years
      default: 0,
    },
    totalExperience: {
      type: Number, // years
      default: 0,
    },
    previousInstitutions: [String],
  },
  preferredSchedule: {
    availableDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    }],
    preferredTimeSlots: [String],
    maxHoursPerWeek: Number,
  },
  currentWorkload: {
    totalSubjects: Number,
    totalClasses: Number,
    totalHoursPerWeek: Number,
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Conditionally Approved'],
    default: 'Pending',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  reviewDate: {
    type: Date,
  },
  reviewComments: {
    type: String,
    trim: true,
  },
  approvalConditions: [String],
  effectiveDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  isTemporary: {
    type: Boolean,
    default: false,
  },
  replacingTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['Certificate', 'Experience Letter', 'Resume', 'Other'],
    },
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
  adminNotes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for better performance
subjectAssignmentRequestSchema.index({ teacher: 1, status: 1 });
subjectAssignmentRequestSchema.index({ subject: 1, status: 1 });
subjectAssignmentRequestSchema.index({ reviewedBy: 1, reviewDate: -1 });
subjectAssignmentRequestSchema.index({ status: 1, priority: 1, createdAt: -1 });

// Check if request is overdue (pending for more than 7 days)
subjectAssignmentRequestSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'Pending') return false;
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const daysPending = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return daysPending > 7;
});

// Calculate days pending
subjectAssignmentRequestSchema.virtual('daysPending').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
subjectAssignmentRequestSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('SubjectAssignmentRequest', subjectAssignmentRequestSchema);