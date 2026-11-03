const WorkoutPlan = require('../models/WorkoutPlan');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');

// @desc    Get all workout plans
// @route   GET /api/workouts
// @access  Private
exports.getWorkoutPlans = async (req, res, next) => {
  try {
    const { memberId, trainerId, status, goal } = req.query;
    let query = {};

    if (memberId) query.member = memberId;
    if (trainerId) query.trainer = trainerId;
    if (status && status !== 'All') query.status = status;
    if (goal && goal !== 'All') query.goal = goal;

    const plans = await WorkoutPlan.find(query)
      .populate('member', 'name email phone')
      .populate('trainer', 'name specialization phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout plan
// @route   GET /api/workouts/:id
// @access  Private
exports.getWorkoutPlanById = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id)
      .populate('member')
      .populate('trainer');

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }

    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Create workout plan (Assign to member and trainer)
// @route   POST /api/workouts
// @access  Private
exports.createWorkoutPlan = async (req, res, next) => {
  try {
    const { title, memberId, trainerId, goal, difficulty, startDate, endDate, days, notes } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    const plan = await WorkoutPlan.create({
      title,
      member: memberId,
      trainer: trainerId,
      goal: goal || 'General Fitness',
      difficulty: difficulty || 'Intermediate',
      startDate: startDate || new Date(),
      endDate: endDate || null,
      days: days || [],
      notes: notes || '',
    });

    const populated = await WorkoutPlan.findById(plan._id)
      .populate('member', 'name email phone')
      .populate('trainer', 'name specialization');

    res.status(201).json({
      success: true,
      message: 'Workout plan created and assigned successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout plan
// @route   PUT /api/workouts/:id
// @access  Private
exports.updateWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('member', 'name email phone')
      .populate('trainer', 'name specialization');

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }

    res.json({
      success: true,
      message: 'Workout plan updated successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout plan
// @route   DELETE /api/workouts/:id
// @access  Private
exports.deleteWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }
    res.json({ success: true, message: 'Workout plan deleted successfully' });
  } catch (error) {
    next(error);
  }
};

