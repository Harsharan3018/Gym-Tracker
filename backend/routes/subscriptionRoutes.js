const express = require('express');
const router = express.Router();
const {
  getSubscriptions,
  createSubscription,
  updateSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSubscriptions)
  .post(createSubscription);

router.route('/:id')
  .put(updateSubscription);

module.exports = router;

