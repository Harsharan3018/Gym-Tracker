const Subscription = require('../models/Subscription');
const Member = require('../models/Member');
const Plan = require('../models/Plan');

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private
exports.getSubscriptions = async (req, res, next) => {
  try {
    const { status, memberId } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (memberId) {
      query.member = memberId;
    }

    const subscriptions = await Subscription.find(query)
      .populate('member', 'name email phone status')
      .populate('plan', 'name durationMonths price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subscription for a member
// @route   POST /api/subscriptions
// @access  Private
exports.createSubscription = async (req, res, next) => {
  try {
    const { memberId, planId, startDate, paymentMethod, paymentStatus } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.durationMonths);

    const subscription = await Subscription.create({
      member: memberId,
      plan: planId,
      startDate: start,
      endDate: end,
      amount: plan.price,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: paymentStatus || 'Paid',
      status: 'Active',
    });

    // Update member's current active plan and subscription reference
    member.currentPlan = plan._id;
    member.currentSubscription = subscription._id;
    member.status = 'Active';
    await member.save();

    const populatedSub = await Subscription.findById(subscription._id)
      .populate('member', 'name email phone')
      .populate('plan', 'name durationMonths price');

    res.status(201).json({
      success: true,
      data: populatedSub,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription status
// @route   PUT /api/subscriptions/:id
// @access  Private
exports.updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('member', 'name email phone')
      .populate('plan', 'name durationMonths price');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

