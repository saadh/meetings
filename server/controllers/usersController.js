const User = require('../models/User');
const MeetingRequest = require('../models/MeetingRequest');

// @desc    Get all unique interests
// @route   GET /api/users/interests
// @access  Public
exports.getAllInterests = async (req, res) => {
  try {
    const interests = await User.aggregate([
      { $match: { role: 'user', isActive: true } },
      { $unwind: '$interests' },
      { $group: { _id: '$interests', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 100 }
    ]);

    res.json({
      success: true,
      interests: interests.map(i => ({
        name: i._id,
        count: i.count
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching interests',
      error: error.message
    });
  }
};

// @desc    Get all unique organizations
// @route   GET /api/users/organizations
// @access  Public
exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await User.aggregate([
      {
        $match: {
          role: 'user',
          isActive: true,
          'company.name': { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$company.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 100 }
    ]);

    res.json({
      success: true,
      organizations: organizations.map(o => ({
        name: o._id,
        count: o.count
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching organizations',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName statistics');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get additional meeting stats
    const upcomingMeetings = await MeetingRequest.countDocuments({
      $or: [
        { sender: user._id },
        { recipient: user._id }
      ],
      status: 'accepted',
      scheduledDate: { $gte: new Date() }
    });

    res.json({
      success: true,
      stats: {
        ...user.statistics,
        acceptanceRate: user.acceptanceRate,
        sentAcceptanceRate: user.sentAcceptanceRate,
        upcomingMeetings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};
