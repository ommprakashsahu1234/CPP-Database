import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import createError from 'http-errors';
import { connectToDatabase } from './config/database.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import studentRoutes from './routes/student.routes.js';
import { requireAuth, requireRoles } from './middlewares/auth.js';

const app = express();

// Security & parsing middlewares
app.use(helmet());
// Allow dev origins and send credentials; origin=true reflects request origin
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(xss());
app.use(morgan('dev'));

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', apiLimiter);

// Health check
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

// Connect DB
connectToDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', requireAuth, requireRoles('admin'), adminRoutes);
app.use('/api/teacher', requireAuth, requireRoles('teacher', 'admin'), teacherRoutes);
app.use('/api/student', requireAuth, requireRoles('student', 'admin'), studentRoutes);

// 404 handler
app.use((_req, _res, next) => {
  next(createError(404, 'Route not found'));
});

// Central error handler
app.use(errorHandler);

export default app;
