const MeetingRequest = require('../models/MeetingRequest');
const User = require('../models/User');
const { createZoomMeeting } = require('../utils/zoomHelper');

// @desc    Create a meeting request
// @route   POST /api/meetings
// @access  Private
exports.createMeetingRequest = async (req, res) => {
  try {
    const {
      recipientId,
      duration,
      meetingType,
      purpose,
      meetingFormat,
      proposedDates,
      location,
      compensation
    } = req.body;

    // Validate recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Check if recipient is accepting requests
    if (!recipient.meetingPreferences.acceptingRequests) {
      return res.status(403).json({
        success: false,
        message: 'This user is not accepting meeting requests at the moment'
      });
    }

    // Check if sender is trying to send to themselves
    if (recipientId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a meeting request to yourself'
      });
    }

    // Create meeting request
    const meetingRequest = await MeetingRequest.create({
      sender: req.user.id,
      recipient: recipientId,
      duration,
      meetingType,
      purpose,
      meetingFormat: meetingFormat || 'online',
      proposedDates,
      location,
      compensation
    });

    // Update sender statistics
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'statistics.requestsSent': 1 }
    });

    // Update recipient statistics
    await User.findByIdAndUpdate(recipientId, {
      $inc: { 'statistics.requestsReceived': 1 }
    });

    // Populate sender and recipient info
    await meetingRequest.populate('sender', 'firstName lastName email profileImage');
    await meetingRequest.populate('recipient', 'firstName lastName email profileImage');

    // TODO: Send email notification to recipient

    res.status(201).json({
      success: true,
      message: 'Meeting request sent successfully',
      meetingRequest
    });
  } catch (error) {
    console.error('Create meeting request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating meeting request',
      error: error.message
    });
  }
};

// @desc    Get all meeting requests for current user
// @route   GET /api/meetings/my-requests
// @access  Private
exports.getMyMeetingRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    };

    if (status) {
      query.status = status;
    }

    const meetings = await MeetingRequest.find(query)
      .populate('sender', 'firstName lastName email profileImage')
      .populate('recipient', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MeetingRequest.countDocuments(query);

    res.json({
      success: true,
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meeting requests',
      error: error.message
    });
  }
};

// @desc    Get received meeting requests
// @route   GET /api/meetings/received
// @access  Private
exports.getReceivedRequests = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const query = {
      recipient: req.user.id,
      status
    };

    const meetings = await MeetingRequest.find(query)
      .populate('sender', 'firstName lastName email profileImage company')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MeetingRequest.countDocuments(query);

    res.json({
      success: true,
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching received requests',
      error: error.message
    });
  }
};

// @desc    Get sent meeting requests
// @route   GET /api/meetings/sent
// @access  Private
exports.getSentRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {
      sender: req.user.id
    };

    if (status) {
      query.status = status;
    }

    const meetings = await MeetingRequest.find(query)
      .populate('recipient', 'firstName lastName email profileImage company')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MeetingRequest.countDocuments(query);

    res.json({
      success: true,
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sent requests',
      error: error.message
    });
  }
};

// @desc    Get meeting request by ID
// @route   GET /api/meetings/:id
// @access  Private
exports.getMeetingRequestById = async (req, res) => {
  try {
    const meeting = await MeetingRequest.findById(req.params.id)
      .populate('sender', 'firstName lastName email profileImage company')
      .populate('recipient', 'firstName lastName email profileImage company');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting request not found'
      });
    }

    // Check if user is involved in this meeting
    if (
      meeting.sender._id.toString() !== req.user.id &&
      meeting.recipient._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this meeting request'
      });
    }

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meeting request',
      error: error.message
    });
  }
};

// @desc    Accept meeting request
// @route   PUT /api/meetings/:id/accept
// @access  Private
exports.acceptMeetingRequest = async (req, res) => {
  try {
    const { scheduledDate, scheduledTime, message } = req.body;

    const meeting = await MeetingRequest.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting request not found'
      });
    }

    // Check if user is the recipient
    if (meeting.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can accept this request'
      });
    }

    if (meeting.status !== 'pending' && meeting.status !== 'modified') {
      return res.status(400).json({
        success: false,
        message: 'This meeting request cannot be accepted'
      });
    }

    // Update meeting status
    meeting.status = 'accepted';
    meeting.scheduledDate = scheduledDate;
    meeting.scheduledTime = scheduledTime;
    meeting.response = {
      message,
      respondedAt: Date.now()
    };

    // Create Zoom meeting if online
    if (meeting.meetingFormat === 'online') {
      try {
        const zoomMeeting = await createZoomMeeting({
          topic: `Meeting: ${meeting.meetingType}`,
          duration: meeting.duration,
          startTime: scheduledDate
        });

        meeting.meetingLink = zoomMeeting.join_url;
        meeting.meetingPassword = zoomMeeting.password;
        meeting.zoomMeetingId = zoomMeeting.id.toString();
      } catch (error) {
        console.error('Zoom meeting creation error:', error);
        // Continue without Zoom link
      }
    }

    await meeting.save();

    // Update statistics
    await User.findByIdAndUpdate(meeting.recipient, {
      $inc: { 'statistics.requestsAccepted': 1 }
    });

    await User.findByIdAndUpdate(meeting.sender, {
      $inc: { 'statistics.sentAccepted': 1 }
    });

    await meeting.populate('sender', 'firstName lastName email');
    await meeting.populate('recipient', 'firstName lastName email');

    // TODO: Send email notification to sender

    res.json({
      success: true,
      message: 'Meeting request accepted',
      meeting
    });
  } catch (error) {
    console.error('Accept meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting meeting request',
      error: error.message
    });
  }
};

// @desc    Reject meeting request
// @route   PUT /api/meetings/:id/reject
// @access  Private
exports.rejectMeetingRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const meeting = await MeetingRequest.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting request not found'
      });
    }

    // Check if user is the recipient
    if (meeting.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can reject this request'
      });
    }

    if (meeting.status !== 'pending' && meeting.status !== 'modified') {
      return res.status(400).json({
        success: false,
        message: 'This meeting request cannot be rejected'
      });
    }

    // Update meeting status
    meeting.status = 'rejected';
    meeting.rejectionReason = rejectionReason;
    meeting.response = {
      message: rejectionReason,
      respondedAt: Date.now()
    };

    await meeting.save();

    // Update statistics
    await User.findByIdAndUpdate(meeting.recipient, {
      $inc: { 'statistics.requestsRejected': 1 }
    });

    await User.findByIdAndUpdate(meeting.sender, {
      $inc: { 'statistics.sentRejected': 1 }
    });

    await meeting.populate('sender', 'firstName lastName email');
    await meeting.populate('recipient', 'firstName lastName email');

    // TODO: Send email notification to sender

    res.json({
      success: true,
      message: 'Meeting request rejected',
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting meeting request',
      error: error.message
    });
  }
};

// @desc    Modify meeting request (accept with modifications)
// @route   PUT /api/meetings/:id/modify
// @access  Private
exports.modifyMeetingRequest = async (req, res) => {
  try {
    const { modifications, message } = req.body;

    const meeting = await MeetingRequest.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting request not found'
      });
    }

    // Check if user is the recipient
    if (meeting.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can modify this request'
      });
    }

    if (meeting.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This meeting request cannot be modified'
      });
    }

    // Update meeting status
    meeting.status = 'modified';
    meeting.response = {
      message,
      respondedAt: Date.now(),
      modifications
    };

    await meeting.save();

    await meeting.populate('sender', 'firstName lastName email');
    await meeting.populate('recipient', 'firstName lastName email');

    // TODO: Send email notification to sender

    res.json({
      success: true,
      message: 'Meeting request modified. Waiting for sender approval.',
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error modifying meeting request',
      error: error.message
    });
  }
};

// @desc    Cancel meeting request
// @route   PUT /api/meetings/:id/cancel
// @access  Private
exports.cancelMeetingRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    const meeting = await MeetingRequest.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting request not found'
      });
    }

    // Check if user is sender or recipient
    const isSender = meeting.sender.toString() === req.user.id;
    const isRecipient = meeting.recipient.toString() === req.user.id;

    if (!isSender && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this meeting'
      });
    }

    meeting.status = 'cancelled';
    if (isSender) {
      meeting.senderNotes = reason;
    } else {
      meeting.recipientNotes = reason;
    }

    await meeting.save();

    await meeting.populate('sender', 'firstName lastName email');
    await meeting.populate('recipient', 'firstName lastName email');

    // TODO: Send email notification to other party

    res.json({
      success: true,
      message: 'Meeting cancelled',
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling meeting',
      error: error.message
    });
  }
};

// @desc    Mark meeting as completed
// @route   PUT /api/meetings/:id/complete
// @access  Private
exports.completeMeetingRequest = async (req, res) => {
  try {
    const meeting = await MeetingRequest.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting request not found'
      });
    }

    // Check if user is sender or recipient
    const isSender = meeting.sender.toString() === req.user.id;
    const isRecipient = meeting.recipient.toString() === req.user.id;

    if (!isSender && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to mark this meeting as completed'
      });
    }

    if (meeting.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted meetings can be marked as completed'
      });
    }

    meeting.status = 'completed';
    await meeting.save();

    // Update statistics
    await User.findByIdAndUpdate(meeting.sender, {
      $inc: { 'statistics.totalMeetingsCompleted': 1 }
    });

    await User.findByIdAndUpdate(meeting.recipient, {
      $inc: { 'statistics.totalMeetingsCompleted': 1 }
    });

    res.json({
      success: true,
      message: 'Meeting marked as completed',
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing meeting',
      error: error.message
    });
  }
};

// @desc    Check user's availability
// @route   POST /api/meetings/check-availability
// @access  Private
exports.checkAvailability = async (req, res) => {
  try {
    const { userId, week, month } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Count accepted meetings for the specified period
    const startDate = week || month;
    const endDate = new Date(startDate);

    if (week) {
      endDate.setDate(endDate.getDate() + 7);
    } else if (month) {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const acceptedMeetings = await MeetingRequest.find({
      recipient: userId,
      status: 'accepted',
      scheduledDate: {
        $gte: startDate,
        $lte: endDate
      }
    });

    const totalMinutes = acceptedMeetings.reduce((sum, m) => sum + m.duration, 0);
    const totalHours = totalMinutes / 60;

    const limits = user.meetingLimits;
    const isAvailable = week
      ? acceptedMeetings.length < limits.maxMeetingsPerWeek && totalHours < limits.maxHoursPerWeek
      : acceptedMeetings.length < limits.maxMeetingsPerMonth && totalHours < limits.maxHoursPerMonth;

    res.json({
      success: true,
      availability: {
        isAvailable,
        currentMeetings: acceptedMeetings.length,
        currentHours: totalHours,
        limits: week
          ? {
              maxMeetings: limits.maxMeetingsPerWeek,
              maxHours: limits.maxHoursPerWeek
            }
          : {
              maxMeetings: limits.maxMeetingsPerMonth,
              maxHours: limits.maxHoursPerMonth
            }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message
    });
  }
};
