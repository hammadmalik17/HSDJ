const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('../models/User');
const Share = require('../models/Share');
const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
const { requireRole, enforceChineseWall, sensitiveOperationLimiter } = require('../middleware/auth');

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = './uploads/profiles/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation rules
const updateProfileValidation = [
  body('name').optional().isLength({ min: 2, max: 100 }).trim().withMessage('Name must be 2-100 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('address').optional().isLength({ max: 500 }).trim().withMessage('Address cannot exceed 500 characters')
];

const createUserValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('name').isLength({ min: 2, max: 100 }).trim().withMessage('Name must be 2-100 characters'),
  body('role').isIn(['shareholder', 'director']).withMessage('Role must be shareholder or director'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
];

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          phone: user.profile.phone,
          address: user.profile.address,
          profilePicture: user.profile.profilePicture,
          role: user.role,
          twoFactorEnabled: user.security.twoFactorEnabled,
          lastLogin: user.security.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', updateProfileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Store previous values for audit
    const previousData = {
      name: user.profile.name,
      phone: user.profile.phone,
      address: user.profile.address
    };
    
    // Update fields
    if (name !== undefined) user.profile.name = name;
    if (phone !== undefined) user.profile.phone = phone;
    if (address !== undefined) user.profile.address = address;
    
    user.lastModifiedBy = req.user._id;
    await user.save();
    
    // Log profile update
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'profile_updated',
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      beforeState: previousData,
      afterState: {
        name: user.profile.name,
        phone: user.profile.phone,
        address: user.profile.address
      },
      severity: 'low',
      category: 'user_mgmt'
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.profile.name,
          phone: user.profile.phone,
          address: user.profile.address
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Upload profile picture
router.post('/profile/picture', upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete old profile picture if exists
    if (user.profile.profilePicture) {
      const oldPath = path.join(__dirname, '..', user.profile.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    // Update user with new profile picture path
    user.profile.profilePicture = `/uploads/profiles/${req.file.filename}`;
    user.lastModifiedBy = req.user._id;
    await user.save();
    
    // Log profile picture update
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'profile_updated',
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        action: 'profile_picture_updated',
        fileName: req.file.filename,
        fileSize: req.file.size
      },
      severity: 'low',
      category: 'user_mgmt'
    });
    
    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePicture: user.profile.profilePicture
      }
    });
    
  } catch (error) {
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture'
    });
  }
});

// Get all users (Directors only)
router.get('/', requireRole('director', 'super_admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    
    const filters = {};
    if (role) filters.role = role;
    if (search) {
      filters.$or = [
        { 'profile.name': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    const users = await User.findWithAccess(req.user, filters)
      .populate('createdBy', 'profile.name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(filters);
    
    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          name: user.profile.name,
          phone: user.profile.phone,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.security.lastLogin,
          createdAt: user.createdAt,
          createdBy: user.createdBy
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
      message: 'Failed to fetch users'
    });
  }
});

// Get specific user (with Chinese Wall enforcement)
router.get('/:userId', enforceChineseWall('user'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate('createdBy', 'profile.name email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's shares and certificates if they're a shareholder
    let additionalData = {};
    
    if (user.role === 'shareholder' || user.role === 'director') {
      const shares = await Share.findWithAccess(req.user, { shareholderId: userId });
      const certificates = await Certificate.findWithAccess(req.user, { shareholderId: userId });
      
      additionalData = {
        shares: shares.length,
        totalShares: shares.reduce((sum, share) => sum + share.numberOfShares, 0),
        totalValue: shares.reduce((sum, share) => sum + share.currentValue, 0),
        certificates: {
          total: certificates.length,
          pending: certificates.filter(cert => cert.status === 'pending').length,
          approved: certificates.filter(cert => cert.status === 'approved').length,
          rejected: certificates.filter(cert => cert.status === 'rejected').length
        }
      };
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          phone: user.profile.phone,
          address: user.profile.address,
          profilePicture: user.profile.profilePicture,
          role: user.role,
          isActive: user.isActive,
          twoFactorEnabled: user.security.twoFactorEnabled,
          lastLogin: user.security.lastLogin,
          createdAt: user.createdAt,
          createdBy: user.createdBy,
          ...additionalData
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Create new user (Directors only)
router.post('/', requireRole('director', 'super_admin'), createUserValidation, sensitiveOperationLimiter(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { email, password, name, phone, address, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create new user
    const user = new User({
      email,
      password,
      role,
      profile: {
        name,
        phone,
        address
      },
      createdBy: req.user._id,
      security: {
        emailVerified: true // Directors can create pre-verified users
      }
    });
    
    await user.save();
    
    // Log user creation
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'user_created',
      targetType: 'User',
      targetId: user._id,
      targetEmail: email,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        newUserRole: role,
        newUserName: name
      },
      severity: 'medium',
      category: 'user_mgmt',
      riskyAction: role === 'director'
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      }
    });
    
  } catch (error) {
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'user_created',
      success: false,
      errorMessage: error.message,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      severity: 'medium',
      category: 'user_mgmt'
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Update user (Directors only, or users updating themselves)
router.put('/:userId', enforceChineseWall('user'), updateProfileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { userId } = req.params;
    const { name, phone, address, role, isActive } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Only directors can change role and isActive
    if ((role !== undefined || isActive !== undefined) && req.user.role !== 'director' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to change role or active status'
      });
    }
    
    // Store previous values for audit
    const previousData = {
      name: user.profile.name,
      phone: user.profile.phone,
      address: user.profile.address,
      role: user.role,
      isActive: user.isActive
    };
    
    // Update fields
    if (name !== undefined) user.profile.name = name;
    if (phone !== undefined) user.profile.phone = phone;
    if (address !== undefined) user.profile.address = address;
    if (role !== undefined && ['shareholder', 'director'].includes(role)) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    
    user.lastModifiedBy = req.user._id;
    await user.save();
    
    // Log user update
    await AuditLog.createLog({
      userId: req.user._id,
      action: previousData.role !== user.role ? 'role_changed' : 'user_updated',
      targetType: 'User',
      targetId: user._id,
      targetEmail: user.email,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      beforeState: previousData,
      afterState: {
        name: user.profile.name,
        phone: user.profile.phone,
        address: user.profile.address,
        role: user.role,
        isActive: user.isActive
      },
      severity: previousData.role !== user.role ? 'high' : 'medium',
      category: 'user_mgmt',
      riskyAction: previousData.role !== user.role
    });
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.profile.name,
          phone: user.profile.phone,
          address: user.profile.address,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user (Directors only)
router.delete('/:userId', requireRole('director', 'super_admin'), sensitiveOperationLimiter(3, 30 * 60 * 1000), async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Deletion reason is required'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deletion of super admin
    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin user'
      });
    }
    
    // Prevent self-deletion
    if (userId === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    // Get user's shares and certificates for cleanup
    const shares = await Share.find({ shareholderId: userId, isActive: true });
    const certificates = await Certificate.find({ shareholderId: userId });
    
    // Store user data for audit and potential recovery
    const userData = {
      originalId: user._id,
      userData: user.toObject(),
      shares: shares.map(share => share.toObject()),
      certificates: certificates.map(cert => cert.toObject()),
      deletedBy: req.user._id,
      deletedAt: new Date(),
      deletionReason: reason
    };
    
    // Create deleted user record for potential recovery
    const DeletedUser = require('../models/DeletedUser');
    await DeletedUser.create(userData);
    
    // Soft delete related shares
    for (const share of shares) {
      await share.softDelete(req.user._id, 'User account deleted');
    }
    
    // Delete certificate files and records
    for (const certificate of certificates) {
      certificate.deleteFile();
      await certificate.remove();
    }
    
    // Delete user
    await user.remove();
    
    // Log user deletion
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'user_deleted',
      targetType: 'User',
      targetId: userId,
      targetEmail: user.email,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        deletedUserName: user.profile.name,
        deletedUserRole: user.role,
        reason,
        sharesDeleted: shares.length,
        certificatesDeleted: certificates.length
      },
      severity: 'high',
      category: 'user_mgmt',
      riskyAction: true
    });
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: {
          id: userId,
          name: user.profile.name,
          email: user.email,
          sharesAffected: shares.length,
          certificatesAffected: certificates.length
        }
      }
    });
    
  } catch (error) {
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'user_deleted',
      targetType: 'User',
      targetId: req.params.userId,
      success: false,
      errorMessage: error.message,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      severity: 'high',
      category: 'user_mgmt'
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get user dashboard stats
router.get('/:userId/dashboard', enforceChineseWall('user'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's portfolio summary
    const portfolioSummary = await Share.getPortfolioSummary(userId);
    const shares = await Share.findWithAccess(req.user, { shareholderId: userId });
    const certificates = await Certificate.findWithAccess(req.user, { shareholderId: userId });
    
    // Get recent activity
    const recentActivity = await AuditLog.findWithAccess(
      req.user, 
      { userId }, 
      { limit: 10, sort: { createdAt: -1 } }
    );
    
    const summary = portfolioSummary[0] || {
      totalShares: 0,
      totalUnits: 0,
      totalCurrentValue: 0,
      totalInvestment: 0,
      profitLoss: 0,
      percentageReturn: 0
    };
    
    res.json({
      success: true,
      data: {
        portfolio: summary,
        shares: {
          total: shares.length,
          details: shares.map(share => ({
            id: share._id,
            numberOfShares: share.numberOfShares,
            units: share.units,
            currentValue: share.currentValue,
            purchaseDate: share.purchaseDate,
            profitLoss: share.profitLoss,
            percentageReturn: share.percentageReturn
          }))
        },
        certificates: {
          total: certificates.length,
          pending: certificates.filter(cert => cert.status === 'pending').length,
          approved: certificates.filter(cert => cert.status === 'approved').length,
          rejected: certificates.filter(cert => cert.status === 'rejected').length,
          recent: certificates.slice(0, 5).map(cert => ({
            id: cert._id,
            fileName: cert.originalFileName,
            status: cert.status,
            uploadedAt: cert.uploadedAt,
            reviewedAt: cert.reviewedAt
          }))
        },
        recentActivity: recentActivity.map(activity => ({
          action: activity.action,
          success: activity.success,
          createdAt: activity.createdAt,
          details: activity.details
        }))
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Change password
router.put('/profile/password', [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain uppercase, lowercase, number and special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      await AuditLog.createLog({
        userId: req.user._id,
        action: 'password_changed',
        success: false,
        errorMessage: 'Invalid current password',
        ipAddress: req.clientIP,
        userAgent: req.userAgent,
        severity: 'medium',
        category: 'auth'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Log password change
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'password_changed',
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      severity: 'medium',
      category: 'auth'
    });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

module.exports = router;