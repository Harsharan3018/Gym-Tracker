const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Trainer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Trainer email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Trainer phone number is required'],
      trim: true,
    },
    specialization: {
      type: [String],
      default: ['General Fitness'],
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      default: 500,
    },
    bio: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trainer', trainerSchema);

