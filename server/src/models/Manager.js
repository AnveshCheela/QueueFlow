import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const managerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Instance method to compare passwords
managerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove passwordHash from JSON output
managerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const Manager = mongoose.model('Manager', managerSchema);

export default Manager;
