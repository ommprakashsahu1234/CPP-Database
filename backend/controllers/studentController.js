import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';
import ProfileChangeRequest from '../models/ProfileChangeRequest.js';
import { logActivity } from '../middlewares/logger.js';
import { generateResultPDF } from '../utils/pdfGenerator.js';
import fs from 'fs';

// Test Access
export const getAvailableTests = async (req, res) => {
  try {
    const student = await req.user;
    
    const tests = await Test.find({
      isPublished: true,
      isActive: true,
      $or: [
        { visibility: 'all' },
        { section: student.section },
        { allowedStudents: student.id }
      ]
    })
      .populate('subject class section teacher', 'name code grade email')
      .select('-questions')
      .sort({ scheduledDate: -1 });

    res.json({ tests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tests', error: error.message });
  }
};

export const getTestForAttempt = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId)
      .populate('questions', '-correctAnswer'); // Don't send correct answers

    if (!test || !test.isPublished || !test.isActive) {
      return res.status(404).json({ message: 'Test not available' });
    }

    // Check if test has started and not expired
    const now = new Date();
    const testStartTime = new Date(test.startTime);
    const testEndTime = new Date(testStartTime.getTime() + test.duration * 60000);

    if (now < testStartTime) {
      return res.status(400).json({ message: 'Test has not started yet' });
    }

    if (now > testEndTime) {
      return res.status(400).json({ message: 'Test has expired' });
    }

    // Check if student has already submitted
    const existingResult = await Result.findOne({
      test: testId,
      student: req.user.id,
      status: 'submitted'
    });

    if (existingResult) {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    res.json({ test });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch test', error: error.message });
  }
};

export const startTest = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId);

    if (!test || !test.isPublished) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if already started
    let result = await Result.findOne({
      test: testId,
      student: req.user.id
    });

    if (result && result.status !== 'not-attempted') {
      return res.json({ message: 'Test already started', result });
    }

    // Create or update result
    if (!result) {
      result = await Result.create({
        test: testId,
        student: req.user.id,
        totalMarks: test.totalMarks,
        status: 'in-progress',
        startedAt: new Date()
      });
    } else {
      result.status = 'in-progress';
      result.startedAt = new Date();
      await result.save();
    }

    await logActivity(
      req.user.id,
      'Student',
      req.user.name,
      req.user.email,
      'Started test',
      'create',
      { entityType: 'Result', entityId: result._id }
    );

    res.json({ message: 'Test started successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start test', error: error.message });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedAnswer }

    const test = await Test.findById(testId).populate('questions');

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    let result = await Result.findOne({
      test: testId,
      student: req.user.id
    });

    if (!result) {
      return res.status(400).json({ message: 'Test not started' });
    }

    if (result.status === 'submitted') {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    // Evaluate answers
    let obtainedMarks = 0;
    const evaluatedAnswers = [];

    for (const answer of answers) {
      const question = test.questions.find(q => q._id.toString() === answer.questionId);
      
      if (question) {
        const isCorrect = question.correctAnswer === answer.selectedAnswer;
        const marksAwarded = isCorrect ? question.marks : 0;
        obtainedMarks += marksAwarded;

        evaluatedAnswers.push({
          question: question._id,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
          marksAwarded
        });
      }
    }

    const percentage = (obtainedMarks / test.totalMarks) * 100;
    const isPassed = obtainedMarks >= test.passingMarks;

    result.answers = evaluatedAnswers;
    result.obtainedMarks = obtainedMarks;
    result.percentage = percentage;
    result.isPassed = isPassed;
    result.status = 'submitted';
    result.submittedAt = new Date();
    result.evaluatedAt = new Date();
    await result.save();

    await logActivity(
      req.user.id,
      'Student',
      req.user.name,
      req.user.email,
      'Submitted test',
      'update',
      { entityType: 'Result', entityId: result._id }
    );

    res.json({ message: 'Test submitted successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit test', error: error.message });
  }
};

// Results
export const getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({
      student: req.user.id,
      status: 'submitted'
    })
      .populate('test', 'title scheduledDate totalMarks passingMarks')
      .populate({
        path: 'test',
        populate: { path: 'subject', select: 'name code' }
      })
      .sort({ createdAt: -1 });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
};

export const getResultById = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await Result.findOne({
      _id: resultId,
      student: req.user.id
    })
      .populate('test')
      .populate('answers.question');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch result', error: error.message });
  }
};

export const downloadResultPDF = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await Result.findOne({
      _id: resultId,
      student: req.user.id
    })
      .populate('test')
      .populate({
        path: 'test',
        populate: { path: 'subject' }
      });

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    const student = { name: req.user.name, rollNumber: req.user.rollNumber, email: req.user.email };

    const filePath = await generateResultPDF(result, student, result.test);

    res.download(filePath, (err) => {
      if (err) console.error('Download error:', err);
      fs.unlinkSync(filePath); // Clean up
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
};

// Performance Analytics
export const getPerformanceAnalytics = async (req, res) => {
  try {
    const results = await Result.find({
      student: req.user.id,
      status: 'submitted'
    })
      .populate('test', 'title scheduledDate subject')
      .populate({
        path: 'test',
        populate: { path: 'subject', select: 'name code' }
      });

    const totalTests = results.length;
    const passedTests = results.filter(r => r.isPassed).length;
    const failedTests = totalTests - passedTests;
    const averagePercentage = totalTests > 0
      ? results.reduce((sum, r) => sum + r.percentage, 0) / totalTests
      : 0;

    const subjectWise = {};
    results.forEach(result => {
      const subjectName = result.test?.subject?.name || 'Unknown';
      if (!subjectWise[subjectName]) {
        subjectWise[subjectName] = { total: 0, passed: 0, avgPercentage: 0 };
      }
      subjectWise[subjectName].total++;
      if (result.isPassed) subjectWise[subjectName].passed++;
      subjectWise[subjectName].avgPercentage += result.percentage;
    });

    Object.keys(subjectWise).forEach(subject => {
      subjectWise[subject].avgPercentage /= subjectWise[subject].total;
    });

    const analytics = {
      totalTests,
      passedTests,
      failedTests,
      averagePercentage: averagePercentage.toFixed(2),
      subjectWise,
      recentResults: results.slice(0, 5)
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

// Profile Change Request
export const requestProfileChange = async (req, res) => {
  try {
    const { changes, reason } = req.body;

    const request = await ProfileChangeRequest.create({
      requestedBy: {
        userId: req.user.id,
        userType: 'Student',
        userName: req.user.name
      },
      targetUser: {
        userId: req.user.id,
        userType: 'Student'
      },
      changes: new Map(Object.entries(changes)),
      reason
    });

    await logActivity(
      req.user.id,
      'Student',
      req.user.name,
      req.user.email,
      'Requested profile change',
      'create',
      { entityType: 'ProfileChangeRequest', entityId: request._id }
    );

    res.status(201).json({ message: 'Request submitted successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit request', error: error.message });
  }
};
