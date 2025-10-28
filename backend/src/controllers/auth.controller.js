import createError from 'http-errors';
import Joi from 'joi';
import User from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export async function login(req, res, next) {
  try {
    const { email, password } = await loginSchema.validateAsync(req.body, { abortEarly: false });
    const user = await User.findOne({ email, isActive: true });
    if (!user) throw createError(401, 'Invalid credentials');

    const ok = await user.comparePassword(password);
    if (!ok) throw createError(401, 'Invalid credentials');

    const accessToken = signAccessToken({ sub: user._id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user._id, role: user.role });

    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      tokens: { accessToken, refreshToken },
    });
  } catch (err) {
    if (err.isJoi) return next(createError(400, 'Invalid input'));
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { token } = req.body || {};
    if (!token) throw createError(400, 'Refresh token required');
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });
    res.status(200).json({ accessToken });
  } catch (err) {
    next(createError(401, 'Invalid refresh token'));
  }
}
