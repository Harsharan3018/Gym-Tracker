const Attendance = require('../models/Attendance');
const Member = require('../models/Member');

// @desc    Get attendance records (filter by date, memberId, status)
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { date, memberId, status } = req.query;
    let query = {};

    if (date) {
      query.date = date;
    }
    if (memberId) {
      query.member = memberId;
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    const records = await Attendance.find(query)
      .populate('member', 'name email phone status currentPlan')
      .sort({ checkInTime: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check In member
// @route   POST /api/attendance/check-in
// @access  Private
exports.checkIn = async (req, res, next) => {
  try {
    const { memberId, notes } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if member is already checked in without checking out
    const activeCheckIn = await Attendance.findOne({
      member: memberId,
      date: today,
      status: 'Checked In',
    });

    if (activeCheckIn) {
      return res.status(400).json({
        success: false,
        message: `${member.name} is already checked in today at ${new Date(activeCheckIn.checkInTime).toLocaleTimeString()}`,
      });
    }

    const record = await Attendance.create({
      member: memberId,
      date: today,
      checkInTime: new Date(),
      status: 'Checked In',
      notes: notes || '',
    });

    const populated = await Attendance.findById(record._id).populate('member', 'name email phone');

    res.status(201).json({
      success: true,
      message: `${member.name} successfully checked in`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check Out member
// @route   PUT /api/attendance/:id/check-out
// @access  Private
exports.checkOut = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id).populate('member', 'name');
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (record.status === 'Checked Out') {
      return res.status(400).json({ success: false, message: 'Member has already checked out' });
    }

    record.checkOutTime = new Date();
    record.status = 'Checked Out';
    if (req.body.notes) {
      record.notes = (record.notes ? record.notes + ' | ' : '') + req.body.notes;
    }
    await record.save();

    res.json({
      success: true,
      message: `${record.member.name} successfully checked out`,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private
exports.deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.json({ success: true, message: 'Attendance record deleted' });
  } catch (error) {
    next(error);
  }
};

