const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedOption: {
      type: String,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    marksObtained: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  totalMarks: {
    type: Number,
    required: true
  },
  obtainedMarks: {
    type: Number,
    required: true,
    default: 0
  },
  percentage: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pass', 'fail', 'pending'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  isGraded: {
    type: Boolean,
    default: false
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  remarks: {
    type: String,
    trim: true
  },
  // Cheating detection
  tabSwitches: {
    type: Number,
    default: 0
  },
  suspiciousActivity: {
    type: Boolean,
    default: false
  },
  // Review and feedback
  studentFeedback: {
    type: String,
    trim: true
  },
  teacherFeedback: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for unique result per student per test
resultSchema.index({ test: 1, student: 1 }, { unique: true });

// Index for efficient queries
resultSchema.index({ student: 1, status: 1 });
resultSchema.index({ test: 1, status: 1 });
resultSchema.index({ isSubmitted: 1, isGraded: 1 });

// Calculate percentage before saving
resultSchema.pre('save', function(next) {
  if (this.totalMarks > 0) {
    this.percentage = Math.round((this.obtainedMarks / this.totalMarks) * 100);
  }
  next();
});

// Method to calculate total time spent
resultSchema.methods.calculateTimeSpent = function() {
  if (this.endTime && this.startTime) {
    this.timeSpent = Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
  }
  return this.timeSpent;
};

// Method to auto-grade the result
resultSchema.methods.autoGrade = function() {
  let totalMarks = 0;
  let obtainedMarks = 0;
  
  this.answers.forEach(answer => {
    totalMarks += answer.marksObtained || 0;
    if (answer.isCorrect) {
      obtainedMarks += answer.marksObtained || 0;
    }
  });
  
  this.obtainedMarks = obtainedMarks;
  this.totalMarks = totalMarks;
  this.isGraded = true;
  this.gradedAt = new Date();
  
  return this;
};

module.exports = mongoose.model('Result', resultSchema);