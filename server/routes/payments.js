const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory
} = require('../controllers/paymentsController');
const { protect } = require('../middleware/auth');

// All payment routes require authentication
router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/history', getPaymentHistory);

module.exports = router;
