import Admin from '../models/Admin.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Section from '../models/Section.js';
import Subject from '../models/Subject.js';
import ProfileChangeRequest from '../models/ProfileChangeRequest.js';
import SubjectAssignmentRequest from '../models/SubjectAssignmentRequest.js';
import { logActivity } from '../middlewares/logger.js';

// User Management
export const createTeacher = async (req, res) => {
  try {
    const { email, password, name, employeeId, phone, subjects, sections } = req.body;

    const teacher = await Teacher.create({
      email,
      password,
      name,
      employeeId,
      phone,
      subjects,
      sections
    });

    await logActivity(
      req.user.id,
      'Admin',
      req.user.name,
      req.user.email,
      'Created teacher',
      'create',
      { entityType: 'Teacher', entityId: teacher._id, entityName: teacher.name }
    );

    res.status(201).json({ message: 'Teacher created successfully', teacher });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create teacher', error: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { email, password, name, rollNumber, phone, parentPhone, class: classId, section, academicYear } = req.body;

    const student = await Student.create({
      email,
      password,
      name,
      rollNumber,
      phone,
      parentPhone,
      class: classId,
      section,
      academicYear
    });

    // Add student to section
    await Section.findByIdAndUpdate(section, {
      $push: { students: student._id }
    });

    await logActivity(
      req.user.id,
      'Admin',
      req.user.name,
      req.user.email,
      'Created student',
      'create',
      { entityType: 'Student', entityId: student._id, entityName: student.name }
    );

    res.status(201).json({ message: 'Student created successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create student', error: error.message });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .select('-password')
      .populate('subjects sections', 'name code');

    res.json({ teachers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch teachers', error: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const { class: classId, section, academicYear } = req.query;
    const filter = {};

    if (classId) filter.class = classId;
    if (section) filter.section = section;
    if (academicYear) filter.academicYear = academicYear;

    const students = await Student.find(filter)
      .select('-password')
      .populate('class section', 'name grade');

    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.query;
    const updates = req.body;

    const Model = role === 'teacher' ? Teacher : Student;
    const user = await Model.findByIdAndUpdate(id, updates, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await logActivity(
      req.user.id,
      'Admin',
      req.user.name,
      req.user.email,
      `Updated ${role}`,
      'update',
      { entityType: role.charAt(0).toUpperCase() + role.slice(1), entityId: user._id, entityName: user.name }
    );

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.query;

    const Model = role === 'teacher' ? Teacher : Student;
    const user = await Model.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await logActivity(
      req.user.id,
      'Admin',
      req.user.name,
      req.user.email,
      `Deleted ${role}`,
      'delete',
      { entityType: role.charAt(0).toUpperCase() + role.slice(1), entityId: user._id, entityName: user.name }
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// Class Management
export const createClass = async (req, res) => {
  try {
    const { name, grade, academicYear } = req.body;

    const newClass = await Class.create({ name, grade, academicYear });

    await logActivity(
      req.user.id,
      'Admin',
      req.user.name,
      req.user.email,
      'Created class',
      'create',
      { entityType: 'Class', entityId: newClass._id, entityName: newClass.name }
    );

    res.status(201).json({ message: 'Class created successfully', class: newClass });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create class', error: error.message });
  }
};

export const createSection = async (req, res) => {
  try {
    const { name, class: classId, academicYear, capacity } = req.body;

    const section = await Section.create({ name, class: classId, academicYear, capacity });

    // Add section to class
    await Class.findByIdAndUpdate(classId, {
      $push: { sections: section._id }
    });

    await logActivity(
      req.user.id,
      'Admin',
      req.user.name,
      req.user.email,
      'Created section',
      'create',
      { entityType: 'Section', entityId: section._id, entityName: section.name }
    );

    res.status(201).json({ message: 'Section created successfully', section });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create section', error: error.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const subject = await Subject.create({ name, code, description });

    await logActivity(
      req.user.id,
      'Admin',
      req.user.name,
      req.user.email,
      'Created subject',
      'create',
      { entityType: 'Subject', entityId: subject._id, entityName: subject.name }
    );

    res.status(201).json({ message: 'Subject created successfully', subject });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subject', error: error.message });
  }
};

// Request Management
export const getProfileChangeRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await ProfileChangeRequest.find(filter)
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

export const approveProfileChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const request = await ProfileChangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Apply changes to user
    const Model = request.targetUser.userType === 'Teacher' ? Teacher : Student;
    const updates = Object.fromEntries(request.changes);
    await Model.findByIdAndUpdate(request.targetUser.userId, updates);

    request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.reviewComments = comments;
    await request.save();

    await logActivity(
      req.user.id,
      'Admin',
      req.user.name,
      req.user.email,
      'Approved profile change request',
      'update',
      { entityType: 'ProfileChangeRequest', entityId: request._id }
    );

    res.json({ message: 'Request approved successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve request', error: error.message });
  }
};

export const rejectProfileChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const request = await ProfileChangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'rejected';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.reviewComments = comments;
    await request.save();

    await logActivity(
      req.user.id,
      'Admin',
      req.user.name,
      req.user.email,
      'Rejected profile change request',
      'update',
      { entityType: 'ProfileChangeRequest', entityId: request._id }
    );

    res.json({ message: 'Request rejected successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject request', error: error.message });
  }
};

export const getSubjectAssignmentRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await SubjectAssignmentRequest.find(filter)
      .populate('teacher', 'name email')
      .populate('subject', 'name code')
      .populate('sections', 'name')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

export const approveSubjectAssignmentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const request = await SubjectAssignmentRequest.findById(id)
      .populate('teacher subject');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Add subject to teacher
    await Teacher.findByIdAndUpdate(request.teacher._id, {
      $addToSet: { subjects: request.subject._id }
    });

    // Add teacher to subject
    await Subject.findByIdAndUpdate(request.subject._id, {
      $addToSet: { teachers: request.teacher._id }
    });

    request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.reviewComments = comments;
    await request.save();

    await logActivity(
      req.user.id,
      'Admin',
      req.user.name,
      req.user.email,
      'Approved subject assignment request',
      'update',
      { entityType: 'SubjectAssignmentRequest', entityId: request._id }
    );

    res.json({ message: 'Request approved successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve request', error: error.message });
  }
};
