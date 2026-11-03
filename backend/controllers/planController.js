const Plan = require('../models/Plan');
const Member = require('../models/Member');

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public or Private
exports.getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single plan
// @route   GET /api/plans/:id
// @access  Private
exports.getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Create plan
// @route   POST /api/plans
// @access  Private
exports.createPlan = async (req, res, next) => {
  try {
    const { name, durationMonths, price, description, features, status } = req.body;

    const existing = await Plan.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A plan with this name already exists' });
    }

    const plan = await Plan.create({
      name,
      durationMonths,
      price,
      description,
      features: features || [],
      status: status || 'Active',
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
// @access  Private
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete plan
// @route   DELETE /api/plans/:id
// @access  Private
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Check if any members currently have this plan
    const membersWithPlan = await Member.countDocuments({ currentPlan: plan._id });
    if (membersWithPlan > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete plan. It is actively assigned to ${membersWithPlan} member(s). Archive it instead.`,
      });
    }

    await Plan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    next(error);
  }
};

