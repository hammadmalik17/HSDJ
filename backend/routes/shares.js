const express = require('express');
const { body, validationResult } = require('express-validator');

const Share = require('../models/Share');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { requireRole, enforceChineseWall, sensitiveOperationLimiter } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createShareValidation = [
  body('shareholderId').isMongoId().withMessage('Valid shareholder ID is required'),
  body('numberOfShares').isInt({ min: 1, max: 1000000 }).withMessage('Number of shares must be between 1 and 1,000,000'),
  body('sharePrice').isFloat({ min: 0.01, max: 100000 }).withMessage('Share price must be between 0.01 and 100,000'),
  body('purchaseDate').isISO8601().withMessage('Valid purchase date is required'),
  body('purchasePrice').isFloat({ min: 0.01 }).withMessage('Purchase price must be at least 0.01'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

const updateShareValidation = [
  body('numberOfShares').optional().isInt({ min: 1, max: 1000000 }).withMessage('Number of shares must be between 1 and 1,000,000'),
  body('sharePrice').optional().isFloat({ min: 0.01, max: 100000 }).withMessage('Share price must be between 0.01 and 100,000'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

// Get shares (with Chinese Wall enforcement)
router.get('/', enforceChineseWall('share'), async (req, res) => {
  try {
    const { page = 1, limit = 20, shareholderId, isActive = true } = req.query;
    
    const filters = {};
    if (shareholderId) filters.shareholderId = shareholderId;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    const shares = await Share.findWithAccess(req.user, filters)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Share.countDocuments(filters);
    
    res.json({
      success: true,
      data: {
        shares: shares.map(share => ({
          id: share._id,
          shareholderId: share.shareholderId,
          shareholderName: share.shareholderId?.profile?.name,
          numberOfShares: share.numberOfShares,
          units: share.units,
          remainingShares: share.remainingShares,
          sharePrice: share.sharePrice,
          currentValue: share.currentValue,
          purchaseDate: share.purchaseDate,
          purchasePrice: share.purchasePrice,
          totalInvestment: share.totalInvestment,
          profitLoss: share.profitLoss,
          percentageReturn: share.percentageReturn,
          assignedBy: share.assignedBy?.profile?.name,
          notes: share.notes,
          isActive: share.isActive,
          createdAt: share.createdAt
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
      message: 'Failed to fetch shares'
    });
  }
});

// Get specific share
router.get('/:shareId', enforceChineseWall('share'), async (req, res) => {
  try {
    const { shareId } = req.params;
    
    const share = await Share.findById(shareId)
      .populate('shareholderId', 'profile.name email')
      .populate('assignedBy', 'profile.name');
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }
    
    // Check Chinese Wall access
    if (req.user.role === 'shareholder' && share.shareholderId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        share: {
          id: share._id,
          shareholder: {
            id: share.shareholderId._id,
            name: share.shareholderId.profile.name,
            email: share.shareholderId.email
          },
          numberOfShares: share.numberOfShares,
          units: share.units,
          remainingShares: share.remainingShares,
          sharePrice: share.sharePrice,
          currentValue: share.currentValue,
          purchaseDate: share.purchaseDate,
          purchasePrice: share.purchasePrice,
          totalInvestment: share.totalInvestment,
          profitLoss: share.profitLoss,
          percentageReturn: share.percentageReturn,
          assignedBy: share.assignedBy.profile.name,
          notes: share.notes,
          isActive: share.isActive,
          history: share.history,
          createdAt: share.createdAt,
          updatedAt: share.updatedAt
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch share details'
    });
  }
});

// Create new share assignment (Directors only)
router.post('/', requireRole('director', 'super_admin'), createShareValidation, sensitiveOperationLimiter(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { shareholderId, numberOfShares, sharePrice, purchaseDate, purchasePrice, notes } = req.body;
    
    // Verify shareholder exists and is active
    const shareholder = await User.findById(shareholderId);
    if (!shareholder) {
      return res.status(404).json({
        success: false,
        message: 'Shareholder not found'
      });
    }
    
    if (!shareholder.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign shares to inactive shareholder'
      });
    }
    
    if (!['shareholder', 'director'].includes(shareholder.role)) {
      return res.status(400).json({
        success: false,
        message: 'Can only assign shares to shareholders or directors'
      });
    }
    
    // Create share record
    const share = new Share({
      shareholderId,
      numberOfShares,
      sharePrice,
      purchaseDate: new Date(purchaseDate),
      purchasePrice,
      assignedBy: req.user._id,
      notes
    });
    
    await share.save();
    
    // Log share assignment
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'share_assigned',
      targetType: 'Share',
      targetId: share._id,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        shareholderId,
        shareholderName: shareholder.profile.name,
        numberOfShares,
        sharePrice,
        totalValue: numberOfShares * sharePrice,
        units: Math.floor(numberOfShares / 5000)
      },
      severity: 'medium',
      category: 'share_mgmt',
      riskyAction: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Shares assigned successfully',
      data: {
        share: {
          id: share._id,
          numberOfShares: share.numberOfShares,
          units: share.units,
          sharePrice: share.sharePrice,
          currentValue: share.currentValue,
          totalInvestment: share.totalInvestment,
          shareholder: {
            id: shareholder._id,
            name: shareholder.profile.name
          }
        }
      }
    });
    
  } catch (error) {
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'share_assigned',
      success: false,
      errorMessage: error.message,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      severity: 'medium',
      category: 'share_mgmt'
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to assign shares'
    });
  }
});

// Update share (Directors only)
router.put('/:shareId', requireRole('director', 'super_admin'), updateShareValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { shareId } = req.params;
    const { numberOfShares, sharePrice, notes, reason } = req.body;
    
    const share = await Share.findById(shareId);
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }
    
    if (!share.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update inactive share'
      });
    }
    
    // Store previous values for audit
    const previousData = {
      numberOfShares: share.numberOfShares,
      sharePrice: share.sharePrice,
      currentValue: share.currentValue,
      notes: share.notes
    };
    
    // Update fields
    if (numberOfShares !== undefined) share.numberOfShares = numberOfShares;
    if (sharePrice !== undefined) share.sharePrice = sharePrice;
    if (notes !== undefined) share.notes = notes;
    
    share.lastModifiedBy = req.user._id;
    
    // Add history entry
    share.addHistoryEntry('modified', req.user._id, reason || 'Share details updated');
    
    await share.save();
    
    // Log share update
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'share_updated',
      targetType: 'Share',
      targetId: share._id,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      beforeState: previousData,
      afterState: {
        numberOfShares: share.numberOfShares,
        sharePrice: share.sharePrice,
        currentValue: share.currentValue,
        notes: share.notes
      },
      details: {
        reason: reason || 'No reason provided'
      },
      severity: 'medium',
      category: 'share_mgmt',
      riskyAction: true
    });
    
    res.json({
      success: true,
      message: 'Share updated successfully',
      data: {
        share: {
          id: share._id,
          numberOfShares: share.numberOfShares,
          units: share.units,
          sharePrice: share.sharePrice,
          currentValue: share.currentValue,
          profitLoss: share.profitLoss,
          percentageReturn: share.percentageReturn
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update share'
    });
  }
});

// Update share value (Directors only) - for market value changes
router.put('/:shareId/value', requireRole('director', 'super_admin'), [
  body('newSharePrice').isFloat({ min: 0.01, max: 100000 }).withMessage('Share price must be between 0.01 and 100,000'),
  body('reason').isLength({ min: 1, max: 500 }).withMessage('Reason is required and cannot exceed 500 characters')
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
    
    const { shareId } = req.params;
    const { newSharePrice, reason } = req.body;
    
    const share = await Share.findById(shareId);
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }
    
    if (!share.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update value of inactive share'
      });
    }
    
    const oldValue = share.currentValue;
    const oldPrice = share.sharePrice;
    
    // Update share value
    await share.updateValue(newSharePrice, req.user._id, reason);
    
    // Log value update
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'share_value_updated',
      targetType: 'Share',
      targetId: share._id,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        oldPrice,
        newPrice: newSharePrice,
        oldValue,
        newValue: share.currentValue,
        valueDifference: share.currentValue - oldValue,
        reason
      },
      severity: 'medium',
      category: 'share_mgmt',
      riskyAction: true
    });
    
    res.json({
      success: true,
      message: 'Share value updated successfully',
      data: {
        share: {
          id: share._id,
          oldPrice,
          newPrice: newSharePrice,
          oldValue,
          newValue: share.currentValue,
          valueDifference: share.currentValue - oldValue
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update share value'
    });
  }
});

// Transfer share ownership (Directors only)
router.put('/:shareId/transfer', requireRole('director', 'super_admin'), [
  body('newShareholderId').isMongoId().withMessage('Valid new shareholder ID is required'),
  body('reason').isLength({ min: 1, max: 500 }).withMessage('Transfer reason is required')
], sensitiveOperationLimiter(3, 30 * 60 * 1000), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { shareId } = req.params;
    const { newShareholderId, reason } = req.body;
    
    const share = await Share.findById(shareId).populate('shareholderId', 'profile.name email');
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }
    
    // Verify new shareholder exists
    const newShareholder = await User.findById(newShareholderId);
    if (!newShareholder) {
      return res.status(404).json({
        success: false,
        message: 'New shareholder not found'
      });
    }
    
    if (!newShareholder.isActive || !['shareholder', 'director'].includes(newShareholder.role)) {
      return res.status(400).json({
        success: false,
        message: 'New shareholder must be active and have shareholder or director role'
      });
    }
    
    const oldShareholder = share.shareholderId;
    
    // Transfer share
    await share.transferTo(newShareholderId, req.user._id, reason);
    
    // Log transfer
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'share_transferred',
      targetType: 'Share',
      targetId: share._id,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        fromShareholder: {
          id: oldShareholder._id,
          name: oldShareholder.profile.name,
          email: oldShareholder.email
        },
        toShareholder: {
          id: newShareholder._id,
          name: newShareholder.profile.name,
          email: newShareholder.email
        },
        numberOfShares: share.numberOfShares,
        currentValue: share.currentValue,
        reason
      },
      severity: 'high',
      category: 'share_mgmt',
      riskyAction: true
    });
    
    res.json({
      success: true,
      message: 'Share transferred successfully',
      data: {
        transfer: {
          shareId: share._id,
          from: {
            id: oldShareholder._id,
            name: oldShareholder.profile.name
          },
          to: {
            id: newShareholder._id,
            name: newShareholder.profile.name
          },
          numberOfShares: share.numberOfShares,
          currentValue: share.currentValue
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to transfer share'
    });
  }
});

// Delete share (soft delete - Directors only)
router.delete('/:shareId', requireRole('director', 'super_admin'), [
  body('reason').isLength({ min: 1, max: 500 }).withMessage('Deletion reason is required')
], sensitiveOperationLimiter(3, 30 * 60 * 1000), async (req, res) => {
  try {
    const { shareId } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Deletion reason is required'
      });
    }
    
    const share = await Share.findById(shareId).populate('shareholderId', 'profile.name email');
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }
    
    if (!share.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Share is already inactive'
      });
    }
    
    // Soft delete
    await share.softDelete(req.user._id, reason);
    
    // Log deletion
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'share_deleted',
      targetType: 'Share',
      targetId: share._id,
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        shareholderId: share.shareholderId._id,
        shareholderName: share.shareholderId.profile.name,
        numberOfShares: share.numberOfShares,
        currentValue: share.currentValue,
        reason
      },
      severity: 'high',
      category: 'share_mgmt',
      riskyAction: true
    });
    
    res.json({
      success: true,
      message: 'Share deleted successfully',
      data: {
        deletedShare: {
          id: share._id,
          shareholderName: share.shareholderId.profile.name,
          numberOfShares: share.numberOfShares,
          currentValue: share.currentValue
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete share'
    });
  }
});

// Get portfolio summary for a shareholder
router.get('/portfolio/:shareholderId', enforceChineseWall('share'), async (req, res) => {
  try {
    const { shareholderId } = req.params;
    
    // Check if user can access this shareholder's data
    if (req.user.role === 'shareholder' && shareholderId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const summary = await Share.getPortfolioSummary(shareholderId);
    const shares = await Share.findWithAccess(req.user, { shareholderId });
    
    const portfolioData = summary[0] || {
      totalShares: 0,
      totalUnits: 0,
      totalCurrentValue: 0,
      totalInvestment: 0,
      profitLoss: 0,
      percentageReturn: 0,
      shareRecords: 0,
      averageSharePrice: 0,
      oldestPurchase: null,
      newestPurchase: null
    };
    
    res.json({
      success: true,
      data: {
        summary: portfolioData,
        shares: shares.map(share => ({
          id: share._id,
          numberOfShares: share.numberOfShares,
          units: share.units,
          sharePrice: share.sharePrice,
          currentValue: share.currentValue,
          purchaseDate: share.purchaseDate,
          profitLoss: share.profitLoss,
          percentageReturn: share.percentageReturn,
          notes: share.notes
        }))
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio summary'
    });
  }
});

// Get share history
router.get('/:shareId/history', enforceChineseWall('share'), async (req, res) => {
  try {
    const { shareId } = req.params;
    
    const share = await Share.findById(shareId)
      .populate('shareholderId', 'profile.name')
      .populate('history.performedBy', 'profile.name');
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }
    
    // Check Chinese Wall access
    if (req.user.role === 'shareholder' && share.shareholderId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        shareId: share._id,
        shareholderName: share.shareholderId.profile.name,
        history: share.history.map(entry => ({
          id: entry._id,
          action: entry.action,
          performedBy: entry.performedBy.profile.name,
          performedAt: entry.performedAt,
          reason: entry.reason,
          details: entry.details
        }))
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch share history'
    });
  }
});

module.exports = router;