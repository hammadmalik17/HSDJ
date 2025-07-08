const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '15m',
      issuer: 'realestate-platform',
      audience: 'realestate-users'
    }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
      issuer: 'realestate-platform',
      audience: 'realestate-users'
    }
  );
  
  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret, {
      issuer: 'realestate-platform',
      audience: 'realestate-users'
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Extract token from request
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies for token
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  
  return null;
};

// Get client IP address
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         '127.0.0.1';
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const token = extractToken(req);
    
    if (!token) {
      await AuditLog.createLog({
        userId: null,
        action: 'system_access',
        success: false,
        errorMessage: 'No authentication token provided',
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'] || 'Unknown',
        severity: 'medium',
        category: 'auth'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    
    // Find user and check if still active
    const user = await User.findById(decoded.userId).select('+security');
    
    if (!user) {
      await AuditLog.createLog({
        userId: decoded.userId,
        action: 'system_access',
        success: false,
        errorMessage: 'User not found',
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'] || 'Unknown',
        severity: 'high',
        category: 'auth'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }
    
    if (!user.isActive) {
      await AuditLog.createLog({
        userId: user._id,
        action: 'system_access',
        success: false,
        errorMessage: 'User account is inactive',
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'] || 'Unknown',
        severity: 'medium',
        category: 'auth'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }
    
    if (user.isLocked) {
      await AuditLog.createLog({
        userId: user._id,
        action: 'system_access',
        success: false,
        errorMessage: 'User account is locked',
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'] || 'Unknown',
        severity: 'medium',
        category: 'auth'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked'
      });
    }
    
    // Add user to request object
    req.user = user;
    req.clientIP = getClientIP(req);
    req.userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Log successful authentication
    const duration = Date.now() - startTime;
    await AuditLog.createLog({
      userId: user._id,
      action: 'system_access',
      success: true,
      ipAddress: req.clientIP,
      userAgent: req.userAgent,
      duration,
      severity: 'low',
      category: 'auth'
    });
    
    next();
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    await AuditLog.createLog({
      userId: null,
      action: 'system_access',
      success: false,
      errorMessage: error.message,
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      duration,
      severity: 'medium',
      category: 'auth'
    });
    
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Authorization middleware for roles
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        await AuditLog.createLog({
          userId: req.user._id,
          action: 'system_access',
          success: false,
          errorMessage: `Insufficient permissions. Required: ${allowedRoles.join(' or ')}, Has: ${req.user.role}`,
          ipAddress: req.clientIP,
          userAgent: req.userAgent,
          severity: 'high',
          category: 'security'
        });
        
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Chinese Wall enforcement middleware
const enforceChineseWall = (resourceType = 'user') => {
  return async (req, res, next) => {
    try {
      const requestingUser = req.user;
      const targetUserId = req.params.userId || req.params.shareholderId || req.body.shareholderId;
      
      // Super admin and directors can access all data
      if (requestingUser.role === 'super_admin' || requestingUser.role === 'director') {
        return next();
      }
      
      // Shareholders can only access their own data
      if (requestingUser.role === 'shareholder') {
        if (targetUserId && targetUserId.toString() !== requestingUser._id.toString()) {
          await AuditLog.createLog({
            userId: requestingUser._id,
            action: 'system_access',
            success: false,
            errorMessage: `Chinese Wall violation: Attempted to access ${resourceType} data of another user`,
            ipAddress: req.clientIP,
            userAgent: req.userAgent,
            severity: 'high',
            category: 'security',
            riskyAction: true,
            details: {
              attemptedAccess: targetUserId,
              resourceType
            }
          });
          
          return res.status(403).json({
            success: false,
            message: 'Access denied: You can only access your own data'
          });
        }
      }
      
      // Visitors have no access to user data
      if (requestingUser.role === 'visitor') {
        await AuditLog.createLog({
          userId: requestingUser._id,
          action: 'system_access',
          success: false,
          errorMessage: 'Visitor attempted to access restricted data',
          ipAddress: req.clientIP,
          userAgent: req.userAgent,
          severity: 'medium',
          category: 'security'
        });
        
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions'
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Rate limiting for sensitive operations
const sensitiveOperationLimiter = (maxAttempts = 3, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return async (req, res, next) => {
    const key = `${req.user._id}-${req.clientIP}`;
    const now = Date.now();
    
    // Clean old attempts
    const userAttempts = attempts.get(key) || [];
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      await AuditLog.createLog({
        userId: req.user._id,
        action: 'system_access',
        success: false,
        errorMessage: 'Rate limit exceeded for sensitive operation',
        ipAddress: req.clientIP,
        userAgent: req.userAgent,
        severity: 'high',
        category: 'security'
      });
      
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Record this attempt
    recentAttempts.push(now);
    attempts.set(key, recentAttempts);
    
    next();
  };
};

// Middleware to check 2FA requirement
const require2FA = async (req, res, next) => {
  try {
    if (!req.user.security.twoFactorEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Two-factor authentication is required for this action',
        requiresSetup: true
      });
    }
    
    // Check if 2FA token is provided in sensitive operations
    const twoFactorToken = req.headers['x-2fa-token'] || req.body.twoFactorToken;
    
    if (!twoFactorToken) {
      return res.status(403).json({
        success: false,
        message: 'Two-factor authentication token required',
        requires2FA: true
      });
    }
    
    // Verify 2FA token (implement speakeasy verification here)
    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: req.user.security.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken,
      window: 2 // Allow 2 time steps for clock drift
    });
    
    if (!verified) {
      await AuditLog.createLog({
        userId: req.user._id,
        action: 'system_access',
        success: false,
        errorMessage: 'Invalid 2FA token provided',
        ipAddress: req.clientIP,
        userAgent: req.userAgent,
        severity: 'high',
        category: 'security'
      });
      
      return res.status(403).json({
        success: false,
        message: 'Invalid two-factor authentication token'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Two-factor authentication error'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  enforceChineseWall,
  sensitiveOperationLimiter,
  require2FA,
  generateTokens,
  verifyToken,
  getClientIP
};