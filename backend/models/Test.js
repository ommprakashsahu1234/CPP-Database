const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    passMarks: { type: Number, required: true },
    visibility: { type: String, enum: ['ALL', 'GROUP_ONLY'], default: 'ALL' },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentGroup' }],
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Test = mongoose.model('Test', testSchema);
module.exports = { Test };
