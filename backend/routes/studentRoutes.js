import express from 'express';
import {
  getAvailableTests,
  getTestForAttempt,
  startTest,
  submitTest,
  getStudentResults,
  getResultById,
  downloadResultPDF,
  getPerformanceAnalytics,
  requestProfileChange
} from '../controllers/studentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { idValidation } from '../middlewares/validation.js';

const router = express.Router();

// All routes require student authentication
router.use(authenticate);
router.use(authorize('student'));

// Test Access
router.get('/tests', getAvailableTests);
router.get('/tests/:testId', getTestForAttempt);
router.post('/tests/:testId/start', startTest);
router.post('/tests/:testId/submit', submitTest);

// Results
router.get('/results', getStudentResults);
router.get('/results/:resultId', idValidation, getResultById);
router.get('/results/:resultId/download', idValidation, downloadResultPDF);

// Analytics
router.get('/analytics', getPerformanceAnalytics);

// Profile Change Request
router.post('/requests/profile-change', requestProfileChange);

export default router;
