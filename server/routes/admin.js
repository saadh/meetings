const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  getAllMeetings,
  getStatistics
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin privileges
router.use(protect, adminOnly);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/activate', activateUser);

// Meeting management
router.get('/meetings', getAllMeetings);

// Statistics
router.get('/statistics', getStatistics);

module.exports = router;
