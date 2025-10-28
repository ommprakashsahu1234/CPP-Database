const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAuth(['TEACHER', 'ADMIN']));

router.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    res.status(200).json({ ok: true, scope: 'teacher' });
  })
);

module.exports = router;
