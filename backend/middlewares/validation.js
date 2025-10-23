import { body, param, query, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

export const createUserValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  validate
];

export const createTestValidation = [
  body('title').trim().notEmpty().withMessage('Test title is required'),
  body('subject').isMongoId().withMessage('Valid subject ID is required'),
  body('class').isMongoId().withMessage('Valid class ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('totalMarks').isInt({ min: 0 }).withMessage('Total marks must be a positive number'),
  body('passingMarks').isInt({ min: 0 }).withMessage('Passing marks must be a positive number'),
  validate
];

export const createQuestionValidation = [
  body('questionText').trim().notEmpty().withMessage('Question text is required'),
  body('options').isArray({ min: 2 }).withMessage('At least 2 options are required'),
  body('correctAnswer').trim().notEmpty().withMessage('Correct answer is required'),
  body('marks').isInt({ min: 0 }).withMessage('Marks must be a positive number'),
  validate
];

export const idValidation = [
  param('id').isMongoId().withMessage('Valid ID is required'),
  validate
];
