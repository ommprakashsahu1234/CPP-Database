import mongoose from 'mongoose';

const profileChangeRequestSchema = new mongoose.Schema({
  requestedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userType: {
      type: String,
      enum: ['Teacher', 'Student'],
      required: true
    },
    userName: String
  },
  targetUser: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userType: {
      type: String,
      enum: ['Teacher', 'Student'],
      required: true
    }
  },
  changes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  reason: String,
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

profileChangeRequestSchema.index({ status: 1, createdAt: -1 });

const ProfileChangeRequest = mongoose.model('ProfileChangeRequest', profileChangeRequestSchema);
export default ProfileChangeRequest;
