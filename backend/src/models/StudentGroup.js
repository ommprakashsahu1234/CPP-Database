import mongoose from 'mongoose';

const { Schema } = mongoose;

const studentGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model('StudentGroup', studentGroupSchema);
