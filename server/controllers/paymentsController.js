const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const MeetingRequest = require('../models/MeetingRequest');
const User = require('../models/User');

// @desc    Create payment intent for meeting request
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { meetingRequestId, amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    const meeting = await MeetingRequest.findById(meetingRequestId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting request not found'
      });
    }

    // Verify that the current user is the sender
    if (meeting.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to make payment for this meeting'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        meetingRequestId: meetingRequestId,
        senderId: req.user.id,
        recipientId: meeting.recipient.toString()
      }
    });

    // Store payment intent ID in meeting request
    meeting.paymentStatus.paymentIntentId = paymentIntent.id;
    await meeting.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, meetingRequestId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been completed'
      });
    }

    // Update meeting request with payment info
    const meeting = await MeetingRequest.findById(meetingRequestId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting request not found'
      });
    }

    meeting.paymentStatus.requestFeePaid = true;
    meeting.paymentStatus.meetingFeePaid = true;
    meeting.paymentStatus.totalPaid = paymentIntent.amount / 100; // Convert from cents
    meeting.paymentStatus.paidAt = Date.now();

    await meeting.save();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      meeting
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get all meetings where user was sender and payment was made
    const payments = await MeetingRequest.find({
      sender: req.user.id,
      'paymentStatus.requestFeePaid': true
    })
      .populate('recipient', 'firstName lastName email')
      .select('recipient duration meetingType scheduledDate paymentStatus')
      .sort({ 'paymentStatus.paidAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MeetingRequest.countDocuments({
      sender: req.user.id,
      'paymentStatus.requestFeePaid': true
    });

    // Calculate total spent
    const totalSpent = await MeetingRequest.aggregate([
      {
        $match: {
          sender: req.user.id,
          'paymentStatus.requestFeePaid': true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$paymentStatus.totalPaid' }
        }
      }
    ]);

    res.json({
      success: true,
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message
    });
  }
};
