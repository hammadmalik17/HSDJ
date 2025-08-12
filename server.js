const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const shareRoutes = require('./routes/shares');
const certificateRoutes = require('./routes/certificates');
const auditRoutes = require('./routes/audit');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { auditLogger } = require('./middleware/auditLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      process.env.CLIENT_URL_PROD,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }, // 10MB default
  abortOnLimit: true,
  responseOnLimit: "File size limit exceeded",
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Audit logging middleware
app.use(auditLogger);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate_shareholders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  
  // Create super admin if it doesn't exist
  require('./utils/createSuperAdmin')();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = process.env.UPLOAD_PATH || './uploads/certificates/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/shares', authenticateToken, shareRoutes);
app.use('/api/certificates', authenticateToken, certificateRoutes);
app.use('/api/audit', authenticateToken, auditRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API root endpoint - provides information about available endpoints
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Real Estate Shareholder Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      authentication: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register', 
        logout: 'POST /api/auth/logout',
        refresh: 'POST /api/auth/refresh',
        setup2FA: 'POST /api/auth/setup-2fa',
        verify2FA: 'POST /api/auth/verify-2fa',
        disable2FA: 'POST /api/auth/disable-2fa'
      },
      users: {
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
        uploadPicture: 'POST /api/users/profile/picture',
        changePassword: 'PUT /api/users/profile/password',
        listUsers: 'GET /api/users (Directors only)',
        getUser: 'GET /api/users/:userId',
        createUser: 'POST /api/users (Directors only)',
        updateUser: 'PUT /api/users/:userId',
        deleteUser: 'DELETE /api/users/:userId (Directors only)',
        dashboard: 'GET /api/users/:userId/dashboard'
      },
      shares: {
        listShares: 'GET /api/shares',
        getShare: 'GET /api/shares/:shareId',
        assignShare: 'POST /api/shares (Directors only)',
        updateShare: 'PUT /api/shares/:shareId (Directors only)',
        updateValue: 'PUT /api/shares/:shareId/value (Directors only)',
        transferShare: 'PUT /api/shares/:shareId/transfer (Directors only)',
        deleteShare: 'DELETE /api/shares/:shareId (Directors only)',
        portfolio: 'GET /api/shares/portfolio/:shareholderId',
        history: 'GET /api/shares/:shareId/history'
      },
      certificates: {
        listCertificates: 'GET /api/certificates',
        getCertificate: 'GET /api/certificates/:certificateId',
        uploadCertificate: 'POST /api/certificates/upload',
        approveCertificate: 'PUT /api/certificates/:certificateId/approve (Directors only)',
        rejectCertificate: 'PUT /api/certificates/:certificateId/reject (Directors only)',
        bulkApprove: 'PUT /api/certificates/bulk/approve/:shareholderId (Directors only)',
        bulkReject: 'PUT /api/certificates/bulk/reject/:shareholderId (Directors only)',
        downloadCertificate: 'GET /api/certificates/:certificateId/download',
        deleteCertificate: 'DELETE /api/certificates/:certificateId',
        pendingStats: 'GET /api/certificates/stats/pending (Directors only)'
      },
      audit: {
        getLogs: 'GET /api/audit (Directors only)',
        getLogDetails: 'GET /api/audit/:logId (Directors only)',
        securityAlerts: 'GET /api/audit/security-alerts (Directors only)',
        failedLogins: 'GET /api/audit/failed-logins (Directors only)',
        userActivity: 'GET /api/audit/activity/:userId',
        suspiciousActivity: 'GET /api/audit/suspicious-activity (Super Admin only)',
        exportLogs: 'GET /api/audit/export (Super Admin only)',
        systemStats: 'GET /api/audit/stats (Super Admin only)'
      },
      system: {
        health: 'GET /api/health'
      }
    },
    documentation: {
      note: 'Most endpoints require authentication via Bearer token',
      roles: {
        visitor: 'Limited access - registration only',
        shareholder: 'Can view own data and upload certificates',
        director: 'Can manage all shareholders and shares',
        super_admin: 'Full system access including audit logs'
      },
      authentication: 'Include Authorization: Bearer <token> header for protected routes',
      chineseWall: 'Data access is restricted based on user roles and ownership'
    }
  });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Catch-all for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.path}`,
    availableEndpoints: 'Visit GET /api for available endpoints'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📱 API accessible at: http://localhost:${PORT}/api`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 Client should run on: http://localhost:3000`);
  }
});

module.exports = app;