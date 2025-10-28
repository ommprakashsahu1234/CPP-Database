const mongoose = require('mongoose');

const profileChangeRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changes: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

const ProfileChangeRequest = mongoose.model('ProfileChangeRequest', profileChangeRequestSchema);
module.exports = { ProfileChangeRequest };
