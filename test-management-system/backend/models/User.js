const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Student specific fields
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  academicYear: {
    type: String
  },
  // Teacher specific fields
  teacherId: {
    type: String,
    unique: true,
    sparse: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  // Admin specific fields
  adminId: {
    type: String,
    unique: true,
    sparse: true
  },
  emailCredentials: {
    host: String,
    port: Number,
    user: String,
    pass: String
  }
}, {
  timestamps: true
});

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
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate user ID based on role
userSchema.pre('save', function(next) {
  if (this.isNew) {
    const prefix = this.role.charAt(0).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    
    switch (this.role) {
      case 'student':
        this.studentId = `STU${timestamp}`;
        break;
      case 'teacher':
        this.teacherId = `TCH${timestamp}`;
        break;
      case 'admin':
        this.adminId = `ADM${timestamp}`;
        break;
    }
  }
  next();
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.emailCredentials;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);