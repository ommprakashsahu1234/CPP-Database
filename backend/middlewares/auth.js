const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { getConfig } = require('../config/env');

function requireAuth(allowedRoles = []) {
  return function middleware(req, _res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return next(new ApiError(401, 'Authentication required'));
    }
    try {
      const { accessSecret } = getConfig().jwt;
      const decoded = jwt.verify(token, accessSecret);
      req.user = { id: decoded.sub, role: decoded.role };
      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return next(new ApiError(403, 'Forbidden'));
      }
      return next();
    } catch (_err) {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
  };
}

module.exports = { requireAuth };
