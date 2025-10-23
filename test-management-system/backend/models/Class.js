const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  academicYear: {
    type: String,
    required: true,
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  }],
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  maxStudentsPerSection: {
    type: Number,
    default: 40,
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  promotionCriteria: {
    minimumAttendance: {
      type: Number,
      default: 75, // percentage
    },
    minimumPassingGrade: {
      type: Number,
      default: 40, // percentage
    },
  },
}, {
  timestamps: true,
});

// Index for better performance
classSchema.index({ grade: 1, academicYear: 1 });
classSchema.index({ name: 1, academicYear: 1 }, { unique: true });

// Calculate total students in class
classSchema.virtual('totalStudents', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'class',
  count: true,
});

// Ensure virtual fields are serialized
classSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Class', classSchema);