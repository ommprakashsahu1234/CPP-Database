const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const xssClean = require('xss-clean');
const hpp = require('hpp');

function applySecurityMiddleware(app, config) {
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(xssClean());
  app.use(hpp());

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: config.rateLimit.standardHeaders,
    legacyHeaders: config.rateLimit.legacyHeaders,
  });

  app.use('/api', limiter);
}

module.exports = { applySecurityMiddleware };
