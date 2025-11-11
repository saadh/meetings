const express = require('express');
const router = express.Router();
const {
  createMeetingRequest,
  getMyMeetingRequests,
  getMeetingRequestById,
  acceptMeetingRequest,
  rejectMeetingRequest,
  modifyMeetingRequest,
  cancelMeetingRequest,
  completeMeetingRequest,
  getReceivedRequests,
  getSentRequests,
  checkAvailability
} = require('../controllers/meetingsController');
const { protect } = require('../middleware/auth');

// All meeting routes require authentication
router.use(protect);

// Create and get meetings
router.post('/', createMeetingRequest);
router.get('/my-requests', getMyMeetingRequests);
router.get('/received', getReceivedRequests);
router.get('/sent', getSentRequests);
router.get('/:id', getMeetingRequestById);

// Check availability
router.post('/check-availability', checkAvailability);

// Accept, reject, modify meetings
router.put('/:id/accept', acceptMeetingRequest);
router.put('/:id/reject', rejectMeetingRequest);
router.put('/:id/modify', modifyMeetingRequest);
router.put('/:id/cancel', cancelMeetingRequest);
router.put('/:id/complete', completeMeetingRequest);

module.exports = router;
