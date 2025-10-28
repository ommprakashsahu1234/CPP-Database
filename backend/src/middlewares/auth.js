import createError from 'http-errors';
import { verifyAccessToken } from '../utils/jwt.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(createError(401, 'Authentication required'));
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    return next(createError(401, 'Invalid or expired token'));
  }
}

export function requireRoles(...roles) {
  return function roleGuard(req, _res, next) {
    if (!req.user) return next(createError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) return next(createError(403, 'Insufficient permissions'));
    return next();
  };
}
