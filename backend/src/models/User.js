import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },

    // Student fields
    classId: { type: Schema.Types.ObjectId, ref: 'Class', default: null },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', default: null },
    academicYear: { type: String, default: null },

    // Teacher fields
    subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],

    // Admin fields
    emailConfig: {
      enabled: { type: Boolean, default: false },
      provider: { type: String, enum: ['gmail'], default: 'gmail' },
      encryptedUser: { type: String, default: null },
      encryptedPass: { type: String, default: null },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model('User', userSchema);
