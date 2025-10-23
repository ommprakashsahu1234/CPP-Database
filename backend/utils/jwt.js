const jwt = require('jsonwebtoken');
const { getConfig } = require('../config/env');

function signAccessToken(payload) {
  const { accessSecret, accessExpiresIn } = getConfig().jwt;
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn });
}

function signRefreshToken(payload) {
  const { refreshSecret, refreshExpiresIn } = getConfig().jwt;
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiresIn });
}

function verifyAccessToken(token) {
  const { accessSecret } = getConfig().jwt;
  return jwt.verify(token, accessSecret);
}

function verifyRefreshToken(token) {
  const { refreshSecret } = getConfig().jwt;
  return jwt.verify(token, refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
