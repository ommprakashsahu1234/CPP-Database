import express from 'express';
import {
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { loginValidation } from '../middlewares/validation.js';

const router = express.Router();

router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
