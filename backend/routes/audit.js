const express = require('express');
const { query, validationResult } = require('express-validator');

const AuditLog = require('../models/AuditLog');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Get audit logs (Directors and Super Admin only)
router.get('/', requireRole('director', 'super_admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('userId').optional().isMongoId().withMessage('Invalid user ID'),
  query('action').optional().isIn([
    'login', 'logout', 'login_failed', 'password_reset', 'password_changed',
    'user_created', 'user_updated', 'user_deleted', 'role_changed', 'profile_updated',
    'share_assigned', 'share_updated', 'share_transferred', 'share_deleted', 'share_value_updated',
    'certificate_uploaded', 'certificate_approved', 'certificate_rejected', 'certificate_downloaded', 'certificate_deleted',
    'system_access', 'data_export', 'bulk_operation', 'report_generated'
  ]).withMessage('Invalid action'),
  query('category').optional().isIn(['auth', 'user_mgmt', 'share_mgmt', 'certificate_mgmt', 'system', 'security']).withMessage('Invalid category'),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  query('success').optional().isBoolean().withMessage('Success must be boolean'),
  query('riskyAction').optional().isBoolean().withMessage('RiskyAction must be boolean'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format for dateFrom'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format for dateTo')
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
    
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      category,
      severity,
      success,
      riskyAction,
      dateFrom,
      dateTo
    } = req.query;
    
    // Build filters
    const filters = {};
    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (category) filters.category = category;
    if (severity) filters.severity = severity;
    if (success !== undefined) filters.success = success === 'true';
    if (riskyAction !== undefined) filters.riskyAction = riskyAction === 'true';
    
    // Date range filter
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }
    
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 }
    };
    
    const logs = await AuditLog.findWithAccess(req.user, filters, options);
    const total = await AuditLog.countDocuments(filters);
    
    // Log this audit access
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'report_generated',
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        reportType: 'audit_logs',
        filters,
        recordsReturned: logs.length
      },
      severity: 'medium',
      category: 'system'
    });
    
    res.json({
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log._id,
          user: log.userId ? {
            id: log.userId._id,
            name: log.userId.profile?.name,
            email: log.userId.email,
            role: log.userId.role
          } : null,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          targetEmail: log.targetEmail,
          success: log.success,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          duration: log.durationFormatted,
          severity: log.severity,
          category: log.category,
          riskyAction: log.riskyAction,
          errorMessage: log.errorMessage,
          details: log.details,
          createdAt: log.createdAt,
          timeAgo: log.timeAgo
        })),
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        },
        filters: filters
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

// Get security alerts (Directors and Super Admin only)
router.get('/security-alerts', requireRole('director', 'super_admin'), [
  query('timeframe').optional().isInt({ min: 1, max: 168 }).withMessage('Timeframe must be between 1 and 168 hours')
], async (req, res) => {
  try {
    const { timeframe = 24 } = req.query;
    
    const alerts = await AuditLog.getSecurityAlerts(parseInt(timeframe));
    
    // Log security alert access
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'report_generated',
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        reportType: 'security_alerts',
        timeframe: parseInt(timeframe),
        alertsFound: alerts.length
      },
      severity: 'medium',
      category: 'security'
    });
    
    res.json({
      success: true,
      data: {
        alerts: alerts.map(alert => ({
          id: alert._id,
          user: alert.userId ? {
            id: alert.userId._id,
            name: alert.userId.profile?.name,
            email: alert.userId.email,
            role: alert.userId.role
          } : null,
          action: alert.action,
          success: alert.success,
          ipAddress: alert.ipAddress,
          severity: alert.severity,
          category: alert.category,
          riskyAction: alert.riskyAction,
          errorMessage: alert.errorMessage,
          details: alert.details,
          createdAt: alert.createdAt,
          timeAgo: alert.timeAgo
        })),
        summary: {
          timeframe: parseInt(timeframe),
          totalAlerts: alerts.length,
          criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
          highAlerts: alerts.filter(a => a.severity === 'high').length,
          failedLogins: alerts.filter(a => a.action === 'login_failed').length,
          riskyActions: alerts.filter(a => a.riskyAction).length
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security alerts'
    });
  }
});

// Get failed login attempts (Directors and Super Admin only)
router.get('/failed-logins', requireRole('director', 'super_admin'), [
  query('timeframe').optional().isInt({ min: 1, max: 168 }).withMessage('Timeframe must be between 1 and 168 hours')
], async (req, res) => {
  try {
    const { timeframe = 24 } = req.query;
    
    const failedAttempts = await AuditLog.getFailedLoginAttempts(parseInt(timeframe));
    
    res.json({
      success: true,
      data: {
        failedAttempts: failedAttempts.map(attempt => ({
          userId: attempt.userId,
          userEmail: attempt.userEmail,
          userName: attempt.userName,
          ipAddress: attempt.ipAddress,
          attempts: attempt.attempts,
          lastAttempt: attempt.lastAttempt,
          userAgent: attempt.userAgent
        })),
        summary: {
          timeframe: parseInt(timeframe),
          totalAttempts: failedAttempts.reduce((sum, attempt) => sum + attempt.attempts, 0),
          uniqueIPs: new Set(failedAttempts.map(attempt => attempt.ipAddress)).size,
          uniqueUsers: new Set(failedAttempts.map(attempt => attempt.userId?.toString()).filter(Boolean)).size
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch failed login attempts'
    });
  }
});

// Get activity summary for a user (Directors only, or own activity)
router.get('/activity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 30 } = req.query;
    
    // Check permissions
    if (req.user.role === 'shareholder' && userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own activity'
      });
    }
    
    if (req.user.role === 'visitor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient permissions'
      });
    }
    
    const activitySummary = await AuditLog.getActivitySummary(userId, parseInt(timeframe));
    const activityPattern = await AuditLog.getUserActivityPattern(userId, parseInt(timeframe));
    
    res.json({
      success: true,
      data: {
        summary: activitySummary,
        pattern: activityPattern,
        timeframe: parseInt(timeframe)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity summary'
    });
  }
});

// Get suspicious activity detection (Super Admin only)
router.get('/suspicious-activity', requireRole('super_admin'), [
  query('timeframe').optional().isInt({ min: 1, max: 168 }).withMessage('Timeframe must be between 1 and 168 hours')
], async (req, res) => {
  try {
    const { timeframe = 24 } = req.query;
    
    const suspiciousActivity = await AuditLog.detectSuspiciousActivity(parseInt(timeframe));
    
    // Log suspicious activity check
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'report_generated',
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        reportType: 'suspicious_activity_detection',
        timeframe: parseInt(timeframe),
        alertsFound: suspiciousActivity.reduce((sum, category) => sum + category.length, 0)
      },
      severity: 'high',
      category: 'security'
    });
    
    res.json({
      success: true,
      data: {
        suspiciousActivity: {
          multipleFailedLogins: suspiciousActivity[0] || [],
          unusualAccessPatterns: suspiciousActivity[1] || [],
          afterHoursBulkOperations: suspiciousActivity[2] || []
        },
        summary: {
          timeframe: parseInt(timeframe),
          totalAlerts: suspiciousActivity.reduce((sum, category) => sum + category.length, 0),
          categories: {
            multipleFailedLogins: suspiciousActivity[0]?.length || 0,
            unusualAccessPatterns: suspiciousActivity[1]?.length || 0,
            afterHoursBulkOperations: suspiciousActivity[2]?.length || 0
          }
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to detect suspicious activity'
    });
  }
});

// Export audit logs (Super Admin only)
router.get('/export', requireRole('super_admin'), [
  query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format for dateFrom'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format for dateTo'),
  query('category').optional().isIn(['auth', 'user_mgmt', 'share_mgmt', 'certificate_mgmt', 'system', 'security']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const { format = 'json', dateFrom, dateTo, category } = req.query;
    
    // Build filters
    const filters = {};
    if (category) filters.category = category;
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }
    
    const logs = await AuditLog.find(filters)
      .populate('userId', 'profile.name email role')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit export to 10k records for performance
    
    // Log data export
    await AuditLog.createLog({
      userId: req.user._id,
      action: 'data_export',
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      details: {
        exportType: 'audit_logs',
        format,
        filters,
        recordsExported: logs.length
      },
      severity: 'critical',
      category: 'system',
      riskyAction: true
    });
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'Date,User,Email,Role,Action,Success,IP Address,Category,Severity,Details\n';
      const csvData = logs.map(log => {
        const user = log.userId;
        return [
          log.createdAt.toISOString(),
          user?.profile?.name || 'Unknown',
          user?.email || 'Unknown',
          user?.role || 'Unknown',
          log.action,
          log.success,
          log.ipAddress,
          log.category,
          log.severity,
          JSON.stringify(log.details || {}).replace(/"/g, '""')
        ].join(',');
      }).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.csv"`);
      res.send(csvHeaders + csvData);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.json"`);
      res.json({
        exportInfo: {
          generatedAt: new Date(),
          generatedBy: req.user.profile.name,
          totalRecords: logs.length,
          filters
        },
        logs: logs.map(log => ({
          date: log.createdAt,
          user: log.userId ? {
            name: log.userId.profile?.name,
            email: log.userId.email,
            role: log.userId.role
          } : null,
          action: log.action,
          success: log.success,
          ipAddress: log.ipAddress,
          category: log.category,
          severity: log.severity,
          riskyAction: log.riskyAction,
          errorMessage: log.errorMessage,
          details: log.details,
          targetType: log.targetType,
          targetId: log.targetId,
          userAgent: log.userAgent
        }))
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export audit logs'
    });
  }
});

// Get system stats (Super Admin only)
router.get('/stats', requireRole('super_admin'), [
  query('timeframe').optional().isInt({ min: 1, max: 720 }).withMessage('Timeframe must be between 1 and 720 hours (30 days)')
], async (req, res) => {
  try {
    const { timeframe = 168 } = req.query; // Default 7 days
    
    const stats = await AuditLog.getSystemStats(parseInt(timeframe));
    
    res.json({
      success: true,
      data: {
        timeframe: parseInt(timeframe),
        stats: {
          totalEvents: stats.totalEvents,
          successfulEvents: stats.successfulEvents,
          failedEvents: stats.failedEvents,
          uniqueUsers: stats.uniqueUsers,
          uniqueIPs: stats.uniqueIPs,
          riskyActions: stats.riskyActions,
          categoryBreakdown: stats.categoryBreakdown,
          actionBreakdown: stats.actionBreakdown,
          severityBreakdown: stats.severityBreakdown,
          hourlyPattern: stats.hourlyPattern,
          dailyPattern: stats.dailyPattern
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics'
    });
  }
});

// Get audit log details by ID (Directors and Super Admin only)
router.get('/:logId', requireRole('director', 'super_admin'), async (req, res) => {
  try {
    const { logId } = req.params;
    
    const log = await AuditLog.findById(logId)
      .populate('userId', 'profile.name email role');
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        log: {
          id: log._id,
          user: log.userId ? {
            id: log.userId._id,
            name: log.userId.profile?.name,
            email: log.userId.email,
            role: log.userId.role
          } : null,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          targetEmail: log.targetEmail,
          success: log.success,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          duration: log.duration,
          durationFormatted: log.durationFormatted,
          severity: log.severity,
          category: log.category,
          riskyAction: log.riskyAction,
          errorMessage: log.errorMessage,
          details: log.details,
          beforeState: log.beforeState,
          afterState: log.afterState,
          createdAt: log.createdAt,
          timeAgo: log.timeAgo
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log details'
    });
  }
});

module.exports = router;