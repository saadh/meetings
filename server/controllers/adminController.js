const User = require('../models/User');
const MeetingRequest = require('../models/MeetingRequest');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/SuperAdmin
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;

    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/SuperAdmin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's meeting requests
    const sentRequests = await MeetingRequest.find({ sender: user._id })
      .populate('recipient', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);

    const receivedRequests = await MeetingRequest.find({ recipient: user._id })
      .populate('sender', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      user,
      sentRequests,
      receivedRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/SuperAdmin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent modifying superadmin role unless you are updating your own account
    if (user.role === 'superadmin' && user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify other SuperAdmin accounts'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/SuperAdmin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting superadmin accounts
    if (user.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete SuperAdmin accounts'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    // TODO: Also delete or archive associated meeting requests

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/SuperAdmin
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate SuperAdmin accounts'
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
};

// @desc    Activate user
// @route   PUT /api/admin/users/:id/activate
// @access  Private/SuperAdmin
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User activated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error activating user',
      error: error.message
    });
  }
};

// @desc    Get all meeting requests
// @route   GET /api/admin/meetings
// @access  Private/SuperAdmin
exports.getAllMeetings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const meetings = await MeetingRequest.find(query)
      .populate('sender', 'firstName lastName email')
      .populate('recipient', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MeetingRequest.countDocuments(query);

    res.json({
      success: true,
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meetings',
      error: error.message
    });
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/statistics
// @access  Private/SuperAdmin
exports.getStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const totalMeetings = await MeetingRequest.countDocuments();
    const pendingMeetings = await MeetingRequest.countDocuments({ status: 'pending' });
    const acceptedMeetings = await MeetingRequest.countDocuments({ status: 'accepted' });
    const completedMeetings = await MeetingRequest.countDocuments({ status: 'completed' });

    // Calculate total revenue (if payments are tracked)
    const totalRevenue = await MeetingRequest.aggregate([
      {
        $match: {
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
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        meetings: {
          total: totalMeetings,
          pending: pendingMeetings,
          accepted: acceptedMeetings,
          completed: completedMeetings
        },
        revenue: {
          total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
          currency: 'USD'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
