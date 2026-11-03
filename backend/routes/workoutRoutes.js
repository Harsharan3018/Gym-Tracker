const express = require('express');
const router = express.Router();
const {
  getWorkoutPlans,
  getWorkoutPlanById,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Ensure JWT authorization on all workout endpoints

router.route('/')
  .get(getWorkoutPlans)
  .post(createWorkoutPlan);

router.route('/:id')
  .get(getWorkoutPlanById)
  .put(updateWorkoutPlan)
  .delete(deleteWorkoutPlan);

module.exports = router;

