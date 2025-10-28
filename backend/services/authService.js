const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { User } = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

async function login({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token required');
  }
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid token');
    }
    const payload = { sub: user._id.toString(), role: user.role };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  } catch (err) {
    throw new ApiError(401, 'Invalid token');
  }
}

module.exports = { login, refresh };
