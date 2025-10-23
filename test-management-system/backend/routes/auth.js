const express = require('express');
const {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  changePassword,
} = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { validationRules, handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (should be restricted to admin in production)
router.post('/register', 
  validationRules.registerUser,
  handleValidationErrors,
  register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  validationRules.loginUser,
  handleValidationErrors,
  login
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, logout);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password',
  authenticateToken,
  validationRules.changePassword,
  handleValidationErrors,
  changePassword
);

module.exports = router;