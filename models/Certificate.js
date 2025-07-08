const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const CertificateSchema = new mongoose.Schema({
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
  shareId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Share',
    required: [true, 'Share ID is required'],
    validate: {
      validator: async function(v) {
        const Share = mongoose.model('Share');
        const share = await Share.findById(v);
        return share && share.isActive && share.shareholderId.toString() === this.shareholderId.toString();
      },
      message: 'Invalid share ID or share does not belong to this shareholder'
    }
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  originalFileName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true,
    maxlength: [255, 'Original file name cannot exceed 255 characters']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9._/-]+$/.test(v);
      },
      message: 'Invalid file URL format'
    }
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be at least 1 byte'],
    max: [10485760, 'File size cannot exceed 10MB'] // 10MB in bytes
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: {
      values: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
      message: 'Only PDF, JPEG, JPG, and PNG files are allowed'
    }
  },
  mimeType: {
    type: String,
    required: true
  },
  checksum: {
    type: String,
    required: [true, 'File checksum is required'],
    validate: {
      validator: function(v) {
        return /^[a-f0-9]{64}$/i.test(v); // SHA-256 hash
      },
      message: 'Invalid checksum format'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null for pending certificates
        const User = mongoose.model('User');
        return User.findById(v).then(user => {
          return user && (user.role === 'director' || user.role === 'super_admin');
        });
      },
      message: 'Only directors or super admins can review certificates'
    }
  },
  rejectionReason: {
    type: String,
    maxlength: [1000, 'Rejection reason cannot exceed 1000 characters'],
    trim: true,
    validate: {
      validator: function(v) {
        return this.status !== 'rejected' || (v && v.length > 0);
      },
      message: 'Rejection reason is required when status is rejected'
    }
  },
  approvalNotes: {
    type: String,
    maxlength: [1000, 'Approval notes cannot exceed 1000 characters'],
    trim: true
  },
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1']
  },
  previousVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    default: null
  },
  isLatestVersion: {
    type: Boolean,
    default: true
  },
  metadata: {
    pages: {
      type: Number,
      min: [1, 'PDF must have at least 1 page']
    },
    dimensions: {
      width: Number,
      height: Number
    },
    exifData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  securityFlags: {
    passwordProtected: {
      type: Boolean,
      default: false
    },
    encrypted: {
      type: Boolean,
      default: false
    },
    digitalSignature: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Don't expose file system paths in JSON
      if (ret.fileUrl && !ret.fileUrl.startsWith('http')) {
        ret.fileUrl = `/api/certificates/${ret._id}/download`;
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance and queries
CertificateSchema.index({ shareholderId: 1 });
CertificateSchema.index({ shareId: 1 });
CertificateSchema.index({ status: 1 });
CertificateSchema.index({ uploadedAt: -1 });
CertificateSchema.index({ reviewedAt: -1 });
CertificateSchema.index({ shareholderId: 1, status: 1 });
CertificateSchema.index({ reviewedBy: 1, reviewedAt: -1 });
CertificateSchema.index({ isLatestVersion: 1, shareholderId: 1 });

// Virtual for file extension
CertificateSchema.virtual('fileExtension').get(function() {
  return path.extname(this.originalFileName).toLowerCase();
});

// Virtual for human-readable file size
CertificateSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for days since upload
CertificateSchema.virtual('daysSinceUpload').get(function() {
  return Math.floor((Date.now() - this.uploadedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for processing time (if reviewed)
CertificateSchema.virtual('processingDays').get(function() {
  if (!this.reviewedAt) return null;
  return Math.floor((this.reviewedAt - this.uploadedAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware for version management
CertificateSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Check if there are existing certificates for this share
    const existingCerts = await this.constructor.find({
      shareholderId: this.shareholderId,
      shareId: this.shareId,
      isLatestVersion: true
    });
    
    if (existingCerts.length > 0) {
      // Mark previous certificates as not latest version
      await this.constructor.updateMany(
        {
          shareholderId: this.shareholderId,
          shareId: this.shareId,
          isLatestVersion: true
        },
        { 
          isLatestVersion: false 
        }
      );
      
      // Set version number
      const latestVersion = Math.max(...existingCerts.map(cert => cert.version));
      this.version = latestVersion + 1;
      this.previousVersionId = existingCerts[0]._id;
    }
  }
  next();
});

// Pre-save middleware for status change validation
CertificateSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'approved' || this.status === 'rejected') {
      if (!this.reviewedBy) {
        return next(new Error('Reviewed by is required when approving or rejecting'));
      }
      if (!this.reviewedAt) {
        this.reviewedAt = new Date();
      }
    }
    
    if (this.status === 'rejected' && !this.rejectionReason) {
      return next(new Error('Rejection reason is required when rejecting certificate'));
    }
  }
  next();
});

// Method to approve certificate
CertificateSchema.methods.approve = function(reviewerId, notes) {
  this.status = 'approved';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.approvalNotes = notes;
  this.rejectionReason = undefined;
  return this.save();
};

// Method to reject certificate
CertificateSchema.methods.reject = function(reviewerId, reason) {
  if (!reason || reason.trim().length === 0) {
    throw new Error('Rejection reason is required');
  }
  
  this.status = 'rejected';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  this.approvalNotes = undefined;
  return this.save();
};

// Method to check file existence
CertificateSchema.methods.fileExists = function() {
  return fs.existsSync(this.fileUrl);
};

// Method to delete file from filesystem
CertificateSchema.methods.deleteFile = function() {
  try {
    if (this.fileExists()) {
      fs.unlinkSync(this.fileUrl);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Static method to get certificates with Chinese Wall enforcement
CertificateSchema.statics.findWithAccess = function(requestingUser, filters = {}) {
  if (requestingUser.role === 'director' || requestingUser.role === 'super_admin') {
    // Directors and super admins can see all certificates
    return this.find(filters)
      .populate('shareholderId', 'profile.name email')
      .populate('shareId', 'numberOfShares units')
      .populate('reviewedBy', 'profile.name')
      .sort({ uploadedAt: -1 });
  } else if (requestingUser.role === 'shareholder') {
    // Shareholders can only see their own certificates
    return this.find({ ...filters, shareholderId: requestingUser._id })
      .populate('shareId', 'numberOfShares units')
      .populate('reviewedBy', 'profile.name')
      .sort({ uploadedAt: -1 });
  } else {
    // Visitors can't see certificate data
    return Promise.resolve([]);
  }
};

// Static method to get pending certificates count
CertificateSchema.statics.getPendingCount = function() {
  return this.countDocuments({ status: 'pending' });
};

// Static method to get certificates by status
CertificateSchema.statics.getByStatus = function(status, requestingUser) {
  const filters = { status };
  return this.findWithAccess(requestingUser, filters);
};

// Static method to bulk approve certificates for a shareholder
CertificateSchema.statics.bulkApproveForShareholder = function(shareholderId, reviewerId, notes) {
  return this.updateMany(
    { 
      shareholderId,
      status: 'pending'
    },
    {
      status: 'approved',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      approvalNotes: notes
    }
  );
};

// Static method to bulk reject certificates for a shareholder
CertificateSchema.statics.bulkRejectForShareholder = function(shareholderId, reviewerId, reason) {
  if (!reason || reason.trim().length === 0) {
    throw new Error('Rejection reason is required for bulk rejection');
  }
  
  return this.updateMany(
    { 
      shareholderId,
      status: 'pending'
    },
    {
      status: 'rejected',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: reason
    }
  );
};

// Method to clean up old versions
CertificateSchema.statics.cleanupOldVersions = function(shareholderId, shareId, keepLatest = 3) {
  return this.find({
    shareholderId,
    shareId,
    isLatestVersion: false
  })
  .sort({ version: -1 })
  .skip(keepLatest - 1)
  .then(oldVersions => {
    const deletePromises = oldVersions.map(cert => {
      cert.deleteFile();
      return cert.remove();
    });
    return Promise.all(deletePromises);
  });
};

const Certificate = mongoose.model('Certificate', CertificateSchema);

module.exports = Certificate;