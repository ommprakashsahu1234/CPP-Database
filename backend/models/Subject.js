const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true }, // e.g. MATH101
    name: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

subjectSchema.index({ code: 1, class: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = { Subject };
