const { logActivity } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error('Error:', err);

  // Log activity if user is authenticated
  if (req.user) {
    logActivity(req.user._id, 'System', 'Error occurred', {
      targetResource: {
        resourceType: 'System',
        resourceName: req.originalUrl,
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestMethod: req.method,
        requestUrl: req.originalUrl,
        responseStatus: 500,
      },
      severity: 'High',
      status: 'Failed',
      errorDetails: {
        errorMessage: err.message,
        stackTrace: err.stack,
      },
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = { message, statusCode: 400 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for field: ${field}`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large';
    error = { message, statusCode: 400 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  console.error('Stack:', err.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

module.exports = errorHandler;