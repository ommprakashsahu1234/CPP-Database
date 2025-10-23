const mongoose = require('mongoose');

const studentGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  academicYear: {
    type: String,
    required: true
  },
  groupType: {
    type: String,
    enum: ['remedial', 'advanced', 'custom', 'failed_students', 'top_performers'],
    default: 'custom'
  },
  criteria: {
    minMarks: Number,
    maxMarks: Number,
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
studentGroupSchema.index({ class: 1, academicYear: 1 });
studentGroupSchema.index({ createdBy: 1 });
studentGroupSchema.index({ groupType: 1 });

// Method to add student to group
studentGroupSchema.methods.addStudent = function(studentId) {
  if (!this.students.includes(studentId)) {
    this.students.push(studentId);
  }
  return this.save();
};

// Method to remove student from group
studentGroupSchema.methods.removeStudent = function(studentId) {
  this.students = this.students.filter(id => !id.equals(studentId));
  return this.save();
};

// Method to check if student is in group
studentGroupSchema.methods.hasStudent = function(studentId) {
  return this.students.some(id => id.equals(studentId));
};

module.exports = mongoose.model('StudentGroup', studentGroupSchema);