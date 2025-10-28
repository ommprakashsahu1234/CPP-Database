const express = require('express');

const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const teacherRoutes = require('./teacher');
const studentRoutes = require('./student');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);

module.exports = router;
