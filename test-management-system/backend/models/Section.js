const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  maxCapacity: {
    type: Number,
    default: 40,
  },
  currentStrength: {
    type: Number,
    default: 0,
  },
  subjects: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  }],
  timetable: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    periods: [{
      period: Number,
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
      },
      startTime: String,
      endTime: String,
    }],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better performance
sectionSchema.index({ class: 1, academicYear: 1 });
sectionSchema.index({ name: 1, class: 1, academicYear: 1 }, { unique: true });

// Update current strength when students are added/removed
sectionSchema.pre('save', function(next) {
  this.currentStrength = this.students.length;
  next();
});

module.exports = mongoose.model('Section', sectionSchema);