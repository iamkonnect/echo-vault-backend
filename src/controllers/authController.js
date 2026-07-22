const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../utils/jwt');

// ============ REGISTER ============

exports.registerDashboard = async (req, res, next) => {
  try {
    const { email, password, name, username, phone } = req.body;

    // Validate input
    if (!email || !password || !name || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, name, and username are required'
      });
    }

    // Check if user exists
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';

    // Create user
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

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ARTIST',
        lastLoginIp: userIp,
        lastLoginRegion: 'Unknown',
        isVerified: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    const token = generateToken(user.id, user.role);

    console.log(`✅ Frontend user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
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

    // Update last login
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

    // Check if user is admin or artist
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
