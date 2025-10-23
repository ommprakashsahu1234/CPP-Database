const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  
  next();
};

// Common validation rules
const validationRules = {
  // User validation
  registerUser: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('role')
      .isIn(['admin', 'teacher', 'student'])
      .withMessage('Role must be admin, teacher, or student'),
    body('phoneNumber')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
  ],

  loginUser: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],

  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('phoneNumber')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid date of birth'),
  ],

  // Test validation
  createTest: [
    body('title')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Test title must be between 3 and 200 characters'),
    body('subject')
      .isMongoId()
      .withMessage('Please provide a valid subject ID'),
    body('class')
      .isMongoId()
      .withMessage('Please provide a valid class ID'),
    body('totalMarks')
      .isInt({ min: 1, max: 1000 })
      .withMessage('Total marks must be between 1 and 1000'),
    body('passingMarks')
      .isInt({ min: 0 })
      .withMessage('Passing marks must be a positive number'),
    body('duration')
      .isInt({ min: 1, max: 600 })
      .withMessage('Duration must be between 1 and 600 minutes'),
    body('startTime')
      .isISO8601()
      .withMessage('Please provide a valid start time'),
    body('endTime')
      .isISO8601()
      .withMessage('Please provide a valid end time')
      .custom((endTime, { req }) => {
        if (new Date(endTime) <= new Date(req.body.startTime)) {
          throw new Error('End time must be after start time');
        }
        return true;
      }),
    body('testType')
      .optional()
      .isIn(['Quiz', 'Unit Test', 'Mid Term', 'Final Exam', 'Assignment', 'Practice'])
      .withMessage('Invalid test type'),
    body('difficulty')
      .optional()
      .isIn(['Easy', 'Medium', 'Hard'])
      .withMessage('Invalid difficulty level'),
  ],

  // Question validation
  createQuestion: [
    body('questionText')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Question text must be between 10 and 1000 characters'),
    body('questionType')
      .isIn(['multiple-choice', 'true-false', 'short-answer', 'essay'])
      .withMessage('Invalid question type'),
    body('marks')
      .isFloat({ min: 0.5, max: 100 })
      .withMessage('Marks must be between 0.5 and 100'),
    body('difficulty')
      .optional()
      .isIn(['Easy', 'Medium', 'Hard'])
      .withMessage('Invalid difficulty level'),
    body('options')
      .if(body('questionType').equals('multiple-choice'))
      .isArray({ min: 2, max: 6 })
      .withMessage('Multiple choice questions must have 2-6 options'),
    body('options.*.text')
      .if(body('questionType').equals('multiple-choice'))
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Option text must be between 1 and 200 characters'),
  ],

  // Class validation
  createClass: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Class name must be between 2 and 100 characters'),
    body('grade')
      .isInt({ min: 1, max: 12 })
      .withMessage('Grade must be between 1 and 12'),
    body('academicYear')
      .matches(/^\d{4}-\d{4}$/)
      .withMessage('Academic year must be in format YYYY-YYYY (e.g., 2023-2024)'),
    body('maxStudentsPerSection')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Max students per section must be between 1 and 100'),
  ],

  // Subject validation
  createSubject: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Subject name must be between 2 and 100 characters'),
    body('code')
      .trim()
      .isLength({ min: 2, max: 20 })
      .isAlphanumeric()
      .withMessage('Subject code must be 2-20 alphanumeric characters'),
    body('category')
      .optional()
      .isIn(['Core', 'Elective', 'Optional', 'Extra-curricular'])
      .withMessage('Invalid subject category'),
    body('credits')
      .optional()
      .isFloat({ min: 0.5, max: 6 })
      .withMessage('Credits must be between 0.5 and 6'),
    body('maxMarks')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Max marks must be between 1 and 1000'),
  ],

  // Student Group validation
  createStudentGroup: [
    body('name')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Group name must be between 3 and 100 characters'),
    body('class')
      .isMongoId()
      .withMessage('Please provide a valid class ID'),
    body('groupType')
      .optional()
      .isIn(['Remedial', 'Advanced', 'Project', 'Custom', 'Failed Students', 'Top Performers'])
      .withMessage('Invalid group type'),
    body('maxSize')
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage('Max size must be between 1 and 200'),
  ],

  // Common parameter validations
  mongoIdParam: [
    param('id')
      .isMongoId()
      .withMessage('Please provide a valid ID'),
  ],

  paginationQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],

  // Email validation
  sendEmail: [
    body('to')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid recipient email'),
    body('subject')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Subject must be between 1 and 200 characters'),
    body('message')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Message must be between 1 and 5000 characters'),
  ],

  // Change password validation
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match new password');
        }
        return true;
      }),
  ],
};

module.exports = {
  validationRules,
  handleValidationErrors,
};