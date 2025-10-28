import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';
import Student from '../models/Student.js';
import StudentGroup from '../models/StudentGroup.js';
import SubjectAssignmentRequest from '../models/SubjectAssignmentRequest.js';
import { logActivity } from '../middlewares/logger.js';
import { generateResultsExcel, generatePerformanceExcel } from '../utils/excelGenerator.js';
import { generateReportPDF } from '../utils/pdfGenerator.js';
import fs from 'fs';

// Test Management
export const createTest = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      class: classId,
      section,
      studentGroups,
      academicYear,
      scheduledDate,
      startTime,
      duration,
      totalMarks,
      passingMarks,
      visibility
    } = req.body;

    const test = await Test.create({
      title,
      description,
      subject,
      teacher: req.user.id,
      class: classId,
      section,
      studentGroups,
      academicYear,
      scheduledDate,
      startTime,
      duration,
      totalMarks,
      passingMarks,
      visibility
    });

    await logActivity(
      req.user.id,
      'Teacher',
      req.user.name,
      req.user.email,
      'Created test',
      'create',
      { entityType: 'Test', entityId: test._id, entityName: test.title }
    );

    res.status(201).json({ message: 'Test created successfully', test });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create test', error: error.message });
  }
};

export const getTeacherTests = async (req, res) => {
  try {
    const tests = await Test.find({ teacher: req.user.id })
      .populate('subject class section', 'name code grade')
      .sort({ scheduledDate: -1 });

    res.json({ tests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tests', error: error.message });
  }
};

export const getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findById(id)
      .populate('subject class section teacher', 'name code grade email')
      .populate('questions');

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json({ test });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch test', error: error.message });
  }
};

export const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const test = await Test.findOneAndUpdate(
      { _id: id, teacher: req.user.id },
      updates,
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized' });
    }

    await logActivity(
      req.user.id,
      'Teacher',
      req.user.name,
      req.user.email,
      'Updated test',
      'update',
      { entityType: 'Test', entityId: test._id, entityName: test.title }
    );

    res.json({ message: 'Test updated successfully', test });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update test', error: error.message });
  }
};

export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findOneAndDelete({ _id: id, teacher: req.user.id });

    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized' });
    }

    // Delete associated questions and results
    await Question.deleteMany({ test: id });
    await Result.deleteMany({ test: id });

    await logActivity(
      req.user.id,
      'Teacher',
      req.user.name,
      req.user.email,
      'Deleted test',
      'delete',
      { entityType: 'Test', entityId: test._id, entityName: test.title }
    );

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete test', error: error.message });
  }
};

export const publishTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findOne({ _id: id, teacher: req.user.id });

    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized' });
    }

    if (test.questions.length === 0) {
      return res.status(400).json({ message: 'Cannot publish test without questions' });
    }

    test.isPublished = true;
    test.isActive = true;
    await test.save();

    await logActivity(
      req.user.id,
      'Teacher',
      req.user.name,
      req.user.email,
      'Published test',
      'update',
      { entityType: 'Test', entityId: test._id, entityName: test.title }
    );

    res.json({ message: 'Test published successfully', test });
  } catch (error) {
    res.status(500).json({ message: 'Failed to publish test', error: error.message });
  }
};

// Question Management
export const addQuestion = async (req, res) => {
  try {
    const { testId } = req.params;
    const { questionText, questionType, options, correctAnswer, marks } = req.body;

    const test = await Test.findOne({ _id: testId, teacher: req.user.id });

    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized' });
    }

    if (test.isPublished) {
      return res.status(400).json({ message: 'Cannot add questions to published test' });
    }

    const question = await Question.create({
      test: testId,
      questionText,
      questionType,
      options,
      correctAnswer,
      marks,
      orderIndex: test.questions.length
    });

    test.questions.push(question._id);
    await test.save();

    await logActivity(
      req.user.id,
      'Teacher',
      req.user.name,
      req.user.email,
      'Added question to test',
      'create',
      { entityType: 'Question', entityId: question._id }
    );

    res.status(201).json({ message: 'Question added successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add question', error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const question = await Question.findById(id).populate('test');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.test.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (question.test.isPublished) {
      return res.status(400).json({ message: 'Cannot edit questions of published test' });
    }

    Object.assign(question, updates);
    await question.save();

    await logActivity(
      req.user.id,
      'Teacher',
      req.user.name,
      req.user.email,
      'Updated question',
      'update',
      { entityType: 'Question', entityId: question._id }
    );

    res.json({ message: 'Question updated successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update question', error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id).populate('test');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.test.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (question.test.isPublished) {
      return res.status(400).json({ message: 'Cannot delete questions from published test' });
    }

    await Test.findByIdAndUpdate(question.test._id, {
      $pull: { questions: question._id }
    });

    await question.deleteOne();

    await logActivity(
      req.user.id,
      'Teacher',
      req.user.name,
      req.user.email,
      'Deleted question',
      'delete',
      { entityType: 'Question', entityId: question._id }
    );

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete question', error: error.message });
  }
};

// Student Group Management
export const createStudentGroup = async (req, res) => {
  try {
    const { name, description, subject, students, class: classId, section, academicYear } = req.body;

    const group = await StudentGroup.create({
      name,
      description,
      teacher: req.user.id,
      subject,
      students,
      class: classId,
      section,
      academicYear
    });

    // Add group to students
    await Student.updateMany(
      { _id: { $in: students } },
      { $push: { groups: group._id } }
    );

    await logActivity(
      req.user.id,
      'Teacher',
      req.user.name,
      req.user.email,
      'Created student group',
      'create',
      { entityType: 'StudentGroup', entityId: group._id, entityName: group.name }
    );

    res.status(201).json({ message: 'Student group created successfully', group });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create student group', error: error.message });
  }
};

export const getTeacherGroups = async (req, res) => {
  try {
    const groups = await StudentGroup.find({ teacher: req.user.id })
      .populate('students', 'name rollNumber email')
      .populate('subject class section', 'name code grade');

    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
  }
};

// Reports
export const getTestResults = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findOne({ _id: testId, teacher: req.user.id });

    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized' });
    }

    const results = await Result.find({ test: testId })
      .populate('student', 'name rollNumber email')
      .sort({ obtainedMarks: -1 });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
};

export const generateTestResultsExcel = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findOne({ _id: testId, teacher: req.user.id }).populate('subject');

    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized' });
    }

    const results = await Result.find({ test: testId })
      .populate('student', 'name rollNumber email');

    const filePath = await generateResultsExcel(results, test.title);

    res.download(filePath, (err) => {
      if (err) console.error('Download error:', err);
      fs.unlinkSync(filePath); // Clean up
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate Excel', error: error.message });
  }
};

export const requestSubjectAssignment = async (req, res) => {
  try {
    const { subject, sections, reason } = req.body;

    const request = await SubjectAssignmentRequest.create({
      teacher: req.user.id,
      subject,
      sections,
      reason
    });

    await logActivity(
      req.user.id,
      'Teacher',
      req.user.name,
      req.user.email,
      'Requested subject assignment',
      'create',
      { entityType: 'SubjectAssignmentRequest', entityId: request._id }
    );

    res.status(201).json({ message: 'Request submitted successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit request', error: error.message });
  }
};
