const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    default: 40
  },
  currentStrength: {
    type: Number,
    default: 0
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique section names per class per academic year
sectionSchema.index({ name: 1, class: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
