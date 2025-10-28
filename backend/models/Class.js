const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. Grade 10
    academicYear: { type: String, required: true }, // e.g. 2025-2026
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  },
  { timestamps: true }
);

classSchema.index({ name: 1, academicYear: 1 }, { unique: true });

const ClassModel = mongoose.model('Class', classSchema);
module.exports = { ClassModel };
