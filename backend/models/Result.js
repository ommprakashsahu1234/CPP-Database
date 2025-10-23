import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    selectedAnswer: String,
    isCorrect: Boolean,
    marksAwarded: Number
  }],
  totalMarks: {
    type: Number,
    default: 0
  },
  obtainedMarks: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['not-attempted', 'in-progress', 'submitted', 'evaluated'],
    default: 'not-attempted'
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  startedAt: Date,
  submittedAt: Date,
  evaluatedAt: Date
}, {
  timestamps: true
});

resultSchema.index({ test: 1, student: 1 }, { unique: true });
resultSchema.index({ student: 1, createdAt: -1 });

const Result = mongoose.model('Result', resultSchema);
export default Result;
