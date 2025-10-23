const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  }],
  studentGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentGroup',
  }],
  targetStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  totalMarks: {
    type: Number,
    required: true,
    min: 1,
  },
  passingMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  instructions: {
    type: String,
    trim: true,
  },
  testType: {
    type: String,
    enum: ['Quiz', 'Unit Test', 'Mid Term', 'Final Exam', 'Assignment', 'Practice'],
    default: 'Quiz',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  allowLateSubmission: {
    type: Boolean,
    default: false,
  },
  lateSubmissionPenalty: {
    type: Number, // percentage deduction
    default: 0,
  },
  shuffleQuestions: {
    type: Boolean,
    default: false,
  },
  shuffleOptions: {
    type: Boolean,
    default: false,
  },
  showResultsImmediately: {
    type: Boolean,
    default: false,
  },
  allowReview: {
    type: Boolean,
    default: true,
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1,
  },
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    highestScore: {
      type: Number,
      default: 0,
    },
    lowestScore: {
      type: Number,
      default: 0,
    },
    passedStudents: {
      type: Number,
      default: 0,
    },
    failedStudents: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Index for better performance
testSchema.index({ teacher: 1, subject: 1 });
testSchema.index({ class: 1, startTime: 1 });
testSchema.index({ isActive: 1, isPublished: 1 });

// Calculate pass percentage
testSchema.virtual('passPercentage').get(function() {
  const totalStudents = this.statistics.passedStudents + this.statistics.failedStudents;
  if (totalStudents === 0) return 0;
  return (this.statistics.passedStudents / totalStudents) * 100;
});

// Check if test is currently active
testSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && this.isPublished && now >= this.startTime && now <= this.endTime;
});

// Check if test is upcoming
testSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.isActive && this.isPublished && now < this.startTime;
});

// Check if test is completed
testSchema.virtual('isCompleted').get(function() {
  const now = new Date();
  return now > this.endTime;
});

// Ensure virtual fields are serialized
testSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Test', testSchema);