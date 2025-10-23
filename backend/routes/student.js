const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAuth(['STUDENT', 'ADMIN']));

router.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    res.status(200).json({ ok: true, scope: 'student' });
  })
);

module.exports = router;
