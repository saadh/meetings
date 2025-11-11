const mongoose = require('mongoose');

const meetingRequestSchema = new mongoose.Schema({
  // Sender and Recipient
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Meeting Details
  duration: {
    type: Number, // in minutes
    required: [true, 'Meeting duration is required']
  },
  meetingType: {
    type: String,
    required: [true, 'Meeting type is required'],
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
  },
  purpose: {
    type: String,
    required: [true, 'Meeting purpose is required'],
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },
  meetingFormat: {
    type: String,
    enum: ['online', 'in-person'],
    default: 'online'
  },

  // Scheduling
  proposedDates: [{
    date: Date,
    time: String
  }],
  scheduledDate: {
    type: Date
  },
  scheduledTime: {
    type: String
  },

  // Location (for in-person meetings)
  location: {
    address: String,
    city: String,
    country: String,
    additionalInfo: String
  },

  // Payment/Compensation
  compensation: {
    type: {
      type: String,
      enum: ['monetary', 'in-kind', 'none'],
      default: 'none'
    },
    monetaryOffer: {
      requestFee: {
        type: Number,
        default: 0
      },
      tip: {
        type: Number,
        default: 0
      },
      meetingFee: {
        type: Number,
        default: 0
      },
      maxAmount: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    inKindOffer: {
      description: String,
      estimatedValue: String
    }
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'modified', 'cancelled', 'completed'],
    default: 'pending'
  },

  // Response from recipient
  response: {
    message: String,
    respondedAt: Date,
    modifications: {
      duration: Number,
      proposedDates: [{
        date: Date,
        time: String
      }],
      location: {
        address: String,
        city: String,
        country: String
      },
      compensationAmount: Number,
      other: String
    }
  },

  // Rejection reason
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },

  // Zoom/Meeting Link
  meetingLink: {
    type: String
  },
  meetingPassword: {
    type: String
  },
  zoomMeetingId: {
    type: String
  },

  // Payment Status
  paymentStatus: {
    requestFeePaid: {
      type: Boolean,
      default: false
    },
    meetingFeePaid: {
      type: Boolean,
      default: false
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    paymentIntentId: String,
    paidAt: Date
  },

  // Notes
  senderNotes: String,
  recipientNotes: String,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for query performance
meetingRequestSchema.index({ sender: 1, createdAt: -1 });
meetingRequestSchema.index({ recipient: 1, createdAt: -1 });
meetingRequestSchema.index({ status: 1, createdAt: -1 });
meetingRequestSchema.index({ scheduledDate: 1 });

// Calculate total compensation
meetingRequestSchema.virtual('totalCompensation').get(function() {
  if (this.compensation.type === 'monetary') {
    const { requestFee, tip, meetingFee } = this.compensation.monetaryOffer;
    return (requestFee || 0) + (tip || 0) + (meetingFee || 0);
  }
  return 0;
});

// Ensure virtuals are included in JSON
meetingRequestSchema.set('toJSON', { virtuals: true });
meetingRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MeetingRequest', meetingRequestSchema);
