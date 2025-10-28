import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (userId, userType, userName, userEmail, action, actionType, entity = {}, details = {}, status = 'success') => {
  try {
    await ActivityLog.create({
      user: {
        userId,
        userType,
        userName,
        userEmail
      },
      action,
      actionType,
      entity,
      details,
      status
    });
  } catch (error) {
    console.error('Activity logging failed:', error);
  }
};

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};
