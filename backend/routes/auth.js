const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { login, refresh } = require('../services/authService');

const router = express.Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await login({ email, password });
    res.status(200).json(result);
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await refresh({ refreshToken });
    res.status(200).json(tokens);
  })
);

module.exports = router;
