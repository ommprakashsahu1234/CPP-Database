const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const USER_ROLES = ['ADMIN', 'TEACHER', 'STUDENT'];

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    isActive: { type: Boolean, default: true },
    // Optional fields
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(plainText) {
  return bcrypt.compare(plainText, this.passwordHash);
};

userSchema.statics.hashPassword = async function hashPassword(plainText) {
  const saltRounds = 10;
  return bcrypt.hash(plainText, saltRounds);
};

const User = mongoose.model('User', userSchema);

module.exports = { User, USER_ROLES };
