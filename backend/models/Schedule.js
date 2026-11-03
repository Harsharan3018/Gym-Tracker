const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: [true, 'Trainer reference is required'],
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: [true, 'Day of week is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    sessionType: {
      type: String,
      enum: ['Personal Training', 'Group Class', 'Floor Duty', 'Consultation'],
      default: 'Floor Duty',
    },
    maxCapacity: {
      type: Number,
      default: 1,
      min: 1,
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Available', 'Booked', 'Cancelled'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Schedule', scheduleSchema);

