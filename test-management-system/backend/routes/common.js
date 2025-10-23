const express = require('express');
const { authenticateToken, optionalAuth } = require('../middlewares/auth');

const router = express.Router();

// Email Routes (authenticated users only)
router.use('/email', authenticateToken);

router.post('/email/send', (req, res) => {
  res.json({ success: true, message: 'Send email - TODO' });
});

router.post('/email/configure', (req, res) => {
  res.json({ success: true, message: 'Configure email settings - TODO' });
});

router.get('/email/templates', (req, res) => {
  res.json({ success: true, message: 'Get email templates - TODO' });
});

// File Upload Routes (authenticated users only)
router.use('/upload', authenticateToken);

router.post('/upload/profile-picture', (req, res) => {
  res.json({ success: true, message: 'Upload profile picture - TODO' });
});

router.post('/upload/document', (req, res) => {
  res.json({ success: true, message: 'Upload document - TODO' });
});

// Public Information Routes (optional authentication)
router.use('/info', optionalAuth);

router.get('/info/classes', (req, res) => {
  res.json({ success: true, message: 'Get classes info - TODO' });
});

router.get('/info/subjects', (req, res) => {
  res.json({ success: true, message: 'Get subjects info - TODO' });
});

router.get('/info/academic-years', (req, res) => {
  res.json({ success: true, message: 'Get academic years - TODO' });
});

// Notification Routes (authenticated users only)
router.use('/notifications', authenticateToken);

router.get('/notifications', (req, res) => {
  res.json({ success: true, message: 'Get notifications - TODO' });
});

router.put('/notifications/:id/read', (req, res) => {
  res.json({ success: true, message: 'Mark notification as read - TODO' });
});

router.delete('/notifications/:id', (req, res) => {
  res.json({ success: true, message: 'Delete notification - TODO' });
});

module.exports = router;