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
    // Don't throw - log and return failure so signup/login still works
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
</create_file>
<create_file>
<absolute_path>C:/Users/infin/Downloads/echo-vault-backend/src/utils/oauth.js</absolute_path>
<content>const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const prisma = require('./prisma');
const { generateToken } = require('./jwt');

const BASE_URL = process.env.BASE_URL || 'https://admin.echovaultz.com';

/**
 * Serialize user to session
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

/**
 * Google OAuth Strategy
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/api/auth/google/callback`,
    scope: ['profile', 'email'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName;
      const googleId = profile.id;
      const avatarUrl = profile.photos?.[0]?.value;

      if (!email) {
        return done(new Error('No email provided by Google'), null);
      }

      // Find existing user by email or google ID
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { authProviderId: googleId, authProvider: 'google' },
          ],
        },
      });

      if (user) {
        // Update provider info if not set
        if (!user.authProvider) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              authProvider: 'google',
              authProviderId: googleId,
              avatarUrl: avatarUrl || user.avatarUrl,
              isVerified: true,
            },
          });
        }
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name,
            username: email.split('@')[0],
            password: '', // OAuth users have no password
            role: 'USER',
            authProvider: 'google',
            authProviderId: googleId,
            avatarUrl: avatarUrl || null,
            isVerified: true,
            verifiedAt: new Date(),
          },
        });
      }

      const token = generateToken(user.id, user.role);
      return done(null, { ...user, oauthToken: token });
    } catch (error) {
      return done(error, null);
    }
  }));
}

/**
 * Apple OAuth Strategy
 */
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKeyString: process.env.APPLE_PRIVATE_KEY,
    callbackURL: `${BASE_URL}/api/auth/apple/callback`,
    scope: ['name', 'email'],
  }, async (accessToken, refreshToken, idToken, profile, done) => {
    try {
      const email = profile?.email || idToken?.email;
      const name = profile?.name?.firstName 
        ? `${profile.name.firstName} ${profile.name.lastName || ''}`.trim()
        : email?.split('@')[0] || 'Apple User';
      const appleId = profile?.id || idToken?.sub;

      if (!email) {
        return done(new Error('No email provided by Apple'), null);
      }

      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { authProviderId: appleId, authProvider: 'apple' },
          ],
        },
      });

      if (user) {
        if (!user.authProvider) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              authProvider: 'apple',
              authProviderId: appleId,
              isVerified: true,
            },
          });
        }
      } else {
        user = await prisma.user.create({
          data: {
            email,
            name,
            username: email.split('@')[0],
            password: '',
            role: 'USER',
            authProvider: 'apple',
            authProviderId: appleId,
            isVerified: true,
            verifiedAt: new Date(),
          },
        });
      }

      const token = generateToken(user.id, user.role);
      return done(null, { ...user, oauthToken: token });
    } catch (error) {
      return done(error, null);
    }
  }));
}

module.exports = passport;
</create_file>
<create_file>
<absolute_path>C:/Users/infin/Downloads/echo-vault-backend/views/verify-email.ejs</absolute_path>
<content><!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Email Verified - EchoVault</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: #1a1a1a;
      border-radius: 24px;
      padding: 48px 32px;
      text-align: center;
      border: 1px solid #333;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
    }
    h1 { font-size: 24px; margin-bottom: 12px; }
    p { color: #888; line-height: 1.6; margin-bottom: 24px; font-size: 16px; }
    .btn {
      display: inline-block;
      padding: 14px 36px;
      background: #7c3aed;
      color: #fff;
      text-decoration: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn:hover { background: #6d28d9; }
    .success { color: #22c55e; }
    .error { color: #ef4444; }
    .status-text { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <% if (success) { %>
      <div class="icon">✓</div>
      <h1>Email Verified!</h1>
      <p class="status-text success">Your email has been successfully verified.</p>
      <p>You can now log in to your EchoVault account and enjoy all features.</p>
      <a href="<%= appUrl || 'https://echovaultz.com' %>" class="btn">Go to EchoVault</a>
    <% } else { %>
      <div class="icon">✕</div>
      <h1>Verification Failed</h1>
      <p class="status-text error"><%= message || 'Invalid or expired verification token.' %></p>
      <p>Please try signing up again or contact support.</p>
      <a href="<%= appUrl || 'https://echovaultz.com' %>" class="btn">Back to EchoVault</a>
    <% } %>
  </div>
</body>
</html>
</create_file>
<create_file>
<absolute_path>C:/Users/infin/Downloads/echo-vault-backend/views/reset-password.ejs</absolute_path>
<content><!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Password - EchoVault</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: #1a1a1a;
      border-radius: 24px;
      padding: 48px 32px;
      border: 1px solid #333;
    }
    .icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 28px;
    }
    h1 { font-size: 24px; margin-bottom: 8px; text-align: center; }
    p { color: #888; text-align: center; margin-bottom: 32px; font-size: 15px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; color: #ccc; font-size: 14px; }
    input {
      width: 100%;
      padding: 14px 16px;
      background: #0a0a0a;
      border: 1px solid #333;
      border-radius: 12px;
      color: #fff;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #7c3aed; }
    .btn {
      width: 100%;
      padding: 14px;
      background: #7c3aed;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn:hover { background: #6d28d9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .message { padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
    .error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .success { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
  </style>
</head>
<body>
  <% if (expired) { %>
    <div class="card">
      <div class="icon">⏰</div>
      <h1>Link Expired</h1>
      <p>This password reset link has expired. Please request a new one.</p>
      <a href="<%= appUrl || 'https://echovaultz.com' %>" class="btn" style="display: block; text-align: center; text-decoration: none;">Back to EchoVault</a>
    </div>
  <% } else if (success) { %>
    <div class="card">
      <div class="icon">✓</div>
      <h1>Password Reset!</h1>
      <p>Your password has been successfully updated. You can now log in with your new password.</p>
      <a href="<%= appUrl || 'https://echovaultz.com' %>" class="btn" style="display: block; text-align: center; text-decoration: none;">Go to Login</a>
    </div>
  <% } else { %>
    <div class="card">
      <div class="icon">🔐</div>
      <h1>Reset Password</h1>
      <p>Enter your new password below.</p>
      
      <% if (error) { %>
        <div class="message error"><%= error %></div>
      <% } %>
      
      <form action="/api/auth/reset-password/<%= token %>" method="POST">
        <div class="form-group">
          <label for="password">New Password</label>
          <input type="password" id="password" name="password" required minlength="6" placeholder="At least 6 characters">
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6" placeholder="Repeat your password">
        </div>
        <button type="submit" class="btn">Reset Password</button>
      </form>
    </div>
  <% } %>
</body>
</html>
</create_file>
</invoke>
