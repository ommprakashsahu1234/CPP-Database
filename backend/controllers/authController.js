import Admin from '../models/Admin.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { logActivity } from '../middlewares/logger.js';

const getModel = (role) => {
  switch (role) {
    case 'admin':
      return Admin;
    case 'teacher':
      return Teacher;
    case 'student':
      return Student;
    default:
      return null;
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const Model = getModel(role);
    if (!Model) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, role);
    const refreshToken = generateRefreshToken(user._id, role);

    // Log activity
    await logActivity(
      user._id,
      role.charAt(0).toUpperCase() + role.slice(1),
      user.name,
      user.email,
      'User logged in',
      'login',
      {},
      { email: user.email }
    );

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const Model = getModel(decoded.role);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await Model.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    const newToken = generateToken(user._id, decoded.role);
    const newRefreshToken = generateRefreshToken(user._id, decoded.role);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const Model = getModel(req.user.role);
    const user = await Model.findById(req.user.id)
      .select('-password')
      .populate('class section subjects', 'name code grade');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, parentPhone } = req.body;
    const Model = getModel(req.user.role);

    const user = await Model.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (parentPhone && req.user.role === 'student') user.parentPhone = parentPhone;

    await user.save();

    await logActivity(
      user._id,
      req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
      user.name,
      user.email,
      'Profile updated',
      'update',
      { entityType: 'Profile', entityId: user._id }
    );

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const Model = getModel(req.user.role);

    const user = await Model.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await logActivity(
      user._id,
      req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
      user.name,
      user.email,
      'Password changed',
      'update',
      { entityType: 'Password', entityId: user._id }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};
