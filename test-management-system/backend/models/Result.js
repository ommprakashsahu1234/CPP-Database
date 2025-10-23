const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    marksObtained: {
      type: Number,
      default: 0
    }
  }],
  totalMarks: {
    type: Number,
    required: true
  },
  obtainedMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pass', 'fail', 'absent'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  submitTime: {
    type: Date,
    required: true
  },
  timeTaken: {
    type: Number, // in minutes
    required: true
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  isGraded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure one result per student per test
resultSchema.index({ student: 1, test: 1 }, { unique: true });

// Index for efficient querying
resultSchema.index({ test: 1, status: 1 });
resultSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Result', resultSchema);
