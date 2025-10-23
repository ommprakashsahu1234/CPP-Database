const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { verifyToken, anyUser, logActivity } = require('../middlewares/auth');
const { catchAsync, AppError } = require('../middlewares/errorHandler');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create email transporter
const createTransporter = (emailConfig) => {
  return nodemailer.createTransporter({
    host: emailConfig.host || process.env.EMAIL_HOST,
    port: emailConfig.port || process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: emailConfig.user || process.env.EMAIL_USER,
      pass: emailConfig.pass || process.env.EMAIL_PASS
    }
  });
};

// @route   POST /api/email/send
// @desc    Send email
// @access  Private
router.post('/send', logActivity('send_email', 'email'), catchAsync(async (req, res) => {
  const { to, subject, text, html, template, templateData } = req.body;

  if (!to || !subject || (!text && !html && !template)) {
    throw new AppError('To, subject, and content are required', 400);
  }

  // Get user's email configuration or use default
  let emailConfig = {};
  if (req.user.role === 'admin' && req.user.emailCredentials) {
    emailConfig = req.user.emailCredentials;
  } else if (req.user.role === 'teacher' && req.user.emailCredentials) {
    emailConfig = req.user.emailCredentials;
  }

  const transporter = createTransporter(emailConfig);

  // Prepare email content
  let emailContent = { text, html };
  
  if (template) {
    // Handle email templates
    switch (template) {
      case 'test_notification':
        emailContent.html = `
          <h2>Test Notification</h2>
          <p>Dear ${templateData.studentName},</p>
          <p>A new test "${templateData.testTitle}" has been scheduled for your class.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Subject: ${templateData.subjectName}</li>
            <li>Date: ${new Date(templateData.startTime).toLocaleDateString()}</li>
            <li>Time: ${new Date(templateData.startTime).toLocaleTimeString()}</li>
            <li>Duration: ${templateData.duration} minutes</li>
            <li>Total Marks: ${templateData.totalMarks}</li>
          </ul>
          <p>Please log in to the system to attempt the test.</p>
          <p>Best regards,<br>${templateData.teacherName}</p>
        `;
        break;
      case 'test_result':
        emailContent.html = `
          <h2>Test Result</h2>
          <p>Dear ${templateData.studentName},</p>
          <p>Your test "${templateData.testTitle}" has been graded.</p>
          <p><strong>Result Details:</strong></p>
          <ul>
            <li>Obtained Marks: ${templateData.obtainedMarks}/${templateData.totalMarks}</li>
            <li>Percentage: ${templateData.percentage}%</li>
            <li>Status: ${templateData.status}</li>
          </ul>
          <p>Please log in to the system to view detailed results.</p>
          <p>Best regards,<br>${templateData.teacherName}</p>
        `;
        break;
      case 'profile_change_approved':
        emailContent.html = `
          <h2>Profile Change Approved</h2>
          <p>Dear ${templateData.userName},</p>
          <p>Your profile change request has been approved by the administrator.</p>
          <p>The following changes have been applied to your profile:</p>
          <ul>
            ${Object.keys(templateData.changes).map(key => 
              `<li>${key}: ${templateData.changes[key]}</li>`
            ).join('')}
          </ul>
          <p>Please log in to verify the changes.</p>
          <p>Best regards,<br>Administrator</p>
        `;
        break;
      case 'profile_change_rejected':
        emailContent.html = `
          <h2>Profile Change Rejected</h2>
          <p>Dear ${templateData.userName},</p>
          <p>Your profile change request has been rejected by the administrator.</p>
          <p><strong>Reason:</strong> ${templateData.reason || 'No reason provided'}</p>
          <p>Please contact the administrator if you have any questions.</p>
          <p>Best regards,<br>Administrator</p>
        `;
        break;
      default:
        throw new AppError('Invalid email template', 400);
    }
  }

  const mailOptions = {
    from: emailConfig.user || process.env.EMAIL_USER,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    ...emailContent
  };

  await transporter.sendMail(mailOptions);

  res.json({
    success: true,
    message: 'Email sent successfully'
  });
}));

// @route   POST /api/email/configure
// @desc    Configure email settings
// @access  Private (Admin and Teacher only)
router.post('/configure', logActivity('configure_email', 'email'), catchAsync(async (req, res) => {
  const { host, port, user, pass } = req.body;

  if (!host || !port || !user || !pass) {
    throw new AppError('All email configuration fields are required', 400);
  }

  // Test email configuration
  const testTransporter = createTransporter({ host, port, user, pass });
  
  try {
    await testTransporter.verify();
  } catch (error) {
    throw new AppError('Invalid email configuration. Please check your credentials.', 400);
  }

  // Save email configuration
  const user = await User.findById(req.user._id);
  user.emailCredentials = { host, port, user, pass };
  await user.save();

  res.json({
    success: true,
    message: 'Email configuration saved successfully'
  });
}));

// @route   GET /api/email/templates
// @desc    Get available email templates
// @access  Private
router.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'test_notification',
      name: 'Test Notification',
      description: 'Notify students about upcoming tests',
      requiredData: ['studentName', 'testTitle', 'subjectName', 'startTime', 'duration', 'totalMarks', 'teacherName']
    },
    {
      id: 'test_result',
      name: 'Test Result',
      description: 'Send test results to students',
      requiredData: ['studentName', 'testTitle', 'obtainedMarks', 'totalMarks', 'percentage', 'status', 'teacherName']
    },
    {
      id: 'profile_change_approved',
      name: 'Profile Change Approved',
      description: 'Notify users when profile changes are approved',
      requiredData: ['userName', 'changes']
    },
    {
      id: 'profile_change_rejected',
      name: 'Profile Change Rejected',
      description: 'Notify users when profile changes are rejected',
      requiredData: ['userName', 'reason']
    }
  ];

  res.json({
    success: true,
    data: { templates }
  });
}));

// @route   POST /api/email/bulk
// @desc    Send bulk emails
// @access  Private (Admin and Teacher only)
router.post('/bulk', logActivity('send_bulk_email', 'email'), catchAsync(async (req, res) => {
  const { recipients, subject, text, html, template, templateData } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    throw new AppError('Recipients array is required', 400);
  }

  if (!subject || (!text && !html && !template)) {
    throw new AppError('Subject and content are required', 400);
  }

  // Get user's email configuration
  let emailConfig = {};
  if (req.user.emailCredentials) {
    emailConfig = req.user.emailCredentials;
  }

  const transporter = createTransporter(emailConfig);

  // Send emails to all recipients
  const emailPromises = recipients.map(async (recipient) => {
    const mailOptions = {
      from: emailConfig.user || process.env.EMAIL_USER,
      to: recipient.email,
      subject: subject.replace('{name}', recipient.name || recipient.firstName || 'Student'),
      text: text ? text.replace('{name}', recipient.name || recipient.firstName || 'Student') : undefined,
      html: html ? html.replace('{name}', recipient.name || recipient.firstName || 'Student') : undefined
    };

    return transporter.sendMail(mailOptions);
  });

  try {
    await Promise.all(emailPromises);
    
    res.json({
      success: true,
      message: `Bulk email sent successfully to ${recipients.length} recipients`
    });
  } catch (error) {
    throw new AppError('Failed to send some emails. Please check your configuration.', 500);
  }
}));

module.exports = router;