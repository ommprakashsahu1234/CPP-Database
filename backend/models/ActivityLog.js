import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userType: {
      type: String,
      enum: ['Admin', 'Teacher', 'Student'],
      required: true
    },
    userName: String,
    userEmail: String
  },
  action: {
    type: String,
    required: true
  },
  actionType: {
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'other'],
    required: true
  },
  entity: {
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    entityName: String
  },
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  }
}, {
  timestamps: true
});

activityLogSchema.index({ 'user.userId': 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
