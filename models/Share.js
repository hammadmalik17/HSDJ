const mongoose = require('mongoose');

const ShareHistorySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['assigned', 'modified', 'transferred', 'deleted', 'value_updated'],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  previousValue: {
    numberOfShares: Number,
    unitValue: Number,
    currentValue: Number
  },
  newValue: {
    numberOfShares: Number,
    unitValue: Number,
    currentValue: Number
  },
  reason: {
    type: String,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, { _id: true });

const ShareSchema = new mongoose.Schema({
  shareholderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Shareholder ID is required'],
    validate: {
      validator: async function(v) {
        const User = mongoose.model('User');
        const user = await User.findById(v);
        return user && (user.role === 'shareholder' || user.role === 'director');
      },
      message: 'Invalid shareholder ID or user is not a shareholder/director'
    }
  },
  numberOfShares: {
    type: Number,
    required: [true, 'Number of shares is required'],
    min: [1, 'Number of shares must be at least 1'],
    max: [1000000, 'Number of shares cannot exceed 1,000,000'],
    validate: {
      validator: Number.isInteger,
      message: 'Number of shares must be a whole number'
    }
  },
  sharePrice: {
    type: Number,
    required: [true, 'Share price is required'],
    min: [0.01, 'Share price must be at least 0.01'],
    max: [100000, 'Share price cannot exceed 100,000'],
    validate: {
      validator: function(v) {
        return Number.isFinite(v) && v > 0;
      },
      message: 'Share price must be a valid positive number'
    }
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required'],
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Purchase date cannot be in the future'
    }
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: [0.01, 'Purchase price must be at least 0.01'],
    validate: {
      validator: function(v) {
        return Number.isFinite(v) && v > 0;
      },
      message: 'Purchase price must be a valid positive number'
    }
  },
  currentValue: {
    type: Number,
    required: true,
    min: [0, 'Current value cannot be negative'],
    validate: {
      validator: function(v) {
        return Number.isFinite(v) && v >= 0;
      },
      message: 'Current value must be a valid non-negative number'
    }
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned by is required'],
    validate: {
      validator: async function(v) {
        const User = mongoose.model('User');
        const user = await User.findById(v);
        return user && (user.role === 'director' || user.role === 'super_admin');
      },
      message: 'Only directors or super admins can assign shares'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    trim: true
  },
  history: [ShareHistorySchema],
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ShareSchema.index({ shareholderId: 1 });
ShareSchema.index({ isActive: 1 });
ShareSchema.index({ purchaseDate: -1 });
ShareSchema.index({ assignedBy: 1 });
ShareSchema.index({ shareholderId: 1, isActive: 1 });

// Virtual for calculating units (5000 shares = 1 unit)
ShareSchema.virtual('units').get(function() {
  return Math.floor(this.numberOfShares / 5000);
});

// Virtual for remaining shares after units
ShareSchema.virtual('remainingShares').get(function() {
  return this.numberOfShares % 5000;
});

// Virtual for total investment value
ShareSchema.virtual('totalInvestment').get(function() {
  return this.numberOfShares * this.purchasePrice;
});

// Virtual for profit/loss
ShareSchema.virtual('profitLoss').get(function() {
  return this.currentValue - this.totalInvestment;
});

// Virtual for percentage return
ShareSchema.virtual('percentageReturn').get(function() {
  if (this.totalInvestment === 0) return 0;
  return ((this.currentValue - this.totalInvestment) / this.totalInvestment) * 100;
});

// Pre-save middleware to calculate current value
ShareSchema.pre('save', function(next) {
  // Calculate current value if not manually set
  if (this.isModified('numberOfShares') || this.isModified('sharePrice')) {
    this.currentValue = this.numberOfShares * this.sharePrice;
  }
  next();
});

// Pre-save middleware to add history entry
ShareSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add initial assignment to history
    this.history.push({
      action: 'assigned',
      performedBy: this.assignedBy,
      newValue: {
        numberOfShares: this.numberOfShares,
        unitValue: this.sharePrice,
        currentValue: this.currentValue
      },
      reason: 'Initial share assignment'
    });
  } else if (this.isModified('numberOfShares') || this.isModified('sharePrice')) {
    // Add modification to history
    const originalShare = this.constructor.findById(this._id);
    this.history.push({
      action: 'modified',
      performedBy: this.lastModifiedBy,
      previousValue: {
        numberOfShares: this._original?.numberOfShares || 0,
        unitValue: this._original?.sharePrice || 0,
        currentValue: this._original?.currentValue || 0
      },
      newValue: {
        numberOfShares: this.numberOfShares,
        unitValue: this.sharePrice,
        currentValue: this.currentValue
      },
      reason: 'Share details updated'
    });
  }
  next();
});

// Method to add history entry
ShareSchema.methods.addHistoryEntry = function(action, performedBy, reason, notes) {
  this.history.push({
    action,
    performedBy,
    previousValue: {
      numberOfShares: this.numberOfShares,
      unitValue: this.sharePrice,
      currentValue: this.currentValue
    },
    reason,
    notes
  });
};

// Method to update share value
ShareSchema.methods.updateValue = function(newSharePrice, performedBy, reason) {
  const oldValue = this.currentValue;
  const oldPrice = this.sharePrice;
  
  this.sharePrice = newSharePrice;
  this.currentValue = this.numberOfShares * newSharePrice;
  this.lastModifiedBy = performedBy;
  
  this.history.push({
    action: 'value_updated',
    performedBy,
    previousValue: {
      numberOfShares: this.numberOfShares,
      unitValue: oldPrice,
      currentValue: oldValue
    },
    newValue: {
      numberOfShares: this.numberOfShares,
      unitValue: newSharePrice,
      currentValue: this.currentValue
    },
    reason: reason || 'Share value updated'
  });
  
  return this.save();
};

// Method to transfer shares (change ownership)
ShareSchema.methods.transferTo = function(newShareholderId, performedBy, reason) {
  const oldShareholderId = this.shareholderId;
  
  this.shareholderId = newShareholderId;
  this.lastModifiedBy = performedBy;
  
  this.history.push({
    action: 'transferred',
    performedBy,
    reason: reason || 'Share ownership transferred',
    notes: `Transferred from ${oldShareholderId} to ${newShareholderId}`
  });
  
  return this.save();
};

// Method to soft delete shares
ShareSchema.methods.softDelete = function(performedBy, reason) {
  this.isActive = false;
  this.lastModifiedBy = performedBy;
  
  this.history.push({
    action: 'deleted',
    performedBy,
    reason: reason || 'Share record deleted'
  });
  
  return this.save();
};

// Static method to get shares with Chinese Wall enforcement
ShareSchema.statics.findWithAccess = function(requestingUser, filters = {}) {
  const baseFilter = { isActive: true, ...filters };
  
  if (requestingUser.role === 'director' || requestingUser.role === 'super_admin') {
    // Directors and super admins can see all shares
    return this.find(baseFilter).populate('shareholderId', 'profile.name email role').populate('assignedBy', 'profile.name');
  } else if (requestingUser.role === 'shareholder') {
    // Shareholders can only see their own shares
    return this.find({ ...baseFilter, shareholderId: requestingUser._id }).populate('assignedBy', 'profile.name');
  } else {
    // Visitors can't see share data
    return Promise.resolve([]);
  }
};

// Static method to calculate total shares for a user
ShareSchema.statics.getTotalSharesForUser = function(userId) {
  return this.aggregate([
    { $match: { shareholderId: mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: '$shareholderId',
        totalShares: { $sum: '$numberOfShares' },
        totalValue: { $sum: '$currentValue' },
        totalInvestment: { $sum: { $multiply: ['$numberOfShares', '$purchasePrice'] } },
        shareCount: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get portfolio summary
ShareSchema.statics.getPortfolioSummary = function(userId = null) {
  const matchFilter = userId ? 
    { shareholderId: mongoose.Types.ObjectId(userId), isActive: true } : 
    { isActive: true };
    
  return this.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: userId ? '$shareholderId' : null,
        totalShares: { $sum: '$numberOfShares' },
        totalUnits: { $sum: { $floor: { $divide: ['$numberOfShares', 5000] } } },
        totalCurrentValue: { $sum: '$currentValue' },
        totalInvestment: { $sum: { $multiply: ['$numberOfShares', '$purchasePrice'] } },
        shareRecords: { $sum: 1 },
        averageSharePrice: { $avg: '$sharePrice' },
        oldestPurchase: { $min: '$purchaseDate' },
        newestPurchase: { $max: '$purchaseDate' }
      }
    },
    {
      $addFields: {
        profitLoss: { $subtract: ['$totalCurrentValue', '$totalInvestment'] },
        percentageReturn: {
          $cond: {
            if: { $eq: ['$totalInvestment', 0] },
            then: 0,
            else: {
              $multiply: [
                { $divide: [
                  { $subtract: ['$totalCurrentValue', '$totalInvestment'] },
                  '$totalInvestment'
                ]},
                100
              ]
            }
          }
        }
      }
    }
  ]);
};

const Share = mongoose.model('Share', ShareSchema);

module.exports = Share;