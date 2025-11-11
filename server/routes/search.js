const express = require('express');
const router = express.Router();
const {
  searchUsers,
  getUsersByInterest,
  getUsersByOrganization,
  getPublicProfile
} = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/auth');

// Public search routes (optional auth for personalization)
router.get('/users', optionalAuth, searchUsers);
router.get('/interest/:interest', optionalAuth, getUsersByInterest);
router.get('/organization/:organization', optionalAuth, getUsersByOrganization);
router.get('/profile/:publicLink', optionalAuth, getPublicProfile);

module.exports = router;
