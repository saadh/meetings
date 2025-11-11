const User = require('../models/User');

const createSuperAdmin = async () => {
  try {
    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });

    if (existingSuperAdmin) {
      console.log('SuperAdmin already exists');
      return;
    }

    // Create superadmin account
    const superAdmin = await User.create({
      email: process.env.SUPERADMIN_EMAIL || 'admin@meetings.com',
      password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!',
      role: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      isEmailVerified: true,
      meetingPreferences: {
        acceptingRequests: false
      }
    });

    console.log('SuperAdmin account created successfully');
    console.log('Email:', superAdmin.email);
    console.log('Please change the default password immediately!');
  } catch (error) {
    console.error('Error creating SuperAdmin:', error.message);
  }
};

module.exports = { createSuperAdmin };
