const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOptionKey: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    marksAwarded: { type: Number, required: true },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: { type: [answerSchema], default: [] },
    totalMarks: { type: Number, required: true },
    status: { type: String, enum: ['PASS', 'FAIL'], required: true },
  },
  { timestamps: true }
);

resultSchema.index({ test: 1, student: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);
module.exports = { Result };
