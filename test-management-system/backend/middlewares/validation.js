const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUser = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('role').isIn(['admin', 'teacher', 'student']).withMessage('Invalid role'),
  handleValidationErrors
];

// Test validation rules
const validateTest = [
  body('title').trim().notEmpty().withMessage('Test title is required'),
  body('subject').isMongoId().withMessage('Valid subject ID is required'),
  body('class').isMongoId().withMessage('Valid class ID is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('totalMarks').isInt({ min: 1 }).withMessage('Total marks must be a positive integer'),
  body('passMarks').isInt({ min: 0 }).withMessage('Pass marks must be a non-negative integer'),
  handleValidationErrors
];

// Question validation rules
const validateQuestion = [
  body('questionText').trim().notEmpty().withMessage('Question text is required'),
  body('questionType').isIn(['multiple_choice', 'true_false', 'fill_blank', 'short_answer']).withMessage('Invalid question type'),
  body('marks').isInt({ min: 1 }).withMessage('Marks must be a positive integer'),
  body('options').custom((value, { req }) => {
    if (req.body.questionType === 'multiple_choice' && (!value || value.length < 2)) {
      throw new Error('Multiple choice questions must have at least 2 options');
    }
    return true;
  }),
  handleValidationErrors
];

// Class validation rules
const validateClass = [
  body('name').trim().notEmpty().withMessage('Class name is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  handleValidationErrors
];

// Section validation rules
const validateSection = [
  body('name').trim().notEmpty().withMessage('Section name is required'),
  body('class').isMongoId().withMessage('Valid class ID is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  handleValidationErrors
];

// Subject validation rules
const validateSubject = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('code').trim().notEmpty().withMessage('Subject code is required'),
  body('class').isMongoId().withMessage('Valid class ID is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('maxMarks').optional().isInt({ min: 1 }).withMessage('Max marks must be a positive integer'),
  body('passMarks').optional().isInt({ min: 0 }).withMessage('Pass marks must be a non-negative integer'),
  handleValidationErrors
];

// Student group validation rules
const validateStudentGroup = [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('class').isMongoId().withMessage('Valid class ID is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('groupType').isIn(['remedial', 'advanced', 'custom', 'failed_students', 'top_performers']).withMessage('Invalid group type'),
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} ID`),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateTest,
  validateQuestion,
  validateClass,
  validateSection,
  validateSubject,
  validateStudentGroup,
  validateObjectId,
  validatePagination
};