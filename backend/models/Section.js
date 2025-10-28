const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. A, B
    academicYear: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  },
  { timestamps: true }
);

sectionSchema.index({ name: 1, class: 1, academicYear: 1 }, { unique: true });

const Section = mongoose.model('Section', sectionSchema);
module.exports = { Section };
