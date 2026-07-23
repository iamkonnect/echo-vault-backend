const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { verifyToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendEmail } = require('../utils/email');

const giftIconDir = path.join(__dirname, '../../public/gift-icons');
if (!fs.existsSync(giftIconDir)) {
  fs.mkdirSync(giftIconDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, giftIconDir),
  filename: (req, file, cb) => {
    cb(null, 'gift-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/gif', 'image/jpeg', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

const BASE_URL = process.env.BASE_URL || 'https://admin.echovaultz.com';

// ===================== DASHBOARD =====================
router.get('/dashboard', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const stats = { revenue: 0, userCount: 0, artistCount: 0, withdrawals: [], topArtists: [], topVideos: [], topShorts: [], topStreams: [], reportsCount: 0 };
    const user = req.user;
    if (req.headers.accept && req.headers.accept.includes('application/json')) return res.json(stats);
    res.render('admin-dashboard', { stats, user });
  } catch (error) {
    res.status(500).json({ message: 'Error loading dashboard data' });
  }
});

// ===================== USER MANAGEMENT =====================
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, username: true, role: true, isVerified: true, isOnline: true, lastLogin: true, lastLoginIp: true, lastLoginRegion: true, createdAt: true, _count: { select: { songs: true, shorts: true } } },
      orderBy: { lastLogin: 'desc' },
    });
    res.render('admin-user-directory', { users, user: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/api', protect, authorize(['ADMIN']), adminController.getAllUsersApi);
router.get('/users/:id', protect, authorize(['ADMIN']), adminController.getUserDetail);

// ===================== ADD ARTIST PAGE =====================
router.get('/add-artist', async (req, res) => {
  try {
    res.render('admin-add-artist', { user: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===================== ARTIST CRUD API =====================

// GET all artists
router.get('/artists/api', async (req, res) => {
  try {
    const artists = await prisma.user.findMany({
      where: { role: 'ARTIST' },
      select: { id: true, name: true, email: true, username: true, phone: true, role: true, isVerified: true, isOnline: true, walletBalance: true, createdAt: true, _count: { select: { songs: true, shorts: true, liveStreams: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(artists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE artist
router.post('/artists/create', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, email, username, phone, sendEmail: sendEmailFlag } = req.body;
    if (!name || !email || !username) {
      return res.status(400).json({ success: false, error: 'Name, email, and username are required' });
    }
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
      return res.status(409).json({ success: false, error: `This ${existing.email === email ? 'email' : 'username'} is already in use` });
    }
    const rawPassword = crypto.randomBytes(4).toString('hex').toUpperCase() + '!Aa1';
    const hashed = await bcrypt.hash(rawPassword, 10);
    const artist = await prisma.user.create({
      data: { name, email, username, password: hashed, phone: phone || null, role: 'ARTIST', isVerified: true, verifiedAt: new Date() },
      select: { id: true, name: true, email: true, username: true, phone: true, role: true, isVerified: true, createdAt: true }
    });
    console.log(`✅ Artist created: ${artist.name} (${artist.email})`);

    if (sendEmailFlag !== 'false' && sendEmailFlag !== false) {
      const emailHtml = `<!DOCTYPE html><html><body style="font-family:Arial;background:#0a0a0a;color:#fff;padding:40px;"><div style="max-width:600px;margin:0 auto;background:#1a1a1a;border-radius:16px;padding:40px;"><h1 style="color:#8b5cf6;">Welcome to EchoVault, ${name}!</h1><p style="color:#ccc;">Your artist account has been created.</p><div style="background:#0a0a0a;border-radius:12px;padding:20px;margin:20px 0;"><p style="color:#fff;"><strong>Email:</strong> ${email}</p><p style="color:#fff;"><strong>Password:</strong> ${rawPassword}</p></div><p style="color:#f59e0b;font-size:14px;">Change your password after first login.</p><a href="https://echovaultz.com" style="display:inline-block;padding:14px 36px;background:#8b5cf6;color:#fff;text-decoration:none;border-radius:8px;margin-top:20px;">Login</a></div></body></html>`;
      sendEmail({ to: email, subject: 'Your EchoVault Artist Account Credentials', html: emailHtml }).then(r => console.log(`Email sent: ${r.success}`));
    }

    res.status(201).json({ success: true, message: `Artist "${name}" created! Credentials sent to ${email}`, data: { ...artist, tempPassword: rawPassword } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SUSPEND artist
router.post('/artists/:id/suspend', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const artist = await prisma.user.update({
      where: { id: req.params.id },
      data: { isVerified: false, verifiedAt: null },
      select: { id: true, name: true, email: true, isVerified: true }
    });
    res.json({ success: true, message: `${artist.name} suspended`, data: artist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UNSUSPEND artist
router.post('/artists/:id/unsuspend', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const artist = await prisma.user.update({
      where: { id: req.params.id },
      data: { isVerified: true, verifiedAt: new Date() },
      select: { id: true, name: true, email: true, isVerified: true }
    });
    res.json({ success: true, message: `${artist.name} reactivated`, data: artist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// RESEND credentials
router.post('/artists/:id/resend-credentials', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const artist = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!artist) return res.status(404).json({ success: false, error: 'Not found' });
    const emailHtml = `<body style="font-family:Arial;background:#0a0a0a;color:#fff;padding:40px;"><div style="max-width:600px;margin:0 auto;background:#1a1a1a;border-radius:16px;padding:40px;"><h2 style="color:#8b5cf6;">EchoVault Account</h2><p style="color:#ccc;">Login with: ${artist.email}</p><p style="color:#f59e0b;">Use "Forgot Password" if needed.</p><a href="https://echovaultz.com" style="display:inline-block;padding:14px 36px;background:#8b5cf6;color:#fff;text-decoration:none;border-radius:8px;margin-top:20px;">Login</a></div></body>`;
    await sendEmail({ to: artist.email, subject: 'Your EchoVault Artist Account', html: emailHtml });
    res.json({ success: true, message: `Email sent to ${artist.email}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================== CREATE ADMIN =====================
router.get('/create-admin', async (req, res) => {
  try {
    let token = req.query.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]) || (req.cookies && req.cookies.token);
    if (!token) return res.status(401).json({ message: 'Token required' });
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true, name: true, role: true } });
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
    const roles = ['ADMIN', 'MANAGER', 'REPORTS_MANAGER', 'ACCOUNTS', 'SUPPORT', 'CONTENT_MODERATOR', 'ANALYST'];
    res.render('admin-create-admin', { roles, user, error: null, success: null });
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/create-admin', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, email, username, password, confirmPassword, phone, role } = req.body;
    const rolesArray = ['ADMIN', 'MANAGER', 'REPORTS_MANAGER', 'ACCOUNTS', 'SUPPORT', 'CONTENT_MODERATOR', 'ANALYST'];
    if (!name || !email || !username || !password || !confirmPassword || !role) return res.status(400).json({ success: false, error: 'All fields required' });
    if (password !== confirmPassword) return res.status(400).json({ success: false, error: 'Passwords do not match' });
    if (password.length < 8) return res.status(400).json({ success: false, error: 'Password min 8 chars' });
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) return res.status(409).json({ success: false, error: `${existing.email === email ? 'Email' : 'Username'} taken` });
    if (!rolesArray.includes(role)) return res.status(400).json({ success: false, error: 'Invalid role' });
    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({ data: { name, email, username, password: hashed, phone: phone || null, role }, select: { id: true, name: true, email: true, username: true, role: true, phone: true, createdAt: true } });
    res.status(201).json({ success: true, message: `Admin ${newAdmin.name} created`, data: newAdmin });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================== ARTIST VERIFICATION =====================
router.get('/artist-verification', async (req, res) => {
  try {
    const artists = await adminController.getUnverifiedArtistsData();
    const formatted = artists.map(a => ({ ...a, contentCount: (a._count.songs || 0) + (a._count.shorts || 0), giftCount: a._count.giftsReceived || 0 }));
    res.render('admin-artist-verification', { artists: formatted, user: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/artist-verification/api', protect, authorize(['ADMIN']), async (req, res) => {
  try { res.json(await adminController.getUnverifiedArtistsData()); } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/artist/:id/verify', protect, authorize(['ADMIN']), adminController.verifyArtist);
router.post('/artist/:id/reject', protect, authorize(['ADMIN']), adminController.rejectArtist);

// ===================== CONTENT MANAGEMENT =====================
router.get('/music-management', (req, res) => res.render('admin-music-management', { user: null, stats: { songs: 0 } }));
router.get('/video-management', (req, res) => res.render('admin-video-management', { user: null, stats: { videos: 0 } }));
router.get('/shorts-management', (req, res) => res.render('admin-shorts-management', { user: null, stats: { shorts: 0 } }));
router.get('/ads-management', (req, res) => res.render('admin-ads-management', { user: null, stats: { ads: 0 } }));
router.get('/slider-management', (req, res) => res.render('admin-slider-management', { user: null, stats: { sliders: 0 } }));

// ===================== PAYOUTS =====================
const payoutController = require('../controllers/adminPayoutController');
router.get('/payouts', (req, res) => res.render('admin-payouts', { user: null, totalRevenue: 0, revenueBreakdown: { gifts: 0, music: 0, live: 0, ads: 0 }, totalPending: 0, totalPaidOut: 0, availableRevenue: 0, withdrawals: [] }));
router.post('/payouts/:id/approve', protect, authorize(['ADMIN']), payoutController.approvePayout);
router.post('/payouts/:id/reject', protect, authorize(['ADMIN']), payoutController.rejectPayout);
router.post('/platform-withdraw', protect, authorize(['ADMIN']), payoutController.platformWithdraw);

// ===================== GIFT MANAGEMENT =====================
router.get('/gifts', async (req, res) => {
  try {
    const gifts = await prisma.giftTemplate.findMany({ orderBy: { actualAmount: 'asc' }, select: { id: true, name: true, actualAmount: true, price: true, icon: true, isActive: true, createdAt: true } });
    res.render('admin-gifts', { user: null, gifts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/gifts/create', protect, authorize(['ADMIN']), upload.single('icon'), async (req, res) => {
  try {
    const { name, price, actualAmount } = req.body;
    if (!name || !price || !actualAmount || !req.file) return res.status(400).json({ success: false, message: 'All fields required including icon' });
    const iconPath = '/gift-icons/' + req.file.filename;
    const gift = await prisma.giftTemplate.create({ data: { name: String(name).trim(), actualAmount: parseFloat(actualAmount), price: parseFloat(price), icon: iconPath, isActive: true } });
    res.status(201).json({ success: true, message: 'Gift created', data: gift });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/gifts/api', async (req, res) => {
  try {
    const gifts = await prisma.giftTemplate.findMany({ orderBy: { actualAmount: 'asc' } });
    res.json({ success: true, data: gifts, count: gifts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== REPORTS =====================
router.get('/reports', (req, res) => res.render('admin-reports', { user: null, reports: [], stats: { totalReports: 0, pendingReports: 0, resolvedReports: 0, flaggedUsers: 0 }, reportsByCategory: [] }));

module.exports = router;
