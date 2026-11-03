const express = require('express');
const router = express.Router();
const {
  getTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} = require('../controllers/trainerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTrainers)
  .post(createTrainer);

router.route('/:id')
  .get(getTrainerById)
  .put(updateTrainer)
  .delete(deleteTrainer);

module.exports = router;

