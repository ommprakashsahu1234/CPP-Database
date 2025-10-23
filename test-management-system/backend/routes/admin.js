const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorize } = require('../middlewares/auth');
const { logActivity } = require('../middlewares/activityLogger');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/users', logActivity('VIEW_USERS', 'Viewed users list'), adminController.getUsers);

router.post('/users', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'teacher', 'student']),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim()
], logActivity('CREATE_USER', 'Created new user'), adminController.createUser);

router.put('/users/:id', logActivity('UPDATE_USER', 'Updated user'), adminController.updateUser);

router.delete('/users/:id', logActivity('DELETE_USER', 'Deleted user'), adminController.deleteUser);

router.patch('/users/:id/toggle-status', logActivity('TOGGLE_USER_STATUS', 'Toggled user status'), adminController.toggleUserStatus);

module.exports = router;
