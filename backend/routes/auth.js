const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateTokens, verifyToken, getClientIP } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Safe audit logging function
const safeAuditLog = async (logData) => {
  try {
    // Only create audit log if we have a valid userId
    if (logData.userId) {
      await AuditLog.createLog(logData);
    } else {
      // Log to console for debugging without crashing
      console.log('Audit log skipped (no userId):', logData.action);
    }
  } catch (error) {
    console.error('Audit log failed:', error.message);
    // Don't crash the app if audit logging fails
  }
};

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('name').isLength({ min: 2, max: 100 }).trim().withMessage('Name must be 2-100 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
];

// Register new user (Only directors can register new shareholders)
router.post('/register', registerValidation, async (req, res) => {
  const startTime = Date.now();
  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { email, password, name, phone, role = 'shareholder' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      await safeAuditLog({
        userId: null,
        action: 'user_created',
        success: false,
        errorMessage: 'Email already registered',
        ipAddress: clientIP,
        userAgent,
        targetEmail: email,
        severity: 'low',
        category: 'user_mgmt'
      });
      
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Only allow certain roles
    if (!['visitor', 'shareholder'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    // Create new user
    const user = new User({
      email,
      password,
      role,
      profile: {
        name,
        phone
      }
    });
    
    // Generate email verification token
    const verificationToken = user.createEmailVerificationToken();
    
    await user.save();
    
    // Log successful registration
    const duration = Date.now() - startTime;
    await safeAuditLog({
      userId: user._id,
      action: 'user_created',
      success: true,
      ipAddress: clientIP,
      userAgent,
      duration,
      details: {
        role,
        emailVerificationSent: true
      },
      severity: 'medium',
      category: 'user_mgmt'
    });
    
    // Send verification email (optional for development)
    try {
      if (process.env.NODE_ENV === 'production') {
        await sendEmail({
          to: email,
          subject: 'Verify Your Email - Real Estate Platform',
          template: 'email-verification',
          data: {
            name,
            verificationUrl: `${process.env.CLIENT_URL}/verify-email/${verificationToken}`
          }
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          role: user.role,
          emailVerified: user.security.emailVerified
        }
      }
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    await safeAuditLog({
      userId: null,
      action: 'user_created',
      success: false,
      errorMessage: error.message,
      ipAddress: clientIP,
      userAgent,
      duration,
      severity: 'medium',
      category: 'user_mgmt'
    });
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login
router.post('/login', loginValidation, async (req, res) => {
  const startTime = Date.now();
  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { email, password, twoFactorToken } = req.body;
    
    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password +security');
    
    if (!user) {
      await safeAuditLog({
        userId: null,
        action: 'login_failed',
        success: false,
        errorMessage: 'User not found',
        ipAddress: clientIP,
        userAgent,
        targetEmail: email,
        severity: 'medium',
        category: 'auth'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      await safeAuditLog({
        userId: user._id,
        action: 'login_failed',
        success: false,
        errorMessage: 'Account is locked',
        ipAddress: clientIP,
        userAgent,
        severity: 'high',
        category: 'auth'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      await safeAuditLog({
        userId: user._id,
        action: 'login_failed',
        success: false,
        errorMessage: 'Account is inactive',
        ipAddress: clientIP,
        userAgent,
        severity: 'medium',
        category: 'auth'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      await user.incLoginAttempts();
      
      await safeAuditLog({
        userId: user._id,
        action: 'login_failed',
        success: false,
        errorMessage: 'Invalid password',
        ipAddress: clientIP,
        userAgent,
        severity: 'medium',
        category: 'auth'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check 2FA if enabled
    if (user.security.twoFactorEnabled) {
      if (!twoFactorToken) {
        return res.status(200).json({
          success: false,
          message: 'Two-factor authentication required',
          requires2FA: true,
          tempToken: generateTempToken(user._id) // 5-minute temp token for 2FA
        });
      }
      
      const verified = speakeasy.totp.verify({
        secret: user.security.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 2
      });
      
      if (!verified) {
        await safeAuditLog({
          userId: user._id,
          action: 'login_failed',
          success: false,
          errorMessage: 'Invalid 2FA token',
          ipAddress: clientIP,
          userAgent,
          severity: 'high',
          category: 'auth'
        });
        
        return res.status(401).json({
          success: false,
          message: 'Invalid two-factor authentication code'
        });
      }
    }
    
    // Reset login attempts on successful login
    if (user.security.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }
    
    // Update last login
    await user.updateLastLogin();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Log successful login
    const duration = Date.now() - startTime;
    await safeAuditLog({
      userId: user._id,
      action: 'login',
      success: true,
      ipAddress: clientIP,
      userAgent,
      duration,
      details: {
        twoFactorUsed: user.security.twoFactorEnabled
      },
      severity: 'low',
      category: 'auth'
    });
    
    // Set secure cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          role: user.role,
          twoFactorEnabled: user.security.twoFactorEnabled,
          lastLogin: user.security.lastLogin
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    await safeAuditLog({
      userId: null,
      action: 'login_failed',
      success: false,
      errorMessage: error.message,
      ipAddress: clientIP,
      userAgent,
      duration,
      severity: 'high',
      category: 'auth'
    });
    
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    
    // Update cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    };
    
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', newRefreshToken, cookieOptions);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
    
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  try {
    // Get user ID from token if available
    let userId = null;
    const token = req.headers.authorization?.substring(7) || req.cookies?.accessToken;
    
    if (token) {
      try {
        const decoded = verifyToken(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Token might be expired, continue with logout
      }
    }
    
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    // Log logout
    if (userId) {
      await safeAuditLog({
        userId,
        action: 'logout',
        success: true,
        ipAddress: clientIP,
        userAgent,
        severity: 'low',
        category: 'auth'
      });
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Setup 2FA
router.post('/setup-2fa', async (req, res) => {
  try {
    const token = req.headers.authorization?.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('+security');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate 2FA secret
    const secret = speakeasy.generateSecret({
      name: `Real Estate Platform (${user.email})`,
      issuer: 'Real Estate Platform',
      length: 32
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    // Save secret temporarily (not enabled until verified)
    user.security.twoFactorSecret = secret.base32;
    await user.save();
    
    res.json({
      success: true,
      message: '2FA setup initiated',
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '2FA setup failed'
    });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', async (req, res) => {
  try {
    const { token: twoFactorToken } = req.body;
    const authToken = req.headers.authorization?.substring(7);
    
    if (!authToken || !twoFactorToken) {
      return res.status(400).json({
        success: false,
        message: 'Authentication token and 2FA token are required'
      });
    }
    
    const decoded = verifyToken(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('+security');
    
    if (!user || !user.security.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'User not found or 2FA not set up'
      });
    }
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.security.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken,
      window: 2
    });
    
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }
    
    // Enable 2FA
    user.security.twoFactorEnabled = true;
    await user.save();
    
    // Log 2FA enablement
    await safeAuditLog({
      userId: user._id,
      action: '2fa_enabled',
      success: true,
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      severity: 'medium',
      category: 'auth'
    });
    
    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '2FA verification failed'
    });
  }
});

// Disable 2FA
router.post('/disable-2fa', async (req, res) => {
  try {
    const { password, twoFactorToken } = req.body;
    const authToken = req.headers.authorization?.substring(7);
    
    if (!authToken || !password || !twoFactorToken) {
      return res.status(400).json({
        success: false,
        message: 'Authentication token, password, and 2FA token are required'
      });
    }
    
    const decoded = verifyToken(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('+password +security');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // Verify 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.security.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken,
      window: 2
    });
    
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }
    
    // Disable 2FA
    user.security.twoFactorEnabled = false;
    user.security.twoFactorSecret = undefined;
    await user.save();
    
    // Log 2FA disablement
    await safeAuditLog({
      userId: user._id,
      action: '2fa_disabled',
      success: true,
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      severity: 'high',
      category: 'auth'
    });
    
    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '2FA disabling failed'
    });
  }
});

// Helper function to generate temporary token for 2FA
function generateTempToken(userId) {
  return jwt.sign(
    { userId, type: 'temp_2fa' },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );
}

module.exports = router;