const mongoose = require('mongoose');

const DeletedUserSchema = new mongoose.Schema({
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  userData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  shares: [{
    type: mongoose.Schema.Types.Mixed
  }],
  certificates: [{
    type: mongoose.Schema.Types.Mixed
  }],
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deletedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  deletionReason: {
    type: String,
    required: true,
    maxlength: 1000
  },
  permanentDeleteAt: {
    type: Date,
    default: function() {
      // Auto-delete after 90 days
      return new Date(Date.now() + (90 * 24 * 60 * 60 * 1000));
    }
  },
  restoredAt: {
    type: Date,
    default: null
  },
  restoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for auto-deletion
DeletedUserSchema.index({ permanentDeleteAt: 1 }, { expireAfterSeconds: 0 });
DeletedUserSchema.index({ deletedAt: -1 });
DeletedUserSchema.index({ originalId: 1 });

const DeletedUser = mongoose.model('DeletedUser', DeletedUserSchema);

module.exports = DeletedUser;