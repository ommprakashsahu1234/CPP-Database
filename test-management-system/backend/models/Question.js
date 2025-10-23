const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  questionText: {
    type: String,
    required: true,
    trim: true,
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
    default: 'multiple-choice',
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  }],
  correctAnswer: {
    type: String, // For short-answer and essay questions
    trim: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 0.5,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  category: {
    type: String,
    trim: true,
  },
  tags: [String],
  explanation: {
    type: String,
    trim: true,
  },
  image: {
    type: String, // URL or file path
  },
  orderIndex: {
    type: Number,
    default: 0,
  },
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0,
    },
    correctAttempts: {
      type: Number,
      default: 0,
    },
    averageTimeSpent: {
      type: Number, // in seconds
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better performance
questionSchema.index({ test: 1, orderIndex: 1 });
questionSchema.index({ questionType: 1, difficulty: 1 });

// Calculate success rate
questionSchema.virtual('successRate').get(function() {
  if (this.statistics.totalAttempts === 0) return 0;
  return (this.statistics.correctAttempts / this.statistics.totalAttempts) * 100;
});

// Validate options for multiple-choice questions
questionSchema.pre('save', function(next) {
  if (this.questionType === 'multiple-choice') {
    if (!this.options || this.options.length < 2) {
      return next(new Error('Multiple-choice questions must have at least 2 options'));
    }
    
    const correctOptions = this.options.filter(option => option.isCorrect);
    if (correctOptions.length === 0) {
      return next(new Error('Multiple-choice questions must have at least one correct option'));
    }
  }
  
  if (this.questionType === 'true-false') {
    if (!this.options || this.options.length !== 2) {
      this.options = [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: false }
      ];
    }
  }
  
  next();
});

// Ensure virtual fields are serialized
questionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Question', questionSchema);