const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const Attendance = require('../models/Attendance');
const WorkoutPlan = require('../models/WorkoutPlan');

// @desc    Get dashboard metrics & summary
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      totalTrainers,
      activeTrainers,
      totalPlans,
      activeSubscriptions,
      todayAttendance,
      currentlyInside,
      activeWorkouts,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'Active' }),
      Member.countDocuments({ status: 'Inactive' }),
      Trainer.countDocuments(),
      Trainer.countDocuments({ status: 'Active' }),
      Plan.countDocuments({ status: 'Active' }),
      Subscription.countDocuments({ status: 'Active' }),
      Attendance.countDocuments({ date: today }),
      Attendance.countDocuments({ date: today, status: 'Checked In' }),
      WorkoutPlan.countDocuments({ status: 'Active' }),
    ]);

    // Calculate revenue
    const revenueAgg = await Subscription.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Recent 5 check-ins
    const recentCheckIns = await Attendance.find()
      .populate('member', 'name phone status')
      .sort({ checkInTime: -1 })
      .limit(6);

    // Recent 5 joined members
    const recentMembers = await Member.find()
      .populate('currentPlan', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Popular membership plans
    const planPopularity = await Subscription.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 }, totalRevenue: { $sum: '$amount' } } },
      { $lookup: { from: 'plans', localField: '_id', foreignField: '_id', as: 'planDetails' } },
      { $unwind: '$planDetails' },
      { $project: { name: '$planDetails.name', count: 1, totalRevenue: 1 } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalMembers,
          activeMembers,
          inactiveMembers,
          totalTrainers,
          activeTrainers,
          totalPlans,
          activeSubscriptions,
          todayAttendance,
          currentlyInside,
          activeWorkouts,
          totalRevenue,
        },
        recentCheckIns,
        recentMembers,
        planPopularity,
      },
    });
  } catch (error) {
    next(error);
  }
};

