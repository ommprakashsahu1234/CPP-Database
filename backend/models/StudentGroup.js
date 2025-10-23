const mongoose = require('mongoose');

const studentGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

studentGroupSchema.index({ name: 1, section: 1 }, { unique: true });

const StudentGroup = mongoose.model('StudentGroup', studentGroupSchema);
module.exports = { StudentGroup };
