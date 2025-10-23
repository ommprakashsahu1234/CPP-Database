const express = require('express');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication and student authorization to all routes
router.use(authenticateToken);
router.use(authorize('student'));

// Placeholder routes - will be implemented later
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Student dashboard - Coming soon',
    data: { user: req.user }
  });
});

module.exports = router;
