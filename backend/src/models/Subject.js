import mongoose from 'mongoose';

const { Schema } = mongoose;

const subjectSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    classIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    teacherIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model('Subject', subjectSchema);
