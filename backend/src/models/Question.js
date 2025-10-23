import mongoose from 'mongoose';

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
    text: { type: String, required: true },
    options: [
      {
        key: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    correctKey: { type: String, required: true },
    marks: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
