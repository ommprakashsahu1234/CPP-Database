const express = require('express');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Placeholder routes - will be implemented later
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Email routes - Coming soon',
    data: { user: req.user }
  });
});

module.exports = router;
