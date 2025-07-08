const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required for audit log']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      // Authentication actions
      'login', 'logout', 'login_failed', 'password_reset', 'password_changed',
      'account_locked', 'account_unlocked', '2fa_enabled', '2fa_disabled',
      
      // User management actions
      'user_created', 'user_updated', 'user_deleted', 'user_restored',
      'role_changed', 'profile_updated',
      
      // Share management actions
      'share_assigned', 'share_updated', 'share_transferred', 'share_deleted',
      'share_value_updated',
      
      // Certificate actions
      'certificate_uploaded', 'certificate_approved', 'certificate_rejected',
      'certificate_downloaded', 'certificate_deleted',
      
      // System actions
      'system_access', 'data_export', 'data_import', 'settings_changed',
      'bulk_operation', 'report_generated'
    ]
  },
  targetType: {
    type: String,
    enum: ['User', 'Share', 'Certificate', 'System', null],
    default: null
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  targetEmail: {
    type: String,
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  beforeState: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  afterState: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    validate: {
      validator: function(v) {
        // Basic IP validation (IPv4 and IPv6)
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(v) || ipv6Regex.test(v) || v === '::1' || v === 'localhost';
      },
      message: 'Invalid IP address format'
    }
  },
  userAgent: {
    type: String,
    required: [true, 'User agent is required'],
    maxlength: [1000, 'User agent cannot exceed 1000 characters']
  },
  sessionId: {
    type: String,
    default: null
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String,
    maxlength: [1000, 'Error message cannot exceed 1000 characters'],
    default: null
  },
  duration: {
    type: Number, // in milliseconds
    min: [0, 'Duration cannot be negative'],
    default: null
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  category: {
    type: String,
    enum: ['auth', 'user_mgmt', 'share_mgmt', 'certificate_mgmt', 'system', 'security'],
    required: [true, 'Category is required']
  },
  riskyAction: {
    type: Boolean,
    default: false
  },
  metadata: {
    browser: String,
    os: String,
    device: String,
    location: {
      country: String,
      city: String,
      timezone: String
    },
    fileSize: Number,
    fileName: String,
    recordsAffected: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ ipAddress: 1, createdAt: -1 });
AuditLogSchema.index({ category: 1, severity: 1 });
AuditLogSchema.index({ riskyAction: 1, createdAt: -1 });
AuditLogSchema.index({ success: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // Auto-delete after 1 year

// Virtual for human-readable duration
AuditLogSchema.virtual('durationFormatted').get(function() {
  if (!this.duration) return null;
  if (this.duration < 1000) return `${this.duration}ms`;
  if (this.duration < 60000) return `${(this.duration / 1000).toFixed(2)}s`;
  return `${(this.duration / 60000).toFixed(2)}m`;
});

// Virtual for time ago
AuditLogSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Static method to create audit log entry
AuditLogSchema.statics.createLog = function(logData) {
  // Set severity based on action
  if (!logData.severity) {
    logData.severity = this.getSeverityForAction(logData.action);
  }
  
  // Set category based on action
  if (!logData.category) {
    logData.category = this.getCategoryForAction(logData.action);
  }
  
  // Mark risky actions
  if (!logData.hasOwnProperty('riskyAction')) {
    logData.riskyAction = this.isRiskyAction(logData.action);
  }
  
  return this.create(logData);
};

// Static method to determine severity
AuditLogSchema.statics.getSeverityForAction = function(action) {
  const highSeverityActions = [
    'user_deleted', 'role_changed', 'share_deleted', 'account_locked',
    'password_reset', 'bulk_operation'
  ];
  
  const mediumSeverityActions = [
    'login_failed', 'user_created', 'share_assigned', 'certificate_rejected',
    'password_changed', '2fa_disabled'
  ];
  
  const criticalSeverityActions = [
    'system_access', 'data_export', 'settings_changed'
  ];
  
  if (criticalSeverityActions.includes(action)) return 'critical';
  if (highSeverityActions.includes(action)) return 'high';
  if (mediumSeverityActions.includes(action)) return 'medium';
  return 'low';
};

// Static method to determine category
AuditLogSchema.statics.getCategoryForAction = function(action) {
  const authActions = ['login', 'logout', 'login_failed', 'password_reset', 'password_changed', '2fa_enabled', '2fa_disabled'];
  const userMgmtActions = ['user_created', 'user_updated', 'user_deleted', 'user_restored', 'role_changed', 'profile_updated'];
  const shareMgmtActions = ['share_assigned', 'share_updated', 'share_transferred', 'share_deleted', 'share_value_updated'];
  const certificateMgmtActions = ['certificate_uploaded', 'certificate_approved', 'certificate_rejected', 'certificate_downloaded', 'certificate_deleted'];
  const systemActions = ['system_access', 'data_export', 'data_import', 'settings_changed', 'report_generated'];
  const securityActions = ['account_locked', 'account_unlocked', 'bulk_operation'];
  
  if (authActions.includes(action)) return 'auth';
  if (userMgmtActions.includes(action)) return 'user_mgmt';
  if (shareMgmtActions.includes(action)) return 'share_mgmt';
  if (certificateMgmtActions.includes(action)) return 'certificate_mgmt';
  if (systemActions.includes(action)) return 'system';
  if (securityActions.includes(action)) return 'security';
  return 'system';
};

// Static method to check if action is risky
AuditLogSchema.statics.isRiskyAction = function(action) {
  const riskyActions = [
    'user_deleted', 'role_changed', 'share_deleted', 'share_transferred',
    'bulk_operation', 'data_export', 'settings_changed', 'system_access'
  ];
  return riskyActions.includes(action);
};

// Static method to get logs with access control
AuditLogSchema.statics.findWithAccess = function(requestingUser, filters = {}, options = {}) {
  const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
  
  if (requestingUser.role === 'super_admin') {
    // Super admin can see all logs
    return this.find(filters)
      .populate('userId', 'profile.name email role')
      .sort(sort)
      .limit(limit)
      .skip(skip);
  } else if (requestingUser.role === 'director') {
    // Directors can see most logs except super admin actions
    return this.find({
      ...filters,
      userId: { $ne: requestingUser._id }, // Can't see their own logs for security
      action: { $nin: ['system_access', 'settings_changed'] } // Can't see system-level actions
    })
      .populate('userId', 'profile.name email role')
      .sort(sort)
      .limit(limit)
      .skip(skip);
  } else if (requestingUser.role === 'shareholder') {
    // Shareholders can only see their own non-sensitive logs
    return this.find({
      ...filters,
      userId: requestingUser._id,
      category: { $in: ['auth', 'certificate_mgmt'] }, // Only auth and certificate actions
      action: { $nin: ['password_changed', 'password_reset'] } // No password-related logs
    })
      .sort(sort)
      .limit(limit)
      .skip(skip);
  } else {
    // Visitors can't see logs
    return Promise.resolve([]);
  }
};

// Static method to get security alerts
AuditLogSchema.statics.getSecurityAlerts = function(timeframe = 24) { // hours
  const since = new Date(Date.now() - (timeframe * 60 * 60 * 1000));
  
  return this.find({
    createdAt: { $gte: since },
    $or: [
      { riskyAction: true },
      { severity: { $in: ['high', 'critical'] } },
      { success: false, category: 'auth' },
      { action: 'login_failed' }
    ]
  })
    .populate('userId', 'profile.name email role')
    .sort({ createdAt: -1 });
};

// Static method to get activity summary
AuditLogSchema.statics.getActivitySummary = function(userId = null, timeframe = 30) { // days
  const since = new Date(Date.now() - (timeframe * 24 * 60 * 60 * 1000));
  const matchFilter = { createdAt: { $gte: since } };
  
  if (userId) {
    matchFilter.userId = mongoose.Types.ObjectId(userId);
  }
  
  return this.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          category: '$category',
          action: '$action'
        },
        count: { $sum: 1 },
        successCount: { $sum: { $cond: ['$success', 1, 0] } },
        failureCount: { $sum: { $cond: ['$success', 0, 1] } },
        lastOccurrence: { $max: '$createdAt' }
      }
    },
    {
      $group: {
        _id: '$_id.category',
        actions: {
          $push: {
            action: '$_id.action',
            count: '$count',
            successCount: '$successCount',
            failureCount: '$failureCount',
            lastOccurrence: '$lastOccurrence'
          }
        },
        totalActions: { $sum: '$count' },
        totalSuccess: { $sum: '$successCount' },
        totalFailures: { $sum: '$failureCount' }
      }
    },
    { $sort: { totalActions: -1 } }
  ]);
};

// Static method to get failed login attempts
AuditLogSchema.statics.getFailedLoginAttempts = function(timeframe = 24) { // hours
  const since = new Date(Date.now() - (timeframe * 60 * 60 * 1000));
  
  return this.aggregate([
    {
      $match: {
        action: 'login_failed',
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: {
          userId: '$userId',
          ipAddress: '$ipAddress'
        },
        attempts: { $sum: 1 },
        lastAttempt: { $max: '$createdAt' },
        userAgent: { $last: '$userAgent' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        userId: '$_id.userId',
        ipAddress: '$_id.ipAddress',
        attempts: 1,
        lastAttempt: 1,
        userAgent: 1,
        userEmail: '$user.email',
        userName: '$user.profile.name'
      }
    },
    { $sort: { attempts: -1, lastAttempt: -1 } }
  ]);
};

// Static method to track user activity patterns
AuditLogSchema.statics.getUserActivityPattern = function(userId, days = 30) {
  const since = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          hour: { $hour: '$createdAt' }
        },
        activityCount: { $sum: 1 },
        actions: { $addToSet: '$action' }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        hourlyActivity: {
          $push: {
            hour: '$_id.hour',
            count: '$activityCount',
            actions: '$actions'
          }
        },
        dailyTotal: { $sum: '$activityCount' }
      }
    },
    { $sort: { _id: -1 } }
  ]);
};

// Static method to detect suspicious activity
AuditLogSchema.statics.detectSuspiciousActivity = function(timeframe = 24) { // hours
  const since = new Date(Date.now() - (timeframe * 60 * 60 * 1000));
  
  return Promise.all([
    // Multiple failed logins from same IP
    this.aggregate([
      {
        $match: {
          action: 'login_failed',
          createdAt: { $gte: since }
        }
      },
      {
        $group: {
          _id: '$ipAddress',
          attempts: { $sum: 1 },
          users: { $addToSet: '$userId' },
          lastAttempt: { $max: '$createdAt' }
        }
      },
      {
        $match: { attempts: { $gte: 5 } }
      },
      {
        $project: {
          ipAddress: '$_id',
          attempts: 1,
          uniqueUsers: { $size: '$users' },
          lastAttempt: 1,
          alertType: { $literal: 'multiple_failed_logins' }
        }
      }
    ]),
    
    // Unusual access patterns (login from new location/device)
    this.aggregate([
      {
        $match: {
          action: 'login',
          success: true,
          createdAt: { $gte: since }
        }
      },
      {
        $group: {
          _id: '$userId',
          uniqueIPs: { $addToSet: '$ipAddress' },
          uniqueUserAgents: { $addToSet: '$userAgent' },
          loginCount: { $sum: 1 }
        }
      },
      {
        $match: {
          $or: [
            { $expr: { $gt: [{ $size: '$uniqueIPs' }, 3] } },
            { $expr: { $gt: [{ $size: '$uniqueUserAgents' }, 2] } }
          ]
        }
      },
      {
        $project: {
          userId: '$_id',
          uniqueIPs: { $size: '$uniqueIPs' },
          uniqueUserAgents: { $size: '$uniqueUserAgents' },
          loginCount: 1,
          alertType: { $literal: 'unusual_access_pattern' }
        }
      }
    ]),
    
    // Bulk operations outside business hours
    this.aggregate([
      {
        $match: {
          action: 'bulk_operation',
          createdAt: { $gte: since },
          $expr: {
            $or: [
              { $lt: [{ $hour: '$createdAt' }, 8] },
              { $gt: [{ $hour: '$createdAt' }, 18] }
            ]
          }
        }
      },
      {
        $project: {
          userId: 1,
          action: 1,
          createdAt: 1,
          details: 1,
          alertType: { $literal: 'after_hours_bulk_operation' }
        }
      }
    ])
  ]);
};

// Static method for data retention cleanup
AuditLogSchema.statics.cleanupOldLogs = function(retentionDays = 365) {
  const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000));
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    severity: { $nin: ['high', 'critical'] }, // Keep important logs longer
    riskyAction: false // Keep risky action logs longer
  });
};

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

module.exports = AuditLog;