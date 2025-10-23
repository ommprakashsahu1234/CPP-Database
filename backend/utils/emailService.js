import nodemailer from 'nodemailer';
import Admin from '../models/Admin.js';

let transporter = null;

export const initializeEmailService = async () => {
  try {
    const admin = await Admin.findOne();
    if (admin?.emailConfig?.email && admin?.emailConfig?.password) {
      transporter = nodemailer.createTransport({
        service: admin.emailConfig.service || 'gmail',
        auth: {
          user: admin.emailConfig.email,
          pass: admin.emailConfig.password
        }
      });
      console.log('Email service initialized');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Email service initialization failed:', error);
    return false;
  }
};

export const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    if (!transporter) {
      await initializeEmailService();
    }

    if (!transporter) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

export const sendBulkEmail = async (recipients, subject, html) => {
  const results = [];
  for (const email of recipients) {
    const result = await sendEmail(email, subject, html);
    results.push({ email, ...result });
  }
  return results;
};
