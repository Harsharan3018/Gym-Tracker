const Schedule = require('../models/Schedule');
const Trainer = require('../models/Trainer');

// @desc    Get all schedules (filter by trainer, dayOfWeek, status)
// @route   GET /api/schedules
// @access  Private
exports.getSchedules = async (req, res, next) => {
  try {
    const { trainerId, dayOfWeek, status } = req.query;
    let query = {};

    if (trainerId) query.trainer = trainerId;
    if (dayOfWeek && dayOfWeek !== 'All') query.dayOfWeek = dayOfWeek;
    if (status && status !== 'All') query.status = status;

    const schedules = await Schedule.find(query)
      .populate('trainer', 'name email phone specialization')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create trainer schedule
// @route   POST /api/schedules
// @access  Private
exports.createSchedule = async (req, res, next) => {
  try {
    const { trainerId, dayOfWeek, startTime, endTime, sessionType, maxCapacity, notes, status } = req.body;

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    const schedule = await Schedule.create({
      trainer: trainerId,
      dayOfWeek,
      startTime,
      endTime,
      sessionType: sessionType || 'Floor Duty',
      maxCapacity: maxCapacity || 1,
      notes,
      status: status || 'Available',
    });

    const populated = await Schedule.findById(schedule._id).populate('trainer', 'name email specialization');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private
exports.updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('trainer', 'name email specialization');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private
exports.deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

