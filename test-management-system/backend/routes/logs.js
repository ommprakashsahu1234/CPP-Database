const express = require('express');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(authorize('admin'));

// Placeholder routes - will be implemented later
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Activity logs - Coming soon',
    data: { user: req.user }
  });
});

module.exports = router;
