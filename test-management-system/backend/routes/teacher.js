const express = require('express');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');
const StudentGroup = require('../models/StudentGroup');
const Subject = require('../models/Subject');
const User = require('../models/User');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');
const SubjectAssignmentRequest = require('../models/SubjectAssignmentRequest');
const { verifyToken, teacherOnly, logActivity } = require('../middlewares/auth');
const { catchAsync, AppError } = require('../middlewares/errorHandler');
const { validateTest, validateQuestion, validateStudentGroup, validateObjectId, validatePagination } = require('../middlewares/validation');

const router = express.Router();

// Apply teacher middleware to all routes
router.use(verifyToken, teacherOnly);

// @route   GET /api/teacher/dashboard
// @desc    Get teacher dashboard data
// @access  Private (Teacher only)
router.get('/dashboard', logActivity('view_dashboard', 'teacher'), catchAsync(async (req, res) => {
  const teacherId = req.user._id;
  
  // Get teacher's subjects
  const subjects = await Subject.find({ teacher: teacherId }).populate('class', 'name');
  
  // Get teacher's tests
  const totalTests = await Test.countDocuments({ teacher: teacherId });
  const activeTests = await Test.countDocuments({ 
    teacher: teacherId, 
    isActive: true, 
    isPublished: true 
  });
  
  // Get recent tests
  const recentTests = await Test.find({ teacher: teacherId })
    .populate('subject', 'name code')
    .populate('class', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get pending profile change requests for students
  const pendingRequests = await ProfileChangeRequest.countDocuments({
    status: 'pending',
    'user.role': 'student'
  });

  res.json({
    success: true,
    data: {
      stats: {
        totalSubjects: subjects.length,
        totalTests,
        activeTests,
        pendingRequests
      },
      subjects,
      recentTests
    }
  });
}));

// @route   GET /api/teacher/tests
// @desc    Get teacher's tests
// @access  Private (Teacher only)
router.get('/tests', validatePagination, logActivity('view_tests', 'teacher'), catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const subjectId = req.query.subjectId;

  const filter = { teacher: req.user._id };
  if (status) {
    switch (status) {
      case 'active':
        filter.isActive = true;
        filter.isPublished = true;
        break;
      case 'draft':
        filter.isPublished = false;
        break;
      case 'completed':
        filter.isActive = false;
        break;
    }
  }
  if (subjectId) filter.subject = subjectId;

  const tests = await Test.find(filter)
    .populate('subject', 'name code')
    .populate('class', 'name')
    .populate('section', 'name')
    .sort({ createdAt: -1 })
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

// @route   POST /api/teacher/tests
// @desc    Create a new test
// @access  Private (Teacher only)
router.post('/tests', validateTest, logActivity('create_test', 'teacher'), catchAsync(async (req, res) => {
  const testData = {
    ...req.body,
    teacher: req.user._id
  };

  // Validate that the teacher has access to the subject
  const subject = await Subject.findById(testData.subject);
  if (!subject || !subject.teacher.equals(req.user._id)) {
    throw new AppError('You do not have access to this subject', 403);
  }

  const test = new Test(testData);
  await test.save();

  res.status(201).json({
    success: true,
    message: 'Test created successfully',
    data: { test }
  });
}));

// @route   GET /api/teacher/tests/:id
// @desc    Get test by ID
// @access  Private (Teacher only)
router.get('/tests/:id', validateObjectId('id'), catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id)
    .populate('subject', 'name code')
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('questions')
    .populate('studentGroups', 'name description');

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if teacher owns this test
  if (!test.teacher.equals(req.user._id)) {
    throw new AppError('Access denied. You do not own this test.', 403);
  }

  res.json({
    success: true,
    data: { test }
  });
}));

// @route   PUT /api/teacher/tests/:id
// @desc    Update test
// @access  Private (Teacher only)
router.put('/tests/:id', validateObjectId('id'), logActivity('update_test', 'teacher'), catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if teacher owns this test
  if (!test.teacher.equals(req.user._id)) {
    throw new AppError('Access denied. You do not own this test.', 403);
  }

  // Don't allow editing if test is already published and active
  if (test.isPublished && test.isActive) {
    throw new AppError('Cannot edit published and active test', 400);
  }

  Object.keys(req.body).forEach(key => {
    if (key !== '_id' && key !== 'teacher') {
      test[key] = req.body[key];
    }
  });

  await test.save();

  res.json({
    success: true,
    message: 'Test updated successfully',
    data: { test }
  });
}));

// @route   DELETE /api/teacher/tests/:id
// @desc    Delete test
// @access  Private (Teacher only)
router.delete('/tests/:id', validateObjectId('id'), logActivity('delete_test', 'teacher'), catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if teacher owns this test
  if (!test.teacher.equals(req.user._id)) {
    throw new AppError('Access denied. You do not own this test.', 403);
  }

  // Don't allow deleting if test has results
  const resultCount = await Result.countDocuments({ test: test._id });
  if (resultCount > 0) {
    throw new AppError('Cannot delete test with existing results', 400);
  }

  await Test.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Test deleted successfully'
  });
}));

// @route   PUT /api/teacher/tests/:id/publish
// @desc    Publish test
// @access  Private (Teacher only)
router.put('/tests/:id/publish', validateObjectId('id'), logActivity('publish_test', 'teacher'), catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id).populate('questions');

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if teacher owns this test
  if (!test.teacher.equals(req.user._id)) {
    throw new AppError('Access denied. You do not own this test.', 403);
  }

  // Check if test has questions
  if (test.questions.length === 0) {
    throw new AppError('Cannot publish test without questions', 400);
  }

  test.isPublished = true;
  await test.save();

  res.json({
    success: true,
    message: 'Test published successfully',
    data: { test }
  });
}));

// @route   PUT /api/teacher/tests/:id/activate
// @desc    Activate test
// @access  Private (Teacher only)
router.put('/tests/:id/activate', validateObjectId('id'), logActivity('activate_test', 'teacher'), catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if teacher owns this test
  if (!test.teacher.equals(req.user._id)) {
    throw new AppError('Access denied. You do not own this test.', 403);
  }

  if (!test.isPublished) {
    throw new AppError('Cannot activate unpublished test', 400);
  }

  test.isActive = true;
  await test.save();

  res.json({
    success: true,
    message: 'Test activated successfully',
    data: { test }
  });
}));

// @route   PUT /api/teacher/tests/:id/deactivate
// @desc    Deactivate test
// @access  Private (Teacher only)
router.put('/tests/:id/deactivate', validateObjectId('id'), logActivity('deactivate_test', 'teacher'), catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if teacher owns this test
  if (!test.teacher.equals(req.user._id)) {
    throw new AppError('Access denied. You do not own this test.', 403);
  }

  test.isActive = false;
  await test.save();

  res.json({
    success: true,
    message: 'Test deactivated successfully',
    data: { test }
  });
}));

// @route   GET /api/teacher/tests/:id/questions
// @desc    Get test questions
// @access  Private (Teacher only)
router.get('/tests/:id/questions', validateObjectId('id'), catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if teacher owns this test
  if (!test.teacher.equals(req.user._id)) {
    throw new AppError('Access denied. You do not own this test.', 403);
  }

  const questions = await Question.find({ test: test._id }).sort({ createdAt: 1 });

  res.json({
    success: true,
    data: { questions }
  });
}));

// @route   POST /api/teacher/tests/:id/questions
// @desc    Add question to test
// @access  Private (Teacher only)
router.post('/tests/:id/questions', validateObjectId('id'), validateQuestion, logActivity('add_question', 'teacher'), catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if teacher owns this test
  if (!test.teacher.equals(req.user._id)) {
    throw new AppError('Access denied. You do not own this test.', 403);
  }

  // Don't allow adding questions to published and active tests
  if (test.isPublished && test.isActive) {
    throw new AppError('Cannot add questions to published and active test', 400);
  }

  const questionData = {
    ...req.body,
    test: test._id,
    createdBy: req.user._id
  };

  const question = new Question(questionData);
  await question.save();

  // Add question to test
  test.questions.push(question._id);
  await test.save();

  res.status(201).json({
    success: true,
    message: 'Question added successfully',
    data: { question }
  });
}));

// @route   PUT /api/teacher/questions/:id
// @desc    Update question
// @access  Private (Teacher only)
router.put('/questions/:id', validateObjectId('id'), validateQuestion, logActivity('update_question', 'teacher'), catchAsync(async (req, res) => {
  const question = await Question.findById(req.params.id).populate('test');

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  // Check if teacher owns this test
  if (!question.test.teacher.equals(req.user._id)) {
    throw new AppError('Access denied. You do not own this question.', 403);
  }

  // Don't allow editing questions in published and active tests
  if (question.test.isPublished && question.test.isActive) {
    throw new AppError('Cannot edit questions in published and active test', 400);
  }

  Object.keys(req.body).forEach(key => {
    if (key !== '_id' && key !== 'test' && key !== 'createdBy') {
      question[key] = req.body[key];
    }
  });

  await question.save();

  res.json({
    success: true,
    message: 'Question updated successfully',
    data: { question }
  });
}));

// @route   DELETE /api/teacher/questions/:id
// @desc    Delete question
// @access  Private (Teacher only)
router.delete('/questions/:id', validateObjectId('id'), logActivity('delete_question', 'teacher'), catchAsync(async (req, res) => {
  const question = await Question.findById(req.params.id).populate('test');

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  // Check if teacher owns this test
  if (!question.test.teacher.equals(req.user._id)) {
    throw new AppError('Access denied. You do not own this question.', 403);
  }

  // Don't allow deleting questions from published and active tests
  if (question.test.isPublished && question.test.isActive) {
    throw new AppError('Cannot delete questions from published and active test', 400);
  }

  // Remove question from test
  await Test.findByIdAndUpdate(question.test._id, {
    $pull: { questions: question._id }
  });

  await Question.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Question deleted successfully'
  });
}));

// @route   GET /api/teacher/tests/:id/results
// @desc    Get test results
// @access  Private (Teacher only)
router.get('/tests/:id/results', validateObjectId('id'), validatePagination, catchAsync(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if teacher owns this test
  if (!test.teacher.equals(req.user._id)) {
    throw new AppError('Access denied. You do not own this test.', 403);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  const filter = { test: test._id };
  if (status) filter.status = status;

  const results = await Result.find(filter)
    .populate('student', 'firstName lastName email studentId')
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

// @route   GET /api/teacher/student-groups
// @desc    Get teacher's student groups
// @access  Private (Teacher only)
router.get('/student-groups', validatePagination, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const groups = await StudentGroup.find({ createdBy: req.user._id })
    .populate('students', 'firstName lastName email studentId')
    .populate('class', 'name')
    .populate('section', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await StudentGroup.countDocuments({ createdBy: req.user._id });

  res.json({
    success: true,
    data: {
      groups,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   POST /api/teacher/student-groups
// @desc    Create student group
// @access  Private (Teacher only)
router.post('/student-groups', validateStudentGroup, logActivity('create_student_group', 'teacher'), catchAsync(async (req, res) => {
  const groupData = {
    ...req.body,
    createdBy: req.user._id
  };

  const group = new StudentGroup(groupData);
  await group.save();

  res.status(201).json({
    success: true,
    message: 'Student group created successfully',
    data: { group }
  });
}));

// @route   GET /api/teacher/subjects
// @desc    Get teacher's subjects
// @access  Private (Teacher only)
router.get('/subjects', catchAsync(async (req, res) => {
  const subjects = await Subject.find({ teacher: req.user._id })
    .populate('class', 'name')
    .populate('section', 'name')
    .sort({ name: 1 });

  res.json({
    success: true,
    data: { subjects }
  });
}));

// @route   POST /api/teacher/request-subject-assignment
// @desc    Request subject assignment
// @access  Private (Teacher only)
router.post('/request-subject-assignment', logActivity('request_subject_assignment', 'teacher'), catchAsync(async (req, res) => {
  const { subjectId, classId, sectionId, academicYear, reason } = req.body;

  if (!subjectId || !classId || !academicYear) {
    throw new AppError('Subject ID, Class ID, and Academic Year are required', 400);
  }

  // Check if request already exists
  const existingRequest = await SubjectAssignmentRequest.findOne({
    teacher: req.user._id,
    subject: subjectId,
    class: classId,
    section: sectionId,
    academicYear,
    status: 'pending'
  });

  if (existingRequest) {
    throw new AppError('Request already exists for this subject assignment', 400);
  }

  const request = new SubjectAssignmentRequest({
    teacher: req.user._id,
    subject: subjectId,
    class: classId,
    section: sectionId,
    academicYear,
    reason
  });

  await request.save();

  res.status(201).json({
    success: true,
    message: 'Subject assignment request submitted successfully',
    data: { request }
  });
}));

module.exports = router;