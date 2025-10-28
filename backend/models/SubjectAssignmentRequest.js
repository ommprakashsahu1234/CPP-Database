const mongoose = require('mongoose');

const subjectAssignmentRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // teacher
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

const SubjectAssignmentRequest = mongoose.model('SubjectAssignmentRequest', subjectAssignmentRequestSchema);
module.exports = { SubjectAssignmentRequest };
