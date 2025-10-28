import mongoose from 'mongoose';

const { Schema } = mongoose;

const resultSchema = new Schema(
  {
    testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    responses: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
        selectedKey: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
        marksAwarded: { type: Number, required: true },
      },
    ],
    totalMarks: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'submitted', 'graded'], default: 'pending' },
    passed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Result', resultSchema);
