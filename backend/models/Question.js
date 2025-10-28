import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false'],
    default: 'multiple-choice'
  },
  options: [{
    optionText: {
      type: String,
      required: true
    },
    optionLabel: {
      type: String,
      required: true
    }
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    required: true,
    min: 0
  },
  orderIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

questionSchema.index({ test: 1, orderIndex: 1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;
