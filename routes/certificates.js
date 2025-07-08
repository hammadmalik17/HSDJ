const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const Certificate = require('../models/Certificate');
const Share = require('../models/Share');
const AuditLog = require('../models/AuditLog');
const { requireRole, enforceChineseWall, sensitiveOperationLimiter } = require('../middleware/auth');
const { notifyDirectors } = require('../utils/email');

const router = express.Router();

// Configure multer for certificate uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_PATH || './uploads/certificates/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `cert-${req.user._id}-${uniqueSuffix}-${sanitizedOriginalName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|jpeg|jpg|png/;
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimes.includes(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JPEG, JPG, and PNG files are allowed'));
    }
  }
});

// Helper function to calculate file checksum
const calculateChecksum = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
};

// Get certificates (with Chinese Wall enforcement)
router.get('/', enforceChineseWall('certificate'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, shareholderId } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (shareholderId) filters.shareholderId = shareholderId;
    
    const certificates = await Certificate.findWithAccess(req.user, filters)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Certificate.countDocuments(filters);
    
    res.json({
      success: true,
      data: {
        certificates: certificates.map(cert => ({
          id: cert._id,
          shareholderId: cert.shareholderId?._id,
          shareholderName: cert.shareholderId?.profile?.name,
          shareId: cert.shareId?._id,
          fileName: cert.originalFileName,
          fileSize: cert.fileSizeFormatted,
          fileType: cert.fileType,
          status: cert.status,
          uploadedAt: cert.uploadedAt,
          reviewedAt: cert.reviewedAt,
          reviewedBy: cert.reviewedBy?.profile?.name,
          rejectionReason: cert.rejectionReason,
          daysSinceUpload: cert.daysSinceUpload,
          processingDays: cert.processingDays,
          version: cert.version,
          isLatestVersion: cert.isLatestVersion
        })),
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates'
    });
  }
});

// Get specific certificate
router.get('/:certificateId', enforceChineseWall('certificate'), async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await Certificate.findById(certificateId)
      .populate('shareholderId', 'profile.name email')
      .populate('shareId', 'numberOfShares units')
      .populate('reviewedBy', 'profile.name');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // Check Chinese Wall access
    if (req.user.role === 'shareholder' && certificate.shareholderId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        certificate: {
          id: certificate._id,
          shareholder: {
            id: certificate.shareholderId._id,
            name: certificate.shareholderId.profile.name,
            email: certificate.shareholderId.email
          },
          share: {
            id: certificate.shareId._id,
            numberOfShares: certificate.shareId.numberOfShares,
            units: certificate.shareId.units
          },
          fileName: certificate.originalFileName,
          fileSize: certificate.fileSizeFormatted,
          fileType: certificate.fileType,
          status: certificate.status,
          uploadedAt: certificate.uploadedAt,
          reviewedAt: certificate.reviewedAt,
          reviewedBy: certificate.reviewedBy?.profile?.name,
          rejectionReason: certificate.rejectionReason,
          approvalNotes: certificate.approvalNotes,
          version: certificate.version,
          isLatestVersion: certificate.isLatestVersion,
          daysSinceUpload: certificate.daysSinceUpload,
          processingDays: certificate.processingDays,
          metadata: certificate.metadata,
          securityFlags: certificate.securityFlags
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate'
    });
  }
});

// Upload certificate
router.post('/upload', upload.single('certificate'), [
  body('shareId').isMongoId().withMessage('Valid share ID is required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { shareId, notes } = req.body;
    
    // Verify share exists and belongs to user (Chinese Wall)
    const share = await Share.findById(shareId);
    if (!share) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }
    
    // Check if user can upload for this share
    if (req.user.role === 'shareholder' && share.shareholderId.toString() !== req.user._id.toString()) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: 'You can only upload certificates for your own shares'
      });
    }
    
    // Calculate file checksum
    const checksum = await calculateChecksum(req.file.path);
    
    // Check for duplicate files
    const existingCert = await Certificate.findOne({
      shareholderId: share.shareholderId,
      checksum: checksum,
      status: { $ne: 'rejected' }
    });
    
    if (existingCert) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'This file has already been uploaded'
      });
    }
    
    // Create certificate record
    const certificate = new Certificate({
      shareholderId: share.shareholderId,
      shareId: shareId,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      fileUrl: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      mimeType: req.file.mimetype,
      checksum: checksum,
      metadata: {
        uploadNotes: notes
      }
    });
    
    await certificate.save();
    
    // Log certificate upload
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'certificate_uploaded',
      targetType: 'Certificate',
      targetId: certificate._id,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        shareId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      },
      severity: 'low',
      category: 'certificate_mgmt'
    });
    
    // Notify directors about new certificate upload
    try {
      await notifyDirectors({
        subject: 'New Certificate Upload Pending Review',
        message: `A new certificate has been uploaded by ${req.user.profile.name} and is pending review.`,
        data: {
          shareholder: req.user.profile.name,
          fileName: req.file.originalname,
          shareId: shareId,
          uploadedAt: new Date()
        }
      });
    } catch (emailError) {
      console.error('Failed to notify directors:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: {
        certificate: {
          id: certificate._id,
          fileName: certificate.originalFileName,
          fileSize: certificate.fileSizeFormatted,
          status: certificate.status,
          uploadedAt: certificate.uploadedAt,
          version: certificate.version
        }
      }
    });
    
  } catch (error) {
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'certificate_uploaded',
      success: false,
      errorMessage: error.message,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      severity: 'medium',
      category: 'certificate_mgmt'
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload certificate'
    });
  }
});

// Approve certificate (Directors only)
router.put('/:certificateId/approve', requireRole('director', 'super_admin'), [
  body('notes').optional().isLength({ max: 1000 }).withMessage('Approval notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { notes } = req.body;
    
    const certificate = await Certificate.findById(certificateId)
      .populate('shareholderId', 'profile.name email');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    if (certificate.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Certificate is already ${certificate.status}`
      });
    }
    
    // Approve certificate
    await certificate.approve(req.user._id, notes);
    
    // Log approval
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'certificate_approved',
      targetType: 'Certificate',
      targetId: certificate._id,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        shareholderId: certificate.shareholderId._id,
        shareholderName: certificate.shareholderId.profile.name,
        fileName: certificate.originalFileName,
        approvalNotes: notes
      },
      severity: 'medium',
      category: 'certificate_mgmt'
    });
    
    res.json({
      success: true,
      message: 'Certificate approved successfully',
      data: {
        certificate: {
          id: certificate._id,
          status: certificate.status,
          reviewedAt: certificate.reviewedAt,
          approvalNotes: certificate.approvalNotes
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve certificate'
    });
  }
});

// Reject certificate (Directors only)
router.put('/:certificateId/reject', requireRole('director', 'super_admin'), [
  body('reason').isLength({ min: 1, max: 1000 }).withMessage('Rejection reason is required and cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const certificate = await Certificate.findById(certificateId)
      .populate('shareholderId', 'profile.name email');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    if (certificate.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Certificate is already ${certificate.status}`
      });
    }
    
    // Reject certificate
    await certificate.reject(req.user._id, reason);
    
    // Log rejection
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'certificate_rejected',
      targetType: 'Certificate',
      targetId: certificate._id,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        shareholderId: certificate.shareholderId._id,
        shareholderName: certificate.shareholderId.profile.name,
        fileName: certificate.originalFileName,
        rejectionReason: reason
      },
      severity: 'medium',
      category: 'certificate_mgmt'
    });
    
    res.json({
      success: true,
      message: 'Certificate rejected successfully',
      data: {
        certificate: {
          id: certificate._id,
          status: certificate.status,
          reviewedAt: certificate.reviewedAt,
          rejectionReason: certificate.rejectionReason
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject certificate'
    });
  }
});

// Bulk approve certificates for a shareholder (Directors only)
router.put('/bulk/approve/:shareholderId', requireRole('director', 'super_admin'), [
  body('notes').optional().isLength({ max: 1000 }).withMessage('Approval notes cannot exceed 1000 characters')
], sensitiveOperationLimiter(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const { shareholderId } = req.params;
    const { notes } = req.body;
    
    // Verify shareholder exists
    const User = require('../models/User');
    const shareholder = await User.findById(shareholderId);
    if (!shareholder) {
      return res.status(404).json({
        success: false,
        message: 'Shareholder not found'
      });
    }
    
    // Get pending certificates count
    const pendingCount = await Certificate.countDocuments({
      shareholderId,
      status: 'pending'
    });
    
    if (pendingCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending certificates found for this shareholder'
      });
    }
    
    // Bulk approve
    const result = await Certificate.bulkApproveForShareholder(shareholderId, req.user._id, notes);
    
    // Log bulk approval
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'bulk_operation',
      targetType: 'Certificate',
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        operation: 'bulk_approve_certificates',
        shareholderId,
        shareholderName: shareholder.profile.name,
        certificatesApproved: result.modifiedCount,
        approvalNotes: notes
      },
      severity: 'high',
      category: 'certificate_mgmt',
      riskyAction: true
    });
    
    res.json({
      success: true,
      message: `Successfully approved ${result.modifiedCount} certificates`,
      data: {
        certificatesApproved: result.modifiedCount,
        shareholderName: shareholder.profile.name
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to bulk approve certificates'
    });
  }
});

// Bulk reject certificates for a shareholder (Directors only)
router.put('/bulk/reject/:shareholderId', requireRole('director', 'super_admin'), [
  body('reason').isLength({ min: 1, max: 1000 }).withMessage('Rejection reason is required and cannot exceed 1000 characters')
], sensitiveOperationLimiter(3, 30 * 60 * 1000), async (req, res) => {
  try {
    const { shareholderId } = req.params;
    const { reason } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Verify shareholder exists
    const User = require('../models/User');
    const shareholder = await User.findById(shareholderId);
    if (!shareholder) {
      return res.status(404).json({
        success: false,
        message: 'Shareholder not found'
      });
    }
    
    // Get pending certificates count
    const pendingCount = await Certificate.countDocuments({
      shareholderId,
      status: 'pending'
    });
    
    if (pendingCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending certificates found for this shareholder'
      });
    }
    
    // Bulk reject
    const result = await Certificate.bulkRejectForShareholder(shareholderId, req.user._id, reason);
    
    // Log bulk rejection
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'bulk_operation',
      targetType: 'Certificate',
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        operation: 'bulk_reject_certificates',
        shareholderId,
        shareholderName: shareholder.profile.name,
        certificatesRejected: result.modifiedCount,
        rejectionReason: reason
      },
      severity: 'high',
      category: 'certificate_mgmt',
      riskyAction: true
    });
    
    res.json({
      success: true,
      message: `Successfully rejected ${result.modifiedCount} certificates`,
      data: {
        certificatesRejected: result.modifiedCount,
        shareholderName: shareholder.profile.name
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to bulk reject certificates'
    });
  }
});

// Download certificate file
router.get('/:certificateId/download', enforceChineseWall('certificate'), async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await Certificate.findById(certificateId);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // Check Chinese Wall access
    if (req.user.role === 'shareholder' && certificate.shareholderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if file exists
    if (!certificate.fileExists()) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found on server'
      });
    }
    
    // Log download
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'certificate_downloaded',
      targetType: 'Certificate',
      targetId: certificate._id,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        fileName: certificate.originalFileName,
        fileSize: certificate.fileSize
      },
      severity: 'low',
      category: 'certificate_mgmt'
    });
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.originalFileName}"`);
    res.setHeader('Content-Type', certificate.fileType);
    res.setHeader('Content-Length', certificate.fileSize);
    
    // Stream file to response
    const fileStream = fs.createReadStream(certificate.fileUrl);
    fileStream.pipe(res);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download certificate'
    });
  }
});

// Delete certificate (Directors only or own certificates)
router.delete('/:certificateId', enforceChineseWall('certificate'), [
  body('reason').optional().isLength({ max: 500 }).withMessage('Deletion reason cannot exceed 500 characters')
], async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body;
    
    const certificate = await Certificate.findById(certificateId)
      .populate('shareholderId', 'profile.name email');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // Check permissions - directors can delete any, shareholders can only delete their own pending/rejected certificates
    if (req.user.role === 'shareholder') {
      if (certificate.shareholderId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      if (certificate.status === 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete approved certificates'
        });
      }
    }
    
    // Delete file from filesystem
    certificate.deleteFile();
    
    // Remove from database
    await certificate.remove();
    
    // Log deletion
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'certificate_deleted',
      targetType: 'Certificate',
      targetId: certificate._id,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        shareholderId: certificate.shareholderId._id,
        shareholderName: certificate.shareholderId.profile.name,
        fileName: certificate.originalFileName,
        status: certificate.status,
        reason: reason || 'No reason provided'
      },
      severity: req.user.role === 'director' ? 'high' : 'medium',
      category: 'certificate_mgmt',
      riskyAction: req.user.role === 'director'
    });
    
    res.json({
      success: true,
      message: 'Certificate deleted successfully',
      data: {
        deletedCertificate: {
          id: certificate._id,
          fileName: certificate.originalFileName,
          shareholderName: certificate.shareholderId.profile.name
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete certificate'
    });
  }
});

// Get pending certificates count (Directors only)
router.get('/stats/pending', requireRole('director', 'super_admin'), async (req, res) => {
  try {
    const pendingCount = await Certificate.getPendingCount();
    
    // Get pending by shareholder
    const pendingByShareholder = await Certificate.aggregate([
      { $match: { status: 'pending' } },
      {
        $group: {
          _id: '$shareholderId',
          count: { $sum: 1 },
          oldestUpload: { $min: '$uploadedAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'shareholder'
        }
      },
      {
        $unwind: '$shareholder'
      },
      {
        $project: {
          shareholderId: '$_id',
          shareholderName: '$shareholder.profile.name',
          pendingCount: '$count',
          oldestUpload: '$oldestUpload',
          daysPending: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$oldestUpload'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      { $sort: { daysPending: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalPending: pendingCount,
        pendingByShareholder
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending certificates stats'
    });
  }
});

module.exports = router;