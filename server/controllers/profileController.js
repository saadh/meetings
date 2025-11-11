const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/profile/me
// @access  Private
exports.updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      'firstName',
      'lastName',
      'bio',
      'description',
      'company',
      'interests',
      'socialLinks'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Upload profile image
// @route   POST /api/profile/upload-image
// @access  Private
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old profile image if exists
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '../../', user.profileImage);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        // Ignore error if file doesn't exist
      }
    }

    // Update user with new image path
    user.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: user.profileImage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// @desc    Update meeting preferences
// @route   PUT /api/profile/preferences
// @access  Private
exports.updateMeetingPreferences = async (req, res) => {
  try {
    const {
      acceptingRequests,
      meetingFormat,
      meetingTypes,
      location,
      meetingLimits
    } = req.body;

    const user = await User.findById(req.user.id);

    if (acceptingRequests !== undefined) {
      user.meetingPreferences.acceptingRequests = acceptingRequests;
    }

    if (meetingFormat) {
      user.meetingPreferences.meetingFormat = meetingFormat;
    }

    if (meetingTypes) {
      user.meetingPreferences.meetingTypes = meetingTypes;
    }

    if (location) {
      user.meetingPreferences.location = location;
    }

    if (meetingLimits) {
      user.meetingLimits = { ...user.meetingLimits, ...meetingLimits };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Meeting preferences updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

// @desc    Update pricing settings
// @route   PUT /api/profile/pricing
// @access  Private
exports.updatePricing = async (req, res) => {
  try {
    const { requestFee, meetingRate, rateAmount, currency } = req.body;

    const user = await User.findById(req.user.id);

    if (requestFee !== undefined) {
      user.pricing.requestFee.amount = requestFee.amount || 0;
      user.pricing.requestFee.currency = requestFee.currency || 'USD';
    }

    if (meetingRate) {
      user.pricing.meetingRate = meetingRate;
    }

    if (rateAmount !== undefined) {
      user.pricing.rateAmount = rateAmount;
    }

    if (currency) {
      user.pricing.currency = currency;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Pricing updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating pricing',
      error: error.message
    });
  }
};
