const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { USER_ROLES } = require('../models/User');

const router = express.Router();

router.use(requireAuth(['ADMIN']));

router.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    res.status(200).json({ ok: true, scope: 'admin' });
  })
);

module.exports = router;
