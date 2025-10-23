const ActivityLog = require('../models/ActivityLog');

const logActivity = (action, description, resource = null) => {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json;
    
    // Override res.json to log after response
    res.json = function(data) {
      // Log activity asynchronously (don't wait for it)
      if (req.user) {
        ActivityLog.create({
          user: req.user._id,
          action,
          description,
          resource,
          resourceId: req.params.id || req.body.id,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          metadata: {
            method: req.method,
            url: req.originalUrl,
            body: req.method !== 'GET' ? req.body : undefined
          }
        }).catch(err => console.error('Activity logging error:', err));
      }
      
      // Call original res.json
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = { logActivity };
