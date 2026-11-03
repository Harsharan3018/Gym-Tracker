const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: '10-12' },
  notes: { type: String, default: '' },
});

const daySchema = new mongoose.Schema({
  dayName: { type: String, required: true }, // e.g., 'Monday: Chest & Triceps'
  exercises: [exerciseSchema],
});

const workoutPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Workout plan title is required'],
      trim: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member is required'],
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: [true, 'Trainer is required'],
    },
    goal: {
      type: String,
      enum: ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness'],
      default: 'General Fitness',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    days: [daySchema],
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Paused'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);

