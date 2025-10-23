const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'fill_blank', 'short_answer'],
    default: 'multiple_choice'
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    type: String,
    trim: true
  },
  marks: {
    type: Number,
    required: true,
    default: 1
  },
  negativeMarks: {
    type: Number,
    default: 0
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
questionSchema.index({ test: 1 });
questionSchema.index({ createdBy: 1 });

// Validation for multiple choice questions
questionSchema.pre('save', function(next) {
  if (this.questionType === 'multiple_choice') {
    const correctOptions = this.options.filter(option => option.isCorrect);
    if (correctOptions.length === 0) {
      return next(new Error('At least one option must be marked as correct for multiple choice questions'));
    }
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema);