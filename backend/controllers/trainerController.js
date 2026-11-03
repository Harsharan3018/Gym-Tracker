const Trainer = require('../models/Trainer');
const Schedule = require('../models/Schedule');
const Member = require('../models/Member');
const WorkoutPlan = require('../models/WorkoutPlan');

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Private
exports.getTrainers = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const trainers = await Trainer.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: trainers.length,
      data: trainers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trainer
// @route   GET /api/trainers/:id
// @access  Private
exports.getTrainerById = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    const schedules = await Schedule.find({ trainer: trainer._id }).sort({ dayOfWeek: 1 });
    const assignedMembers = await Member.find({ assignedTrainer: trainer._id }).select('name email phone status');
    const workoutPlans = await WorkoutPlan.find({ trainer: trainer._id }).populate('member', 'name').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...trainer.toObject(),
        schedules,
        assignedMembers,
        workoutPlans,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create trainer
// @route   POST /api/trainers
// @access  Private
exports.createTrainer = async (req, res, next) => {
  try {
    const { name, email, phone, specialization, experienceYears, hourlyRate, bio, status } = req.body;

    const existing = await Trainer.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Trainer with this email already exists' });
    }

    const trainer = await Trainer.create({
      name,
      email,
      phone,
      specialization: Array.isArray(specialization) ? specialization : specialization ? specialization.split(',').map(s => s.trim()) : ['General Fitness'],
      experienceYears: experienceYears || 1,
      hourlyRate: hourlyRate || 500,
      bio,
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      data: trainer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trainer
// @route   PUT /api/trainers/:id
// @access  Private
exports.updateTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    if (req.body.email && req.body.email !== trainer.email) {
      const emailExists = await Trainer.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already used by another trainer' });
      }
    }

    if (req.body.specialization && typeof req.body.specialization === 'string') {
      req.body.specialization = req.body.specialization.split(',').map(s => s.trim());
    }

    const updatedTrainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedTrainer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trainer
// @route   DELETE /api/trainers/:id
// @access  Private
exports.deleteTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    // Unassign members
    await Member.updateMany({ assignedTrainer: trainer._id }, { $set: { assignedTrainer: null } });
    // Remove schedules
    await Schedule.deleteMany({ trainer: trainer._id });
    await Trainer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Trainer deleted successfully and schedules cleared',
    });
  } catch (error) {
    next(error);
  }
};

