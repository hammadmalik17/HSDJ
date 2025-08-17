const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Modern Node.js v22 Compatible Encryption utilities
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY ;

function encrypt(text) {
  if (!text) return text;
  
  try {
    // Create proper 32-byte key
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    // Use createCipheriv (modern method)
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return original text if encryption fails
  }
}

function decrypt(text) {
  if (!text || !text.includes(':')) return text;
  
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    
    // Create proper 32-byte key
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    
    // Use createDecipheriv (modern method)
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return text; // Return original text if decryption fails
  }
}

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    },
    set: encrypt,
    get: decrypt
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['visitor', 'shareholder', 'director', 'super_admin'],
    default: 'visitor',
    required: true
  },
  profile: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      set: encrypt,
      get: decrypt
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
        },
        message: 'Please enter a valid phone number'
      },
      set: encrypt,
      get: decrypt
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
      set: encrypt,
      get: decrypt
    },
    profilePicture: {
      type: String,
      default: null
    }
  },
  security: {
    twoFactorSecret: {
      type: String,
      select: false
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
      default: null
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockoutUntil: {
      type: Date,
      default: null
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    getters: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.security.twoFactorSecret;
      delete ret.security.passwordResetToken;
      delete ret.security.passwordResetExpires;
      delete ret.security.emailVerificationToken;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    getters: true
  }
});

// Indexes for performance and security
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ 'security.lockoutUntil': 1 });

// Virtual for account lockout
UserSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockoutUntil && this.security.lockoutUntil > Date.now());
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to handle failed login attempts
UserSchema.methods.incLoginAttempts = function() {
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockoutTime = parseInt(process.env.LOCKOUT_TIME) || 30 * 60 * 1000; // 30 minutes
  
  // If we have a previous lockout and it's expired, start fresh
  if (this.security.lockoutUntil && this.security.lockoutUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockoutUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // Lock account after max attempts
  if (this.security.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { 'security.lockoutUntil': Date.now() + lockoutTime };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 
      'security.lockoutUntil': 1,
      'security.loginAttempts': 1 
    }
  });
};

// Method to update last login
UserSchema.methods.updateLastLogin = function() {
  return this.updateOne({
    $set: { 'security.lastLogin': new Date() }
  });
};

// Static method to find by email (handles encryption)
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email });
};

// Method to generate password reset token
UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.security.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.security.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Method to generate email verification token
UserSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.security.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  return verificationToken;
};

// Method to check if user can perform action (Chinese Wall)
UserSchema.methods.canAccess = function(targetUserId, action) {
  // Super admin can do everything
  if (this.role === 'super_admin') return true;
  
  // Directors can access all shareholders
  if (this.role === 'director') return true;
  
  // Shareholders can only access their own data
  if (this.role === 'shareholder') {
    return this._id.toString() === targetUserId.toString();
  }
  
  // Visitors can't access user data
  return false;
};

// Static method to get users with Chinese Wall enforcement
UserSchema.statics.findWithAccess = function(requestingUser, filters = {}) {
  if (requestingUser.role === 'director' || requestingUser.role === 'super_admin') {
    // Directors and super admins can see all users
    return this.find(filters);
  } else if (requestingUser.role === 'shareholder') {
    // Shareholders can only see themselves
    return this.find({ ...filters, _id: requestingUser._id });
  } else {
    // Visitors can't see user data
    return Promise.resolve([]);
  }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;