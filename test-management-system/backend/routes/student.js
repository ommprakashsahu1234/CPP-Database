const express = require('express');
const Test = require('../models/Test');
const Result = require('../models/Result');
const Question = require('../models/Question');
const User = require('../models/User');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');
const { verifyToken, studentOnly, logActivity } = require('../middlewares/auth');
const { catchAsync, AppError } = require('../middlewares/errorHandler');
const { validateObjectId, validatePagination } = require('../middlewares/validation');

const router = express.Router();

// Apply student middleware to all routes
router.use(verifyToken, studentOnly);

// @route   GET /api/student/dashboard
// @desc    Get student dashboard data
// @access  Private (Student only)
router.get('/dashboard', logActivity('view_dashboard', 'student'), catchAsync(async (req, res) => {
  const studentId = req.user._id;
  
  // Get upcoming tests
  const upcomingTests = await Test.find({
    class: req.user.class,
    section: req.user.section,
    academicYear: req.user.academicYear,
    isActive: true,
    isPublished: true,
    startTime: { $gt: new Date() }
  })
    .populate('subject', 'name code')
    .populate('class', 'name')
    .populate('section', 'name')
    .sort({ startTime: 1 })
    .limit(5);

  // Get active tests (currently available)
  const activeTests = await Test.find({
    class: req.user.class,
    section: req.user.section,
    academicYear: req.user.academicYear,
    isActive: true,
    isPublished: true,
    startTime: { $lte: new Date() },
    endTime: { $gte: new Date() }
  })
    .populate('subject', 'name code')
    .populate('class', 'name')
    .populate('section', 'name');

  // Get recent results
  const recentResults = await Result.find({ student: studentId })
    .populate('test', 'title subject class section')
    .populate('test.subject', 'name code')
    .populate('test.class', 'name')
    .populate('test.section', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get test statistics
  const totalAttempts = await Result.countDocuments({ student: studentId });
  const passedTests = await Result.countDocuments({ 
    student: studentId, 
    status: 'pass' 
  });
  const failedTests = await Result.countDocuments({ 
    student: studentId, 
    status: 'fail' 
  });

  // Calculate average percentage
  const results = await Result.find({ 
    student: studentId, 
    status: { $in: ['pass', 'fail'] } 
  });
  const averagePercentage = results.length > 0 
    ? Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length)
    : 0;

  res.json({
    success: true,
    data: {
      stats: {
        totalAttempts,
        passedTests,
        failedTests,
        averagePercentage
      },
      upcomingTests,
      activeTests,
      recentResults
    }
  });
}));

// @route   GET /api/student/tests
// @desc    Get available tests for student
// @access  Private (Student only)
router.get('/tests', validatePagination, logActivity('view_tests', 'student'), catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  let filter = {
    class: req.user.class,
    section: req.user.section,
    academicYear: req.user.academicYear,
    isActive: true,
    isPublished: true
  };

  const now = new Date();
  switch (status) {
    case 'upcoming':
      filter.startTime = { $gt: now };
      break;
    case 'active':
      filter.startTime = { $lte: now };
      filter.endTime = { $gte: now };
      break;
    case 'completed':
      filter.endTime = { $lt: now };
      break;
  }

  const tests = await Test.find(filter)
    .populate('subject', 'name code')
    .populate('class', 'name')
    .populate('section', 'name')
    .sort({ startTime: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Test.countDocuments(filter);

  res.json({
    success: true,
    data: {
      tests,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   GET /api/student/tests/:id
// @desc    Get test details
// @access  Private (Student only)
router.get('/tests/:id', validateObjectId('id'), catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id)
    .populate('subject', 'name code')
    .populate('class', 'name')
    .populate('section', 'name');

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if student can access this test
  if (!test.class.equals(req.user.class) || 
      !test.section.equals(req.user.section) || 
      test.academicYear !== req.user.academicYear) {
    throw new AppError('Access denied. You cannot access this test.', 403);
  }

  // Check if test is available
  if (!test.isActive || !test.isPublished) {
    throw new AppError('Test is not available', 400);
  }

  const now = new Date();
  if (now < test.startTime) {
    throw new AppError('Test has not started yet', 400);
  }
  if (now > test.endTime) {
    throw new AppError('Test has ended', 400);
  }

  // Check if student has already attempted this test
  const existingResult = await Result.findOne({
    test: test._id,
    student: req.user._id
  });

  if (existingResult && existingResult.isSubmitted) {
    throw new AppError('You have already attempted this test', 400);
  }

  res.json({
    success: true,
    data: { test }
  });
}));

// @route   GET /api/student/tests/:id/questions
// @desc    Get test questions for student
// @access  Private (Student only)
router.get('/tests/:id/questions', validateObjectId('id'), catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if student can access this test
  if (!test.class.equals(req.user.class) || 
      !test.section.equals(req.user.section) || 
      test.academicYear !== req.user.academicYear) {
    throw new AppError('Access denied. You cannot access this test.', 403);
  }

  // Check if test is available
  if (!test.isActive || !test.isPublished) {
    throw new AppError('Test is not available', 400);
  }

  const now = new Date();
  if (now < test.startTime) {
    throw new AppError('Test has not started yet', 400);
  }
  if (now > test.endTime) {
    throw new AppError('Test has ended', 400);
  }

  // Check if student has already attempted this test
  const existingResult = await Result.findOne({
    test: test._id,
    student: req.user._id
  });

  if (existingResult && existingResult.isSubmitted) {
    throw new AppError('You have already attempted this test', 400);
  }

  // Get questions (without correct answers for security)
  const questions = await Question.find({ test: test._id })
    .select('-correctAnswer -explanation')
    .sort({ createdAt: 1 });

  res.json({
    success: true,
    data: { 
      test: {
        id: test._id,
        title: test.title,
        duration: test.duration,
        totalMarks: test.totalMarks,
        instructions: test.instructions
      },
      questions 
    }
  });
}));

// @route   POST /api/student/tests/:id/start
// @desc    Start test attempt
// @access  Private (Student only)
router.post('/tests/:id/start', validateObjectId('id'), logActivity('start_test', 'student'), catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if student can access this test
  if (!test.class.equals(req.user.class) || 
      !test.section.equals(req.user.section) || 
      test.academicYear !== req.user.academicYear) {
    throw new AppError('Access denied. You cannot access this test.', 403);
  }

  // Check if test is available
  if (!test.isActive || !test.isPublished) {
    throw new AppError('Test is not available', 400);
  }

  const now = new Date();
  if (now < test.startTime) {
    throw new AppError('Test has not started yet', 400);
  }
  if (now > test.endTime) {
    throw new AppError('Test has ended', 400);
  }

  // Check if student has already attempted this test
  let result = await Result.findOne({
    test: test._id,
    student: req.user._id
  });

  if (result && result.isSubmitted) {
    throw new AppError('You have already attempted this test', 400);
  }

  // Create new result if doesn't exist
  if (!result) {
    result = new Result({
      test: test._id,
      student: req.user._id,
      totalMarks: test.totalMarks,
      startTime: new Date()
    });
    await result.save();
  }

  res.json({
    success: true,
    message: 'Test started successfully',
    data: { 
      resultId: result._id,
      startTime: result.startTime,
      duration: test.duration
    }
  });
}));

// @route   POST /api/student/tests/:id/submit
// @desc    Submit test answers
// @access  Private (Student only)
router.post('/tests/:id/submit', validateObjectId('id'), logActivity('submit_test', 'student'), catchAsync(async (req, res) => {
  const { answers } = req.body;
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if student can access this test
  if (!test.class.equals(req.user.class) || 
      !test.section.equals(req.user.section) || 
      test.academicYear !== req.user.academicYear) {
    throw new AppError('Access denied. You cannot access this test.', 403);
  }

  // Check if test is still active
  const now = new Date();
  if (now > test.endTime) {
    throw new AppError('Test has ended', 400);
  }

  // Find or create result
  let result = await Result.findOne({
    test: test._id,
    student: req.user._id
  });

  if (!result) {
    throw new AppError('Test not started. Please start the test first.', 400);
  }

  if (result.isSubmitted) {
    throw new AppError('Test already submitted', 400);
  }

  // Process answers and calculate marks
  const questions = await Question.find({ test: test._id });
  let totalMarks = 0;
  let obtainedMarks = 0;

  const processedAnswers = answers.map(answer => {
    const question = questions.find(q => q._id.toString() === answer.questionId);
    if (!question) return null;

    let isCorrect = false;
    let marksObtained = 0;

    if (question.questionType === 'multiple_choice') {
      const correctOption = question.options.find(opt => opt.isCorrect);
      isCorrect = correctOption && correctOption.text === answer.selectedOption;
    } else if (question.questionType === 'true_false') {
      isCorrect = question.correctAnswer === answer.selectedOption;
    } else if (question.questionType === 'fill_blank') {
      isCorrect = question.correctAnswer.toLowerCase() === answer.selectedOption.toLowerCase();
    }

    if (isCorrect) {
      marksObtained = question.marks;
      obtainedMarks += question.marks;
    }

    totalMarks += question.marks;

    return {
      question: question._id,
      selectedOption: answer.selectedOption,
      isCorrect,
      marksObtained,
      timeSpent: answer.timeSpent || 0
    };
  }).filter(Boolean);

  // Update result
  result.answers = processedAnswers;
  result.obtainedMarks = obtainedMarks;
  result.totalMarks = totalMarks;
  result.percentage = Math.round((obtainedMarks / totalMarks) * 100);
  result.status = result.percentage >= test.passMarks ? 'pass' : 'fail';
  result.endTime = new Date();
  result.isSubmitted = true;
  result.isGraded = true;
  result.gradedAt = new Date();

  // Calculate time spent
  result.calculateTimeSpent();

  await result.save();

  // Update test statistics
  test.totalAttempts += 1;
  await test.save();

  res.json({
    success: true,
    message: 'Test submitted successfully',
    data: {
      result: {
        id: result._id,
        obtainedMarks: result.obtainedMarks,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        status: result.status,
        timeSpent: result.timeSpent
      }
    }
  });
}));

// @route   GET /api/student/results
// @desc    Get student's test results
// @access  Private (Student only)
router.get('/results', validatePagination, logActivity('view_results', 'student'), catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  const filter = { student: req.user._id };
  if (status) filter.status = status;

  const results = await Result.find(filter)
    .populate('test', 'title subject class section startTime endTime')
    .populate('test.subject', 'name code')
    .populate('test.class', 'name')
    .populate('test.section', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Result.countDocuments(filter);

  res.json({
    success: true,
    data: {
      results,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   GET /api/student/results/:id
// @desc    Get detailed result
// @access  Private (Student only)
router.get('/results/:id', validateObjectId('id'), catchAsync(async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate('test', 'title subject class section startTime endTime instructions')
    .populate('test.subject', 'name code')
    .populate('test.class', 'name')
    .populate('test.section', 'name')
    .populate('answers.question', 'questionText questionType options marks');

  if (!result) {
    throw new AppError('Result not found', 404);
  }

  // Check if student owns this result
  if (!result.student.equals(req.user._id)) {
    throw new AppError('Access denied. You cannot access this result.', 403);
  }

  res.json({
    success: true,
    data: { result }
  });
}));

// @route   POST /api/student/request-profile-change
// @desc    Request profile change
// @access  Private (Student only)
router.post('/request-profile-change', logActivity('request_profile_change', 'student'), catchAsync(async (req, res) => {
  const { changes, reason } = req.body;

  if (!changes || Object.keys(changes).length === 0) {
    throw new AppError('No changes provided', 400);
  }

  // Check if there's already a pending request
  const existingRequest = await ProfileChangeRequest.findOne({
    user: req.user._id,
    status: 'pending'
  });

  if (existingRequest) {
    throw new AppError('You already have a pending profile change request', 400);
  }

  const request = new ProfileChangeRequest({
    user: req.user._id,
    requestedBy: req.user._id,
    changes,
    currentData: {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: req.user.phone,
      dateOfBirth: req.user.dateOfBirth,
      address: req.user.address,
      class: req.user.class,
      section: req.user.section
    },
    reason
  });

  await request.save();

  res.status(201).json({
    success: true,
    message: 'Profile change request submitted successfully',
    data: { request }
  });
}));

// @route   GET /api/student/profile-requests
// @desc    Get student's profile change requests
// @access  Private (Student only)
router.get('/profile-requests', validatePagination, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const requests = await ProfileChangeRequest.find(filter)
    .populate('reviewedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await ProfileChangeRequest.countDocuments(filter);

  res.json({
    success: true,
    data: {
      requests,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

module.exports = router;