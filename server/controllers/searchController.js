const User = require('../models/User');

// @desc    Search users by name, email, or keywords
// @route   GET /api/search/users?q=searchterm
// @access  Public
exports.searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query = {
      role: 'user',
      isActive: true,
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { 'company.name': { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ]
    };

    const users = await User.find(query)
      .select('firstName lastName email profileImage bio company interests meetingPreferences pricing statistics publicMeetingLink')
      .sort({ 'statistics.totalMeetingsCompleted': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
};

// @desc    Get users by interest
// @route   GET /api/search/interest/:interest
// @access  Public
exports.getUsersByInterest = async (req, res) => {
  try {
    const { interest } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find({
      role: 'user',
      isActive: true,
      interests: { $regex: interest, $options: 'i' }
    })
      .select('firstName lastName email profileImage bio company interests meetingPreferences pricing statistics publicMeetingLink')
      .sort({ 'statistics.totalMeetingsCompleted': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({
      role: 'user',
      isActive: true,
      interests: { $regex: interest, $options: 'i' }
    });

    res.json({
      success: true,
      interest,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users by interest',
      error: error.message
    });
  }
};

// @desc    Get users by organization
// @route   GET /api/search/organization/:organization
// @access  Public
exports.getUsersByOrganization = async (req, res) => {
  try {
    const { organization } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find({
      role: 'user',
      isActive: true,
      'company.name': { $regex: organization, $options: 'i' }
    })
      .select('firstName lastName email profileImage bio company interests meetingPreferences pricing statistics publicMeetingLink')
      .sort({ 'company.name': 1, lastName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({
      role: 'user',
      isActive: true,
      'company.name': { $regex: organization, $options: 'i' }
    });

    res.json({
      success: true,
      organization,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users by organization',
      error: error.message
    });
  }
};

// @desc    Get public profile by public link
// @route   GET /api/search/profile/:publicLink
// @access  Public
exports.getPublicProfile = async (req, res) => {
  try {
    const { publicLink } = req.params;

    const user = await User.findOne({
      publicMeetingLink: publicLink,
      isActive: true
    }).select('firstName lastName email profileImage bio description company interests meetingPreferences pricing statistics publicMeetingLink socialLinks');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching public profile',
      error: error.message
    });
  }
};
