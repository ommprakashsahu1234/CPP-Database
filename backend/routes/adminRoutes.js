import express from 'express';
import {
  createTeacher,
  createStudent,
  getAllTeachers,
  getAllStudents,
  updateUser,
  deleteUser,
  createClass,
  createSection,
  createSubject,
  getProfileChangeRequests,
  approveProfileChangeRequest,
  rejectProfileChangeRequest,
  getSubjectAssignmentRequests,
  approveSubjectAssignmentRequest
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { createUserValidation, idValidation } from '../middlewares/validation.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// User Management
router.post('/teachers', createUserValidation, createTeacher);
router.post('/students', createUserValidation, createStudent);
router.get('/teachers', getAllTeachers);
router.get('/students', getAllStudents);
router.put('/users/:id', idValidation, updateUser);
router.delete('/users/:id', idValidation, deleteUser);

// Class Management
router.post('/classes', createClass);
router.post('/sections', createSection);
router.post('/subjects', createSubject);

// Request Management
router.get('/requests/profile-changes', getProfileChangeRequests);
router.put('/requests/profile-changes/:id/approve', idValidation, approveProfileChangeRequest);
router.put('/requests/profile-changes/:id/reject', idValidation, rejectProfileChangeRequest);
router.get('/requests/subject-assignments', getSubjectAssignmentRequests);
router.put('/requests/subject-assignments/:id/approve', idValidation, approveSubjectAssignmentRequest);

export default router;
