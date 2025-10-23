import mongoose from 'mongoose';

const { Schema } = mongoose;

const testSchema = new Schema(
  {
    title: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    totalMarks: { type: Number, default: 0 },
    passMarks: { type: Number, default: 0 },
    visibleToSectionIds: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
    visibleToGroupIds: [{ type: Schema.Types.ObjectId, ref: 'StudentGroup' }],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Test', testSchema);
