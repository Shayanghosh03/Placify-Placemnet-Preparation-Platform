import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true, select: false },
    avatarUrl: { type: String, default: '' },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    headline: { type: String, default: 'Student account' },
    bio: { type: String, default: '' },
    college: { type: String, default: '' },
    phone: { type: String, default: '' },
    targetRole: { type: String, default: 'Software Development Engineer' },
    graduationYear: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

