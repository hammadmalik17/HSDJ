// routes/auth.js - FIXED REGISTRATION
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateTokens, verifyToken, getClientIP } = require('../middleware/auth');

const router = express.Router();

// Safe audit log function (won't crash if audit fails)
const safeAuditLog = async (logData) => {
  try {
    await AuditLog.createLog(logData);
  } catch (error) {
    console.warn('Audit logging failed:', error.message);
  }
};

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase, lowercase, number and special character'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
];

// FIXED: Register route that properly saves to MongoDB
router.post('/register', registerValidation, async (req, res) => {
  const startTime = Date.now();
  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  try {
    console.log('🔍 Registration attempt started for:', req.body.email);
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { email, password, name, phone, address } = req.body;
    
    // Check if user already exists
    console.log('🔍 Checking if user exists:', email);
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      console.log('❌ User already exists:', email);
      await safeAuditLog({
        userId: null,
        action: 'user_created',
        success: false,
        errorMessage: 'Registration attempt with existing email',
        ipAddress: clientIP,
        userAgent,
        targetEmail: email,
        severity: 'low',
        category: 'auth'
      });
      
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create new user
    console.log('✅ Creating new user in MongoDB:', email);
    const user = new User({
      email,
      password, // Will be hashed by pre-save middleware
      role: 'shareholder', // Default role
      profile: {
        name,
        phone: phone || '',
        address: address || ''
      },
      isActive: true,
      security: {
        emailVerified: false, // In production, require email verification
        twoFactorEnabled: false
      }
    });
    
    // Save to MongoDB
    await user.save();
    console.log('✅ User saved to MongoDB with ID:', user._id);
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Log successful registration
    const duration = Date.now() - startTime;
    await safeAuditLog({
      userId: user._id,
      action: 'user_created',
      success: true,
      ipAddress: clientIP,
      userAgent,
      details: {
        registrationMethod: 'email',
        userRole: user.role
      },
      duration,
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
    
    console.log('✅ Registration completed successfully for:', email);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    
    const duration = Date.now() - startTime;
    
    await safeAuditLog({
      userId: null,
      action: 'user_created',
      success: false,
      errorMessage: error.message,
      ipAddress: clientIP,
      userAgent,
      targetEmail: req.body.email,
      duration,
      severity: 'medium',
      category: 'auth'
    });
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// FIXED: Login route that properly checks MongoDB
router.post('/login', loginValidation, async (req, res) => {
  const startTime = Date.now();
  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  try {
    console.log('🔍 Login attempt started for:', req.body.email);
    
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
    console.log('🔍 Finding user in MongoDB:', email);
    const user = await User.findByEmail(email).select('+password +security');
    
    if (!user) {
      console.log('❌ User not found in MongoDB:', email);
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
    
    console.log('✅ User found in MongoDB:', user._id);
    
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
    console.log('🔍 Verifying password...');
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user._id);
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
    
    console.log('✅ Password verified for user:', user._id);
    
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
    
    console.log('✅ Login completed successfully for:', user.email);
    
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
    console.error('❌ Login failed:', error);
    
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

// Helper function to generate temporary token for 2FA
function generateTempToken(userId) {
  return jwt.sign(
    { userId, type: 'temp_2fa' },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );
}

// ... (rest of the auth routes like logout, refresh, 2FA setup, etc.)

module.exports = router;