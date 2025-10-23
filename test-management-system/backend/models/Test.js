const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
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
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  passMarks: {
    type: Number,
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  isActive: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  allowReview: {
    type: Boolean,
    default: true
  },
  instructions: {
    type: String,
    trim: true
  },
  studentGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentGroup'
  }],
  // Auto-grading settings
  autoGrade: {
    type: Boolean,
    default: true
  },
  showResultsImmediately: {
    type: Boolean,
    default: false
  },
  // Test statistics
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  passRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
testSchema.index({ subject: 1, academicYear: 1 });
testSchema.index({ teacher: 1, academicYear: 1 });
testSchema.index({ startTime: 1, endTime: 1 });
testSchema.index({ isActive: 1, isPublished: 1 });

// Virtual for test status
testSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.startTime) return 'upcoming';
  if (now >= this.startTime && now <= this.endTime) return 'active';
  return 'completed';
});

// Method to check if test is currently active
testSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime && this.isActive && this.isPublished;
};

// Method to check if student can attempt test
testSchema.methods.canStudentAttempt = function(studentId) {
  if (!this.isActive || !this.isPublished) return false;
  
  const now = new Date();
  if (now < this.startTime || now > this.endTime) return false;
  
  // Check if student is in allowed groups or section
  // This will be implemented based on student group logic
  return true;
};

module.exports = mongoose.model('Test', testSchema);