const AuditLog = require('../models/AuditLog');

// Middleware to automatically log API requests
const auditLogger = async (req, res, next) => {
  // Skip logging for health checks and static files
  if (req.path === '/api/health' || req.path.startsWith('/uploads/')) {
    return next();
  }
  
  // Store original end function
  const originalEnd = res.end;
  const startTime = Date.now();
  
  // Override res.end to capture response
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    // Only log if we have a user (authenticated requests)
    if (req.user) {
      // Determine action based on method and path
      const action = determineAction(req.method, req.path);
      
      // Skip logging certain low-value actions
      if (action && !['system_access', 'profile_viewed'].includes(action)) {
        const logData = {
          userId: req.user._id,
          action,
          success,
          ipAddress: getClientIP(req),
          userAgent: req.headers['user-agent'] || 'Unknown',
          duration,
          details: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            query: Object.keys(req.query).length > 0 ? req.query : undefined,
            bodySize: req.headers['content-length'] || 0
          }
        };
        
        // Add error message if request failed
        if (!success) {
          logData.errorMessage = `HTTP ${res.statusCode}`;
          logData.severity = res.statusCode >= 500 ? 'high' : 'medium';
        }
        
        // Log asynchronously to avoid blocking response
        setImmediate(async () => {
          try {
            await AuditLog.createLog(logData);
          } catch (error) {
            console.error('Audit logging failed:', error);
          }
        });
      }
    }
    
    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Helper function to determine action from request
function determineAction(method, path) {
  const pathSegments = path.split('/').filter(Boolean);
  
  // Skip non-API paths
  if (!path.startsWith('/api/')) {
    return null;
  }
  
  // Authentication actions
  if (path.includes('/auth/')) {
    if (path.includes('/login')) return 'login';
    if (path.includes('/logout')) return 'logout';
    if (path.includes('/register')) return 'user_created';
    if (path.includes('/2fa')) return method === 'POST' ? '2fa_enabled' : '2fa_disabled';
    return 'auth_action';
  }
  
  // User management actions
  if (path.includes('/users/')) {
    if (method === 'GET' && path.includes('/profile')) return null; // Skip profile views
    if (method === 'POST' && path.includes('/picture')) return 'profile_updated';
    if (method === 'PUT' && path.includes('/password')) return 'password_changed';
    if (method === 'POST') return 'user_created';
    if (method === 'PUT') return 'user_updated';
    if (method === 'DELETE') return 'user_deleted';
    return null;
  }
  
  // Share management actions
  if (path.includes('/shares/')) {
    if (method === 'POST') return 'share_assigned';
    if (method === 'PUT') return 'share_updated';
    if (method === 'DELETE') return 'share_deleted';
    return null;
  }
  
  // Certificate actions
  if (path.includes('/certificates/')) {
    if (method === 'POST') return 'certificate_uploaded';
    if (path.includes('/approve')) return 'certificate_approved';
    if (path.includes('/reject')) return 'certificate_rejected';
    if (path.includes('/download')) return 'certificate_downloaded';
    if (method === 'DELETE') return 'certificate_deleted';
    return null;
  }
  
  // Audit actions
  if (path.includes('/audit/')) {
    return 'report_generated';
  }
  
  return null;
}

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

module.exports = {
  auditLogger
};