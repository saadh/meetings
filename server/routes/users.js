const express = require('express');
const router = express.Router();
const {
  getAllInterests,
  getAllOrganizations,
  getUserStats
} = require('../controllers/usersController');
const { optionalAuth } = require('../middleware/auth');

// Get unique interests
router.get('/interests', getAllInterests);

// Get unique organizations
router.get('/organizations', getAllOrganizations);

// Get user statistics
router.get('/:id/stats', optionalAuth, getUserStats);

module.exports = router;
