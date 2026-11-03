const express = require('express');
const router = express.Router();
const {
  getAttendance,
  checkIn,
  checkOut,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Ensure all attendance routes are protected by JWT

router.route('/')
  .get(getAttendance);

router.post('/check-in', checkIn);
router.put('/:id/check-out', checkOut);
router.delete('/:id', deleteAttendance);

module.exports = router;

