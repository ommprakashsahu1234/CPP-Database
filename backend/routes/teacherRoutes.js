import express from 'express';
import {
  createTest,
  getTeacherTests,
  getTestById,
  updateTest,
  deleteTest,
  publishTest,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  createStudentGroup,
  getTeacherGroups,
  getTestResults,
  generateTestResultsExcel,
  requestSubjectAssignment
} from '../controllers/teacherController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { createTestValidation, createQuestionValidation, idValidation } from '../middlewares/validation.js';

const router = express.Router();

// All routes require teacher authentication
router.use(authenticate);
router.use(authorize('teacher'));

// Test Management
router.post('/tests', createTestValidation, createTest);
router.get('/tests', getTeacherTests);
router.get('/tests/:id', idValidation, getTestById);
router.put('/tests/:id', idValidation, updateTest);
router.delete('/tests/:id', idValidation, deleteTest);
router.put('/tests/:id/publish', idValidation, publishTest);

// Question Management
router.post('/tests/:testId/questions', createQuestionValidation, addQuestion);
router.put('/questions/:id', idValidation, updateQuestion);
router.delete('/questions/:id', idValidation, deleteQuestion);

// Student Groups
router.post('/groups', createStudentGroup);
router.get('/groups', getTeacherGroups);

// Reports
router.get('/tests/:testId/results', getTestResults);
router.get('/tests/:testId/results/excel', generateTestResultsExcel);

// Requests
router.post('/requests/subject-assignment', requestSubjectAssignment);

export default router;
