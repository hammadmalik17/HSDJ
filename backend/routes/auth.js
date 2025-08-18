// // routes/auth.js - FIXED REGISTRATION
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { body, validationResult } = require('express-validator');
// const speakeasy = require('speakeasy');
// const qrcode = require('qrcode');

// const User = require('../models/User');
// const AuditLog = require('../models/AuditLog');
// const { generateTokens, verifyToken, getClientIP } = require('../middleware/auth');

// const router = express.Router();

// // Safe audit log function (won't crash if audit fails)
// const safeAuditLog = async (logData) => {
//   try {
//     await AuditLog.createLog(logData);
//   } catch (error) {
//     console.warn('Audit logging failed:', error.message);
//   }
// };

// // Validation rules
// const registerValidation = [
//   body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
//   body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
//     .withMessage('Password must contain at least one uppercase, lowercase, number and special character'),
//   body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
//   body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
//   body('address').optional().isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters')
// ];

// const loginValidation = [
//   body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
//   body('password').isLength({ min: 1 }).withMessage('Password is required')
// ];

// // FIXED: Register route that properly saves to MongoDB
// router.post('/register', registerValidation, async (req, res) => {
//   const startTime = Date.now();
//   const clientIP = getClientIP(req);
//   const userAgent = req.headers['user-agent'] || 'Unknown';
  
//   try {
//     console.log('🔍 Registration attempt started for:', req.body.email);
    
//     // Check validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log('❌ Validation failed:', errors.array());
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }
    
//     const { email, password, name, phone, address } = req.body;
    
//     // Check if user already exists
//     console.log('🔍 Checking if user exists:', email);
//     const existingUser = await User.findByEmail(email);
    
//     if (existingUser) {
//       console.log('❌ User already exists:', email);
//       await safeAuditLog({
//         userId: null,
//         action: 'user_created',
//         success: false,
//         errorMessage: 'Registration attempt with existing email',
//         ipAddress: clientIP,
//         userAgent,
//         targetEmail: email,
//         severity: 'low',
//         category: 'auth'
//       });
      
//       return res.status(400).json({
//         success: false,
//         message: 'Email already registered'
//       });
//     }
    
//     // Create new user
//     console.log('✅ Creating new user in MongoDB:', email);
//     const user = new User({
//       email,
//       password, // Will be hashed by pre-save middleware
//       role: 'shareholder', // Default role
//       profile: {
//         name,
//         phone: phone || '',
//         address: address || ''
//       },
//       isActive: true,
//       security: {
//         emailVerified: false, // In production, require email verification
//         twoFactorEnabled: false
//       }
//     });
    
//     // Save to MongoDB
//     await user.save();
//     console.log('✅ User saved to MongoDB with ID:', user._id);
    
//     // Generate tokens
//     const { accessToken, refreshToken } = generateTokens(user._id);
    
//     // Log successful registration
//     const duration = Date.now() - startTime;
//     await safeAuditLog({
//       userId: user._id,
//       action: 'user_created',
//       success: true,
//       ipAddress: clientIP,
//       userAgent,
//       details: {
//         registrationMethod: 'email',
//         userRole: user.role
//       },
//       duration,
//       severity: 'low',
//       category: 'auth'
//     });
    
//     // Set secure cookies
//     const cookieOptions = {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//     };
    
//     res.cookie('accessToken', accessToken, cookieOptions);
//     res.cookie('refreshToken', refreshToken, cookieOptions);
    
//     console.log('✅ Registration completed successfully for:', email);
    
//     res.status(201).json({
//       success: true,
//       message: 'Registration successful',
//       data: {
//         user: {
//           id: user._id,
//           email: user.email,
//           name: user.profile.name,
//           role: user.role,
//           isActive: user.isActive,
//           createdAt: user.createdAt
//         },
//         tokens: {
//           accessToken,
//           refreshToken
//         }
//       }
//     });
    
//   } catch (error) {
//     console.error('❌ Registration failed:', error);
    
//     const duration = Date.now() - startTime;
    
//     await safeAuditLog({
//       userId: null,
//       action: 'user_created',
//       success: false,
//       errorMessage: error.message,
//       ipAddress: clientIP,
//       userAgent,
//       targetEmail: req.body.email,
//       duration,
//       severity: 'medium',
//       category: 'auth'
//     });
    
//     res.status(500).json({
//       success: false,
//       message: 'Registration failed',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });
// a
// // FIXED: Login route that properly checks MongoDB
// router.post('/login', loginValidation, async (req, res) => {
//   const startTime = Date.now();
//   const clientIP = getClientIP(req);
//   const userAgent = req.headers['user-agent'] || 'Unknown';
  
//   try {
//     console.log('🔍 Login attempt started for:', req.body.email);
    
//     // Check validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }
    
//     const { email, password, twoFactorToken } = req.body;
    
//     // Find user and include password for comparison
//     console.log('🔍 Finding user in MongoDB:', email);
//     const user = await User.findByEmail(email).select('+password +security');
    
//     if (!user) {
//       console.log('❌ User not found in MongoDB:', email);
//       await safeAuditLog({
//         userId: null,
//         action: 'login_failed',
//         success: false,
//         errorMessage: 'User not found',
//         ipAddress: clientIP,
//         userAgent,
//         targetEmail: email,
//         severity: 'medium',
//         category: 'auth'
//       });
      
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }
    
//     console.log('✅ User found in MongoDB:', user._id);
    
//     // Check if account is locked
//     if (user.isLocked) {
//       await safeAuditLog({
//         userId: user._id,
//         action: 'login_failed',
//         success: false,
//         errorMessage: 'Account is locked',
//         ipAddress: clientIP,
//         userAgent,
//         severity: 'high',
//         category: 'auth'
//       });
      
//       return res.status(401).json({
//         success: false,
//         message: 'Account is temporarily locked due to too many failed attempts'
//       });
//     }
    
//     // Check if account is active
//     if (!user.isActive) {
//       await safeAuditLog({
//         userId: user._id,
//         action: 'login_failed',
//         success: false,
//         errorMessage: 'Account is inactive',
//         ipAddress: clientIP,
//         userAgent,
//         severity: 'medium',
//         category: 'auth'
//       });
      
//       return res.status(401).json({
//         success: false,
//         message: 'Account is inactive'
//       });
//     }
    
//     // Check password
//     console.log('🔍 Verifying password...');
//     const isPasswordValid = await user.comparePassword(password);
    
//     if (!isPasswordValid) {
//       console.log('❌ Invalid password for user:', user._id);
//       // Increment failed login attempts
//       await user.incLoginAttempts();
      
//       await safeAuditLog({
//         userId: user._id,
//         action: 'login_failed',
//         success: false,
//         errorMessage: 'Invalid password',
//         ipAddress: clientIP,
//         userAgent,
//         severity: 'medium',
//         category: 'auth'
//       });
      
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }
    
//     console.log('✅ Password verified for user:', user._id);
    
//     // Check 2FA if enabled
//     if (user.security.twoFactorEnabled) {
//       if (!twoFactorToken) {
//         return res.status(200).json({
//           success: false,
//           message: 'Two-factor authentication required',
//           requires2FA: true,
//           tempToken: generateTempToken(user._id) // 5-minute temp token for 2FA
//         });
//       }
      
//       const verified = speakeasy.totp.verify({
//         secret: user.security.twoFactorSecret,
//         encoding: 'base32',
//         token: twoFactorToken,
//         window: 2
//       });
      
//       if (!verified) {
//         await safeAuditLog({
//           userId: user._id,
//           action: 'login_failed',
//           success: false,
//           errorMessage: 'Invalid 2FA token',
//           ipAddress: clientIP,
//           userAgent,
//           severity: 'high',
//           category: 'auth'
//         });
        
//         return res.status(401).json({
//           success: false,
//           message: 'Invalid two-factor authentication code'
//         });
//       }
//     }
    
//     // Reset login attempts on successful login
//     if (user.security.loginAttempts > 0) {
//       await user.resetLoginAttempts();
//     }
    
//     // Update last login
//     await user.updateLastLogin();
    
//     // Generate tokens
//     const { accessToken, refreshToken } = generateTokens(user._id);
    
//     // Log successful login
//     const duration = Date.now() - startTime;
//     await safeAuditLog({
//       userId: user._id,
//       action: 'login',
//       success: true,
//       ipAddress: clientIP,
//       userAgent,
//       duration,
//       details: {
//         twoFactorUsed: user.security.twoFactorEnabled
//       },
//       severity: 'low',
//       category: 'auth'
//     });
    
//     // Set secure cookies
//     const cookieOptions = {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//     };
    
//     res.cookie('accessToken', accessToken, cookieOptions);
//     res.cookie('refreshToken', refreshToken, cookieOptions);
    
//     console.log('✅ Login completed successfully for:', user.email);
    
//     res.json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         user: {
//           id: user._id,
//           email: user.email,
//           name: user.profile.name,
//           role: user.role,
//           twoFactorEnabled: user.security.twoFactorEnabled,
//           lastLogin: user.security.lastLogin
//         },
//         tokens: {
//           accessToken,
//           refreshToken
//         }
//       }
//     });
    
//   } catch (error) {
//     console.error('❌ Login failed:', error);
    
//     const duration = Date.now() - startTime;
    
//     await safeAuditLog({
//       userId: null,
//       action: 'login_failed',
//       success: false,
//       errorMessage: error.message,
//       ipAddress: clientIP,
//       userAgent,
//       duration,
//       severity: 'high',
//       category: 'auth'
//     });
    
//     res.status(500).json({
//       success: false,
//       message: 'Login failed',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// // Helper function to generate temporary token for 2FA
// function generateTempToken(userId) {
//   return jwt.sign(
//     { userId, type: 'temp_2fa' },
//     process.env.JWT_SECRET,
//     { expiresIn: '5m' }
//   );
// }

// // ... (rest of the auth routes like logout, refresh, 2FA setup, etc.)

// module.exports = router;



// routes/auth.js - CLEAN SIMPLIFIED VERSION
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

// SIMPLIFIED registration - minimal validation to get it working
router.post('/register', async (req, res) => {
  try {
    console.log('🚀 Registration started for:', req.body.email);
    
    const { email, password, name, phone, address } = req.body;
    
    // Basic validation only
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }
    
    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    console.log('✅ Email available, creating user...');
    
    // Create user with minimal data
    const userData = {
      email: email.toLowerCase(),
      password: password, // Will be hashed by pre-save middleware
      role: 'shareholder',
      profile: {
        name: name,
        phone: phone || '',
        address: address || ''
      },
      isActive: true,
      security: {
        emailVerified: true, // Skip email verification for now
        twoFactorEnabled: false
      }
    };
    
    console.log('📝 Creating user object...');
    const user = new User(userData);
    
    console.log('💾 Saving to MongoDB...');
    const savedUser = await user.save();
    
    console.log('✅ User saved successfully!');
    console.log('🆔 User ID:', savedUser._id);
    console.log('📧 Email:', savedUser.email);
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(savedUser._id);
    
    // Verify user is in database
    const verifyUser = await User.findById(savedUser._id);
    console.log('🔍 Verification: User found in DB:', !!verifyUser);
    
    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    
    console.log('✅ Registration completed successfully');
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: savedUser._id,
          email: savedUser.email,
          name: savedUser.profile.name,
          role: savedUser.role,
          createdAt: savedUser.createdAt
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    console.error('📊 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    let errorMessage = 'Registration failed';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation failed: ' + Object.keys(error.errors).map(key => error.errors[key].message).join(', ');
      statusCode = 400;
    } else if (error.code === 11000) {
      errorMessage = 'Email already exists';
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// SIMPLIFIED login
router.post('/login', async (req, res) => {
  try {
    console.log('🔑 Login started for:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user with password
    console.log('🔍 Finding user...');
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +security');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('✅ User found:', user._id);
    
    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account inactive');
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }
    
    // Check password
    console.log('🔍 Checking password...');
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('✅ Password valid');
    
    // Update last login
    await user.updateLastLogin();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    
    console.log('✅ Login successful');
    
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
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
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

// 2FA Setup
router.post('/setup-2fa', async (req, res) => {
  try {
    const token = extractToken(req);
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
    
    if (user.security.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is already enabled'
      });
    }
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Real Estate Platform (${user.email})`,
      issuer: 'Real Estate Platform'
    });
    
    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    // Save secret (but don't enable yet)
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

// 2FA Verification
router.post('/verify-2fa', async (req, res) => {
  try {
    const { token: twoFactorToken } = req.body;
    const token = extractToken(req);
    
    if (!token || !twoFactorToken) {
      return res.status(400).json({
        success: false,
        message: 'Authentication token and 2FA token are required'
      });
    }
    
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('+security');
    
    if (!user || !user.security.twoFactorSecret) {
      return res.status(404).json({
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

// Helper function to extract token
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
}

module.exports = router;