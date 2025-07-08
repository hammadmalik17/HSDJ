const AuditLog = require('../models/AuditLog');

// Global error handling middleware
const errorHandler = async (err, req, res, next) => {
  console.error('Error occurred:', err);
  
  let error = { ...err };
  error.message = err.message;
  
  // Log error to audit system if user is authenticated
  if (req.user) {
    try {
      await AuditLog.createLog({
        userId: req.user._id,
        action: 'system_error',
        success: false,
        errorMessage: error.message,
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'] || 'Unknown',
        details: {
          method: req.method,
          path: req.path,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        },
        severity: 'high',
        category: 'system'
      });
    } catch (logError) {
      console.error('Failed to log error to audit system:', logError);
    }
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      statusCode: 400,
      message: `Validation Error: ${message}`
    };
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field} field`;
    error = {
      statusCode: 400,
      message
    };
  }
  
  // Mongoose ObjectId error
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = {
      statusCode: 400,
      message
    };
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Invalid token'
    };
  }
  
  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token expired'
    };
  }
  
  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      statusCode: 400,
      message: 'File size too large'
    };
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      statusCode: 400,
      message: 'Too many files uploaded'
    };
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      statusCode: 400,
      message: 'Unexpected file field'
    };
  }
  
  // MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    error = {
      statusCode: 503,
      message: 'Database connection error'
    };
  }
  
  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    error = {
      statusCode: 403,
      message: 'CORS policy violation'
    };
  }
  
  // Rate limiting errors
  if (err.status === 429) {
    error = {
      statusCode: 429,
      message: 'Too many requests, please try again later'
    };
  }
  
  // Set default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  // Prepare response
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack
    })
  };
  
  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      response.message = 'Internal Server Error';
    }
  }
  
  res.status(statusCode).json(response);
};

// Helper function to get client IP
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         '127.0.0.1';
}

module.exports = errorHandler;