const ApiError = require('../utils/ApiError');

function notFoundHandler(_req, _res, next) {
  next(new ApiError(404, 'Route not found'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    error: true,
    message,
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = { notFoundHandler, errorHandler };
