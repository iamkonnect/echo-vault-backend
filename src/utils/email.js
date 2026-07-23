const nodemailer = require('nodemailer');

/**
 * Email Service for EchoVault
 * Uses SMTP configured via environment variables
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.echovaultz.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'noreply@echovaultz.com',
    pass: process.env.SMTP_PASS || '',
  },
});

const FROM_NAME = process.env.FROM_NAME || 'EchoVault';
const FROM_EMAIL = process.env.SMTP_USER || 'noreply@echovaultz.com';
const BASE_URL = process.env.BASE_URL || 'https://admin.echovaultz.com';

/**
 * Send an email
 */
async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send email verification link
 */
async function sendVerificationEmail(email, token, name) {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 40px;">
      <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 16px; padding: 40px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; background: #7c3aed; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 30px;">🎵</span>
          </div>
          <h1 style="color: #fff; margin-top: 20px;">Welcome to EchoVault</h1>
        </div>
        <p style="color: #ccc; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
          Thank you for creating an account! Please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 14px 36px; background: #7c3aed; color: #fff; 
                    text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #888; font-size: 14px; line-height: 1.6;">
          Or copy this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #7c3aed; word-break: break-all;">${verificationUrl}</a>
        </p>
        <p style="color: #888; font-size: 14px; line-height: 1.6;">
          This link expires in 24 hours. If you didn't create an account, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          &copy; ${new Date().getFullYear()} EchoVault. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify your EchoVault email address',
    html,
  });
}

/**
 * Send password reset link
 */
async function sendPasswordResetEmail(email, token, name) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 40px;">
      <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 16px; padding: 40px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; background: #7c3aed; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 30px;">🔐</span>
          </div>
          <h1 style="color: #fff; margin-top: 20px;">Reset Your Password</h1>
        </div>
        <p style="color: #ccc; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to set a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 14px 36px; background: #7c3aed; color: #fff; 
                    text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #888; font-size: 14px; line-height: 1.6;">
          Or copy this link into your browser:<br>
          <a href="${resetUrl}" style="color: #7c3aed; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="color: #888; font-size: 14px; line-height: 1.6;">
          This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          &copy; ${new Date().getFullYear()} EchoVault. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your EchoVault password',
    html,
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
