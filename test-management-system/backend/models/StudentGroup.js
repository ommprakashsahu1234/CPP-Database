const mongoose = require('mongoose');

const studentGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  groupType: {
    type: String,
    enum: ['Remedial', 'Advanced', 'Project', 'Custom', 'Failed Students', 'Top Performers'],
    default: 'Custom',
  },
  criteria: {
    type: String,
    trim: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  maxSize: {
    type: Number,
    default: 50,
  },
  tags: [String],
  createdFor: {
    type: String,
    enum: ['Test', 'Assignment', 'Project', 'Remedial Classes', 'General'],
    default: 'General',
  },
}, {
  timestamps: true,
});

// Index for better performance
studentGroupSchema.index({ teacher: 1, class: 1 });
studentGroupSchema.index({ name: 1, teacher: 1 }, { unique: true });

// Get current group size
studentGroupSchema.virtual('currentSize').get(function() {
  return this.students.length;
});

// Check if group is full
studentGroupSchema.virtual('isFull').get(function() {
  return this.students.length >= this.maxSize;
});

// Ensure virtual fields are serialized
studentGroupSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('StudentGroup', studentGroupSchema);