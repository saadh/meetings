const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Authentication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'superadmin'],
    default: 'user'
  },

  // Profile Information
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  company: {
    name: String,
    position: String
  },
  interests: [{
    type: String,
    trim: true
  }],

  // Social Links
  socialLinks: {
    linkedin: String,
    twitter: String,
    website: String,
    github: String,
    other: String
  },

  // Meeting Preferences
  meetingPreferences: {
    acceptingRequests: {
      type: Boolean,
      default: true
    },
    meetingFormat: {
      type: String,
      enum: ['online', 'in-person', 'both'],
      default: 'both'
    },
    meetingTypes: [{
      type: String,
      enum: [
        'paid-consulting',
        'pro-bono',
        'startup-advice',
        'soundboard',
        'investor-pitch',
        'emotional-support',
        'dating',
        'expert-advice',
        'skills-training',
        'troubleshooting',
        'other'
      ]
    }],
    location: {
      city: String,
      country: String,
      address: String
    }
  },

  // Meeting Limits
  meetingLimits: {
    maxMeetingsPerWeek: {
      type: Number,
      default: 10
    },
    maxMeetingsPerMonth: {
      type: Number,
      default: 40
    },
    maxHoursPerWeek: {
      type: Number,
      default: 10
    },
    maxHoursPerMonth: {
      type: Number,
      default: 40
    }
  },

  // Pricing
  pricing: {
    requestFee: {
      amount: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    meetingRate: {
      type: String,
      enum: ['free', 'per-hour', 'per-minute', 'custom'],
      default: 'free'
    },
    rateAmount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Statistics
  statistics: {
    requestsSent: {
      type: Number,
      default: 0
    },
    requestsReceived: {
      type: Number,
      default: 0
    },
    requestsAccepted: {
      type: Number,
      default: 0
    },
    requestsRejected: {
      type: Number,
      default: 0
    },
    sentAccepted: {
      type: Number,
      default: 0
    },
    sentRejected: {
      type: Number,
      default: 0
    },
    totalMeetingsCompleted: {
      type: Number,
      default: 0
    }
  },

  // Public Meeting Link
  publicMeetingLink: {
    type: String,
    unique: true,
    sparse: true
  },

  // Stripe Account (for receiving payments)
  stripeAccountId: {
    type: String,
    default: ''
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for search performance
userSchema.index({ firstName: 'text', lastName: 'text', 'company.name': 'text' });
userSchema.index({ interests: 1 });
userSchema.index({ 'company.name': 1 });
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate public meeting link
userSchema.pre('save', function(next) {
  if (!this.publicMeetingLink && this.email) {
    const username = this.email.split('@')[0];
    const randomStr = Math.random().toString(36).substring(7);
    this.publicMeetingLink = `${username}-${randomStr}`;
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate acceptance rate
userSchema.virtual('acceptanceRate').get(function() {
  if (this.statistics.requestsReceived === 0) return 0;
  return ((this.statistics.requestsAccepted / this.statistics.requestsReceived) * 100).toFixed(1);
});

// Calculate sent acceptance rate
userSchema.virtual('sentAcceptanceRate').get(function() {
  if (this.statistics.requestsSent === 0) return 0;
  return ((this.statistics.sentAccepted / this.statistics.requestsSent) * 100).toFixed(1);
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
