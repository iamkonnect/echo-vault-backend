const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateToken, verifyToken } = require('../utils/jwt');
const { sendVerificationEmail: sendVerifEmail, sendPasswordResetEmail } = require('../utils/email');

// ============ REGISTER ============

exports.registerDashboard = async (req, res, next) => {
  try {
    const { email, password, name, username, phone } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, name, and username are required'
      });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existing) {
      const field = existing.email === email ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username,
        phone: phone || null,
        avatarUrl: null,
        role: 'ARTIST',
        lastLoginIp: userIp,
        lastLoginRegion: 'Unknown',
        isVerified: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        createdAt: true
      }
    });

    console.log(`✅ New artist registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please log in.',
      data: user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: err.message
    });
  }
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // FRONTEND USERS get role 'USER' by default (not ARTIST)
    // They can upgrade to ARTIST later via the artist mode toggle
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
        lastLoginIp: userIp,
        lastLoginRegion: 'Unknown',
        isVerified: false,
        emailVerificationToken: verificationToken,
        emailVerified: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    const token = generateToken(user.id, user.role);

    console.log(`✅ Frontend user registered: ${user.email} (role: USER)`);

    // Send verification email (non-blocking - don't fail if email fails)
    sendVerifEmail(email, verificationToken, name).catch(err => {
      console.error('Failed to send verification email:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      token,
      requiresEmailVerification: true,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: err.message
    });
  }
};

// ============ LOGIN ============

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
    const userRegion = req.headers['x-region'] || 'Unknown';

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        lastLoginIp: userIp,
        lastLoginRegion: userRegion,
        isOnline: true
      }
    });

    const token = generateToken(user.id, user.role);

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      emailVerified: user.emailVerified,
      walletBalance: user.walletBalance
    };

    console.log(`✅ Frontend user login: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message
    });
  }
};

exports.loginDashboard = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!['ADMIN', 'ARTIST', 'MANAGER', 'ACCOUNTS'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Dashboard access denied'
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        lastLoginIp: userIp,
        isOnline: true
      }
    });

    const token = generateToken(user.id, user.role);

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      walletBalance: user.walletBalance,
      phone: user.phone
    };

    console.log(`✅ Dashboard login: ${user.email} (${user.role})`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse,
      redirectTo: user.role === 'ADMIN' ? '/api/admin/dashboard' : '/api/artist/dashboard'
    });
  } catch (err) {
    console.error('Dashboard login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message
    });
  }
};

// ============ LOGOUT ============

exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { isOnline: false }
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: err.message
    });
  }
};

// ============ EMAIL VERIFICATION ============

exports.sendVerificationEmail = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: verificationToken }
    });

    const result = await sendVerifEmail(user.email, verificationToken, user.name || 'User');

    if (result.success) {
      res.json({
        success: true,
        message: 'Verification email sent'
      });
    } else {
      res.json({
        success: true,
        message: 'Verification email queued. If email sending is not configured, contact support.',
        emailConfigured: false
      });
    }
  } catch (err) {
    console.error('Send verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: err.message
    });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const appUrl = process.env.CLIENT_URL || 'https://echovaultz.com';

    if (!token) {
      // If it's a GET request, render the view
      if (req.method === 'GET') {
        return res.render('verify-email', { 
          success: false, 
          message: 'No verification token provided',
          appUrl 
        });
      }
      return res.status(400).json({
        success: false,
        message: 'No verification token provided'
      });
    }

    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      if (req.method === 'GET') {
        return res.render('verify-email', { 
          success: false, 
          message: 'Invalid or expired verification token',
          appUrl 
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        verifiedAt: new Date(),
        isVerified: true
      }
    });

    console.log(`✅ Email verified: ${user.email}`);

    if (req.method === 'GET') {
      return res.render('verify-email', { 
        success: true, 
        message: 'Email verified successfully',
        appUrl 
      });
    }

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: err.message
    });
  }
};

// ============ FORGOT / RESET PASSWORD ============

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const appUrl = process.env.CLIENT_URL || 'https://echovaultz.com';

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    const result = await sendPasswordResetEmail(user.email, resetToken, user.name || 'User');

    console.log(`✅ Password reset email sent: ${user.email}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: err.message
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const appUrl = process.env.CLIENT_URL || 'https://echovaultz.com';

    // GET request - render the reset form
    if (req.method === 'GET') {
      if (!token) {
        return res.redirect(`${appUrl}/login`);
      }

      const user = await prisma.user.findUnique({
        where: { resetPasswordToken: token }
      });

      if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        return res.render('reset-password', { 
          success: false, 
          expired: true, 
          error: null,
          token,
          appUrl 
        });
      }

      return res.render('reset-password', { 
        success: false, 
        expired: false,
        error: null,
        token,
        appUrl 
      });
    }

    // POST request - update password
    const { password, confirmPassword } = req.body;

    if (!password || password.length < 6) {
      return res.render('reset-password', { 
        success: false, 
        expired: false,
        error: 'Password must be at least 6 characters',
        token,
        appUrl 
      });
    }

    if (password !== confirmPassword) {
      return res.render('reset-password', { 
        success: false, 
        expired: false,
        error: 'Passwords do not match',
        token,
        appUrl 
      });
    }

    const user = await prisma.user.findUnique({
      where: { resetPasswordToken: token }
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.render('reset-password', { 
        success: false, 
        expired: true,
        error: null,
        token,
        appUrl 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    console.log(`✅ Password reset completed: ${user.email}`);

    res.render('reset-password', { 
      success: true, 
      expired: false,
      error: null,
      token,
      appUrl 
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: err.message
    });
  }
};

// ============ TOKEN MANAGEMENT ============

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const newToken = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Token refreshed',
      token: newToken
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed',
      error: err.message
    });
  }
};

exports.verifyAuth = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        emailVerified: true,
        walletBalance: true
      }
    });

    res.json({
      success: true,
      message: 'User authenticated',
      user
    });
  } catch (err) {
    console.error('Auth verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: err.message
    });
  }
};

// ============ UPGRADE TO ARTIST ============

exports.upgradeToArtist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user already has backend access roles
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true, email: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If already ARTIST or ADMIN, just confirm
    if (user.role === 'ARTIST' || user.role === 'ADMIN') {
      return res.json({
        success: true,
        message: 'You are already an artist',
        user: { ...user, role: 'ARTIST' }
      });
    }

    // Upgrade from USER to ARTIST
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ARTIST' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        walletBalance: true
      }
    });

    console.log(`✅ User upgraded to artist: ${updatedUser.email}`);

    res.json({
      success: true,
      message: 'Congratulations! You are now an artist. You can now access the artist dashboard, upload music, and go live.',
      user: updatedUser
    });
  } catch (err) {
    console.error('Upgrade to artist error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade to artist',
      error: err.message
    });
  }
};
