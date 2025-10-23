const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOption: {
      type: String, // For multiple-choice and true-false
    },
    textAnswer: {
      type: String, // For short-answer and essay
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    isAttempted: {
      type: Boolean,
      default: false,
    },
  }],
  totalMarks: {
    type: Number,
    required: true,
  },
  marksObtained: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'auto-submitted', 'graded'],
    default: 'in-progress',
  },
  isPassed: {
    type: Boolean,
    default: false,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  submissionTime: {
    type: Date,
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  attemptNumber: {
    type: Number,
    default: 1,
  },
  isLateSubmission: {
    type: Boolean,
    default: false,
  },
  penaltyApplied: {
    type: Number, // percentage deduction
    default: 0,
  },
  finalMarks: {
    type: Number, // after penalty
    default: 0,
  },
  teacherRemarks: {
    type: String,
    trim: true,
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
  },
  rank: {
    type: Number,
  },
  reviewRequested: {
    type: Boolean,
    default: false,
  },
  reviewComments: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for better performance
resultSchema.index({ test: 1, student: 1, attemptNumber: 1 }, { unique: true });
resultSchema.index({ student: 1, status: 1 });
resultSchema.index({ test: 1, status: 1 });

// Calculate percentage and final marks before saving
resultSchema.pre('save', function(next) {
  // Calculate percentage
  if (this.totalMarks > 0) {
    this.percentage = (this.marksObtained / this.totalMarks) * 100;
  }
  
  // Calculate final marks after penalty
  this.finalMarks = this.marksObtained - (this.marksObtained * this.penaltyApplied / 100);
  
  // Determine pass/fail status
  if (this.test && this.test.passingMarks) {
    this.isPassed = this.finalMarks >= this.test.passingMarks;
  }
  
  next();
});

// Calculate grade based on percentage
resultSchema.methods.calculateGrade = function() {
  const percentage = this.percentage;
  
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
};

// Get attempted questions count
resultSchema.virtual('attemptedQuestions').get(function() {
  return this.answers.filter(answer => answer.isAttempted).length;
});

// Get correct answers count
resultSchema.virtual('correctAnswers').get(function() {
  return this.answers.filter(answer => answer.isCorrect).length;
});

// Ensure virtual fields are serialized
resultSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Result', resultSchema);