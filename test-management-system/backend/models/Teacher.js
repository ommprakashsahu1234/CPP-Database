const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  employeeId: {
    type: String,
    unique: true,
    required: true,
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  }],
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  }],
  qualification: {
    degree: String,
    specialization: String,
    experience: Number, // in years
  },
  joiningDate: {
    type: Date,
    required: true,
  },
  salary: {
    type: Number,
  },
  permissions: [{
    type: String,
    enum: [
      'create_tests',
      'edit_tests',
      'delete_tests',
      'view_student_profiles',
      'create_student_groups',
      'generate_reports',
      'send_emails',
      'request_subject_assignment'
    ],
    default: [
      'create_tests',
      'edit_tests',
      'view_student_profiles',
      'create_student_groups',
      'generate_reports',
      'send_emails',
      'request_subject_assignment'
    ]
  }],
  isClassTeacher: {
    type: Boolean,
    default: false,
  },
  classTeacherOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  },
}, {
  timestamps: true,
});

// Index for better performance
teacherSchema.index({ userId: 1, employeeId: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);