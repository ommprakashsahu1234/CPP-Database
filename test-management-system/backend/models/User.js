const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'teacher', 'student'],
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  profilePicture: {
    type: String, // URL or file path
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  emailConfig: {
    host: String,
    port: Number,
    secure: Boolean,
    user: String,
    pass: String, // Encrypted
  },
  refreshToken: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for better performance
userSchema.index({ email: 1, role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);