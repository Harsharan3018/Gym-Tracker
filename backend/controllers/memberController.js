const Member = require('../models/Member');
const Subscription = require('../models/Subscription');
const Attendance = require('../models/Attendance');
const WorkoutPlan = require('../models/WorkoutPlan');

// @desc    Get all members (with search and status filter)
// @route   GET /api/members
// @access  Private
exports.getMembers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const members = await Member.find(query)
      .populate('currentPlan', 'name price durationMonths')
      .populate('assignedTrainer', 'name email specialization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single member by ID
// @route   GET /api/members/:id
// @access  Private
exports.getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('currentPlan')
      .populate('assignedTrainer');

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Fetch related records
    const subscriptions = await Subscription.find({ member: member._id }).populate('plan').sort({ createdAt: -1 });
    const attendance = await Attendance.find({ member: member._id }).sort({ checkInTime: -1 }).limit(10);
    const workouts = await WorkoutPlan.find({ member: member._id }).populate('trainer', 'name').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...member.toObject(),
        subscriptions,
        recentAttendance: attendance,
        workouts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new member
// @route   POST /api/members
// @access  Private
exports.createMember = async (req, res, next) => {
  try {
    const { name, email, phone, dateOfBirth, gender, address, emergencyContact, currentPlan, assignedTrainer, notes } = req.body;

    // Check if email already registered as member
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'A member with this email already exists' });
    }

    const member = await Member.create({
      name,
      email,
      phone,
      dateOfBirth,
      gender: gender || 'Male',
      address,
      emergencyContact,
      currentPlan: currentPlan || null,
      assignedTrainer: assignedTrainer || null,
      notes,
    });

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
exports.updateMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Check email uniqueness if modified
    if (req.body.email && req.body.email !== member.email) {
      const emailExists = await Member.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already used by another member' });
      }
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('currentPlan', 'name price durationMonths')
      .populate('assignedTrainer', 'name email specialization');

    res.json({
      success: true,
      data: updatedMember,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private
exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Clean up related records
    await Subscription.deleteMany({ member: member._id });
    await Attendance.deleteMany({ member: member._id });
    await WorkoutPlan.deleteMany({ member: member._id });
    await Member.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Member and all associated records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

