const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  // For development, you can use a test account or your Gmail
  if (process.env.NODE_ENV === 'development') {
    // Option 1: Use Ethereal Email for testing (creates fake emails)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
  
  // Production email configuration
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use App Password for Gmail
      }
    });
  }
  
  // Generic SMTP configuration
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'localhost',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  'email-verification': (data) => ({
    subject: 'Verify Your Email - Real Estate Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2e3092;">Welcome to Real Estate Platform</h2>
        <p>Hello ${data.name},</p>
        <p>Thank you for registering with our real estate investment platform. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" 
             style="background-color: #2e3092; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${data.verificationUrl}</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account with us, please ignore this email.
        </p>
      </div>
    `
  }),
  
  'password-reset': (data) => ({
    subject: 'Reset Your Password - Real Estate Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2e3092;">Password Reset Request</h2>
        <p>Hello ${data.name},</p>
        <p>You requested to reset your password for your Real Estate Platform account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" 
             style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${data.resetUrl}</p>
        <p>This link will expire in 10 minutes for security reasons.</p>
        <p><strong>If you didn't request this password reset, please ignore this email and contact support immediately.</strong></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          For security reasons, this email was sent from an automated system. Please do not reply to this email.
        </p>
      </div>
    `
  }),
  
  'certificate-approved': (data) => ({
    subject: 'Certificate Approved - Real Estate Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #50C878;">Certificate Approved ✅</h2>
        <p>Hello ${data.name},</p>
        <p>Great news! Your share certificate has been approved by our team.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Certificate Details:</h3>
          <p><strong>File:</strong> ${data.fileName}</p>
          <p><strong>Share ID:</strong> ${data.shareId}</p>
          <p><strong>Approved by:</strong> ${data.approvedBy}</p>
          <p><strong>Approval Date:</strong> ${data.approvalDate}</p>
          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
        </div>
        <p>You can now view your approved certificate in your dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.dashboardUrl}" 
             style="background-color: #2e3092; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Dashboard
          </a>
        </div>
      </div>
    `
  }),
  
  'certificate-rejected': (data) => ({
    subject: 'Certificate Requires Attention - Real Estate Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Certificate Needs Revision ⚠️</h2>
        <p>Hello ${data.name},</p>
        <p>Your share certificate submission requires some changes before it can be approved.</p>
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0;">Certificate Details:</h3>
          <p><strong>File:</strong> ${data.fileName}</p>
          <p><strong>Share ID:</strong> ${data.shareId}</p>
          <p><strong>Reviewed by:</strong> ${data.reviewedBy}</p>
          <p><strong>Review Date:</strong> ${data.reviewDate}</p>
          <div style="margin-top: 15px;">
            <strong>Reason for revision:</strong>
            <p style="background-color: white; padding: 10px; border-radius: 3px; margin-top: 5px;">${data.rejectionReason}</p>
          </div>
        </div>
        <p>Please upload a new certificate addressing the feedback provided.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.uploadUrl}" 
             style="background-color: #2e3092; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Upload New Certificate
          </a>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();
    
    let emailContent = {};
    
    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data);
    } else if (html || text) {
      emailContent = { subject, html, text };
    } else {
      throw new Error('Either template or html/text content must be provided');
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@realestate-platform.com',
      to,
      subject: emailContent.subject || subject,
      html: emailContent.html,
      text: emailContent.text
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('📧 Email sent successfully:', {
      to,
      subject: emailContent.subject || subject,
      messageId: result.messageId
    });
    
    return {
      success: true,
      messageId: result.messageId,
      previewUrl: process.env.NODE_ENV === 'development' ? 
        nodemailer.getTestMessageUrl(result) : undefined
    };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // In development, don't fail the operation if email fails
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Email failed in development mode, continuing...');
      return {
        success: false,
        error: error.message,
        development: true
      };
    }
    
    throw error;
  }
};

// Send notification email to directors
const notifyDirectors = async ({ subject, message, data }) => {
  try {
    const User = require('../models/User');
    const directors = await User.find({ role: 'director', isActive: true });
    
    const emailPromises = directors.map(director => 
      sendEmail({
        to: director.email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2e3092;">Director Notification</h2>
            <p>Hello ${director.profile.name},</p>
            <p>${message}</p>
            ${data ? `
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <pre style="margin: 0; white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</pre>
              </div>
            ` : ''}
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              This is an automated notification from the Real Estate Platform system.
            </p>
          </div>
        `
      })
    );
    
    await Promise.all(emailPromises);
    console.log(`📧 Notification sent to ${directors.length} directors`);
    
  } catch (error) {
    console.error('❌ Failed to notify directors:', error);
  }
};

module.exports = {
  sendEmail,
  notifyDirectors,
  emailTemplates
};