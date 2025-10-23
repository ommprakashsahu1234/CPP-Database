const express = require('express');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication and teacher authorization to all routes
router.use(authenticateToken);
router.use(authorize('teacher'));

// Placeholder routes - will be implemented later
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Teacher dashboard - Coming soon',
    data: { user: req.user }
  });
});

module.exports = router;
