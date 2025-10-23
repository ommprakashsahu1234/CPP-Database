import mongoose from 'mongoose';

const { Schema } = mongoose;

const classSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Class', classSchema);
