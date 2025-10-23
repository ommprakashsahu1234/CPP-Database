const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { logAuth } = require('../utils/logger');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Get user profile data based on role
const getUserProfileData = async (user) => {
  let profileData = null;

  switch (user.role) {
    case 'admin':
      profileData = await Admin.findOne({ userId: user._id })
        .populate('userId', '-password -refreshToken');
      break;
    case 'teacher':
      profileData = await Teacher.findOne({ userId: user._id })
        .populate('userId', '-password -refreshToken')
        .populate('subjects', 'name code')
        .populate('classes', 'name grade')
        .populate('sections', 'name');
      break;
    case 'student':
      profileData = await Student.findOne({ userId: user._id })
        .populate('userId', '-password -refreshToken')
        .populate('class', 'name grade')
        .populate('section', 'name');
      break;
  }

  return profileData;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (Admin only in production)
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phoneNumber,
      address,
      dateOfBirth,
      // Role-specific data
      employeeId,
      subjects,
      classes,
      joiningDate,
      rollNumber,
      admissionNumber,
      class: studentClass,
      section,
      academicYear,
      parentDetails,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      firstName,
      lastName,
      phoneNumber,
      address,
      dateOfBirth,
    });

    // Create role-specific profile
    let roleProfile = null;

    switch (role) {
      case 'admin':
        roleProfile = await Admin.create({
          userId: user._id,
        });
        break;

      case 'teacher':
        if (!employeeId) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: 'Employee ID is required for teachers',
          });
        }

        roleProfile = await Teacher.create({
          userId: user._id,
          employeeId,
          subjects: subjects || [],
          classes: classes || [],
          joiningDate: joiningDate || new Date(),
        });
        break;

      case 'student':
        if (!rollNumber || !admissionNumber || !studentClass || !section) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: 'Roll number, admission number, class, and section are required for students',
          });
        }

        roleProfile = await Student.create({
          userId: user._id,
          rollNumber,
          admissionNumber,
          class: studentClass,
          section,
          academicYear: academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
          parentDetails: parentDetails || {},
          admissionDate: new Date(),
        });
        break;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Log registration
    await logAuth.login(user._id, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
        },
        roleProfile,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      await logAuth.loginFailed(email, {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      await logAuth.loginFailed(email, {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token and update last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Get role-specific profile data
    const profileData = await getUserProfileData(user);

    // Log successful login
    await logAuth.login(user._id, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          lastLogin: user.lastLogin,
        },
        profile: profileData,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Find user and check if refresh token matches
    const user = await User.findById(decoded.userId);
    
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    // Log token refresh
    await logAuth.tokenRefresh(user._id, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      // Clear refresh token
      user.refreshToken = null;
      await user.save();

      // Log logout
      await logAuth.logout(user._id, {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const profileData = await getUserProfileData(req.user);

    res.json({
      success: true,
      data: {
        user: req.user,
        profile: profileData,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log password change
    await logAuth.passwordChange(user._id, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  changePassword,
};