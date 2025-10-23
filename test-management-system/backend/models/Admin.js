const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_classes',
      'manage_subjects',
      'view_all_tests',
      'manage_system_settings',
      'approve_requests',
      'send_emails',
      'view_logs',
      'generate_reports'
    ],
    default: [
      'manage_users',
      'manage_classes',
      'manage_subjects',
      'view_all_tests',
      'manage_system_settings',
      'approve_requests',
      'send_emails',
      'view_logs',
      'generate_reports'
    ]
  }],
  systemEmailConfig: {
    host: String,
    port: Number,
    secure: Boolean,
    user: String,
    pass: String, // Encrypted
  },
  lastSystemBackup: {
    type: Date,
  },
  managedInstitution: {
    name: String,
    address: String,
    phone: String,
    email: String,
  },
}, {
  timestamps: true,
});

// Index for better performance
adminSchema.index({ userId: 1 });

module.exports = mongoose.model('Admin', adminSchema);