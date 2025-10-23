const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  }],
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  }],
  category: {
    type: String,
    enum: ['Core', 'Elective', 'Optional', 'Extra-curricular'],
    default: 'Core',
  },
  credits: {
    type: Number,
    default: 1,
    min: 0.5,
    max: 6,
  },
  maxMarks: {
    type: Number,
    default: 100,
  },
  passingMarks: {
    type: Number,
    default: 40,
  },
  syllabus: [{
    chapter: String,
    topics: [String],
    estimatedHours: Number,
  }],
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['Book', 'PDF', 'Video', 'Website', 'Other'],
    },
    url: String,
    description: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better performance
subjectSchema.index({ code: 1 });
subjectSchema.index({ name: 1, category: 1 });

module.exports = mongoose.model('Subject', subjectSchema);