const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../utils/jwt');

exports.registerDashboard = async (req, res, next) => {
  try {
    const { email, password, name, username, phone } = req.body;
    
    if (!email || !password || !name || !username) {
      return res.status(400).json({ 
        error: 'Email, password, name, and username are required' 
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
      if (existing.email === email) {
        return res.status(400).json({ error: 'Email already in use' });
      } else {
        return res.status(400).json({ error: 'Username already taken' });
      }
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
      },
    });

    res.status(201).json({ 
      success: true,
      message: 'Account created successfully! Redirecting to login...' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
    const userRole = role || 'ARTIST';
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        lastLoginIp: userIp,
        lastLoginRegion: 'Unknown',
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      token,
      user: userWithoutPassword,
      message: 'Account created successfully. Please log in.',
    });
  } catch (err) {
    console.error('Registration error:', err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
    const userRegion = req.headers['x-region'] || 'Unknown';

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        lastLoginIp: userIp,
        lastLoginRegion: userRegion,
        isOnline: true,
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user.id, user.role);

    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    next(err);
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
        message: 'Invalid credentials' 
      });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check role authorization - only ADMIN and ARTIST can access dashboard
    const validRoles = ['ADMIN', 'ARTIST'];
    if (!validRoles.includes(user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Role does not have access to dashboard' 
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
        isOnline: true,
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user.id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return JSON with redirect URL instead of rendering HTML
    const redirectTo = user.role === 'ADMIN' ? '/api/admin/dashboard' : '/api/artist/dashboard';

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword,
      redirectTo
    });

  } catch (err) {
    console.error('Dashboard login error:', err);
    next(err);
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { isOnline: false }
      });
    }
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.json({ message: 'Logged out successfully' });
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided',
        code: 'NO_TOKEN' 
      });
    }

    const decoded = verifyToken(token);
    const newToken = generateToken(decoded.id, decoded.role);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        avatarUrl: true,
        phone: true,
        walletBalance: true,
        isOnline: true,
      },
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND' 
      });
    }

    res.json({
      success: true,
      token: newToken,
      user,
      expiresIn: 24 * 60 * 60,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    next(error);
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
        username: true,
        role: true,
        avatarUrl: true,
        phone: true,
        walletBalance: true,
        isOnline: true,
      },
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND' 
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
