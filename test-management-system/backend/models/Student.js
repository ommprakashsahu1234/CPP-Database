const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  parentDetails: {
    fatherName: String,
    motherName: String,
    guardianName: String,
    parentPhone: String,
    parentEmail: String,
    parentAddress: String,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  admissionDate: {
    type: Date,
    required: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  medicalConditions: [String],
  previousSchool: {
    name: String,
    address: String,
    lastClass: String,
  },
  performance: {
    totalTestsAttempted: {
      type: Number,
      default: 0,
    },
    totalTestsPassed: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    lastTestDate: Date,
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentGroup',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better performance
studentSchema.index({ userId: 1, rollNumber: 1, admissionNumber: 1 });
studentSchema.index({ class: 1, section: 1, academicYear: 1 });

// Calculate pass percentage
studentSchema.virtual('passPercentage').get(function() {
  if (this.performance.totalTestsAttempted === 0) return 0;
  return (this.performance.totalTestsPassed / this.performance.totalTestsAttempted) * 100;
});

// Ensure virtual fields are serialized
studentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);