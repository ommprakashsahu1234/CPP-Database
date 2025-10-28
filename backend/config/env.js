const dotenv = require('dotenv');

let cachedConfig = null;

function getBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  return String(value).toLowerCase() === 'true';
}

function getNumber(value, fallback) {
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return num;
}

function getConfig() {
  if (cachedConfig) return cachedConfig;

  dotenv.config();

  const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/tms',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me-access',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh',
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    rateLimit: {
      windowMs: getNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      max: getNumber(process.env.RATE_LIMIT_MAX, 200),
      standardHeaders: true,
      legacyHeaders: false,
    },
    cookies: {
      secure: getBoolean(process.env.COOKIE_SECURE, false),
    },
  };

  cachedConfig = config;
  return config;
}

module.exports = { getConfig };
