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
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index for unique section per class per academic year
sectionSchema.index({ name: 1, class: 1, academicYear: 1 }, { unique: true });

// Update current strength when students are added/removed
sectionSchema.methods.updateStrength = function() {
  return this.constructor.countDocuments({
    _id: this._id,
    'students': { $exists: true }
  });
};

module.exports = mongoose.model('Section', sectionSchema);