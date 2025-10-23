const http = require('http');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const { getConfig } = require('./config/env');
const { connectMongo } = require('./config/db');
const { applySecurityMiddleware } = require('./middlewares/security');
const { notFoundHandler, errorHandler } = require('./middlewares/error');

const routes = require('./routes');

const config = getConfig();

const app = express();

// Core middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Security middleware
applySecurityMiddleware(app, config);

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'tms-backend', env: config.nodeEnv });
});

// API routes
app.use('/api', routes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize server only if this is the main module
const startServer = async () => {
  await connectMongo(config.mongoUri);
  const server = http.createServer(app);
  server.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`TMS backend listening on port ${config.port}`);
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { app, startServer };
