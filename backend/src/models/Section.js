import mongoose from 'mongoose';

const { Schema } = mongoose;

const sectionSchema = new Schema(
  {
    name: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    academicYear: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Section', sectionSchema);
