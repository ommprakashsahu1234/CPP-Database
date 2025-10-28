import mongoose from 'mongoose';

const subjectAssignmentRequestSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }],
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  reviewComments: String
}, {
  timestamps: true
});

subjectAssignmentRequestSchema.index({ status: 1, createdAt: -1 });

const SubjectAssignmentRequest = mongoose.model('SubjectAssignmentRequest', subjectAssignmentRequestSchema);
export default SubjectAssignmentRequest;
