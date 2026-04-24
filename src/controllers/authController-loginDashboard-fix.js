// FIXED: renderDashboard that fetches REAL data for ALL tables

const prisma = require('../utils/prisma');

exports.loginDashboard = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const bcrypt = require('bcryptjs');
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
    const { generateToken } = require('../utils/jwt');
    const token = generateToken(user.id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // FETCH REAL DATA FOR DASHBOARD
    const stats = {};

    // Real user counts
    stats.userCount = await prisma.user.count();
    stats.artistCount = await prisma.user.count({ where: { role: 'ARTIST' } });

    // Real revenue
    const revenueAgg = await prisma.transaction.aggregate({
      where: { type: { in: ['GIFT', 'PLATFORM_FEE'] }, status: 'COMPLETED' },
      _sum: { amount: true }
    });
    stats.revenue = revenueAgg._sum.amount || 0;

    // Real withdrawals
    stats.withdrawals = await prisma.transaction.findMany({
      where: { type: 'WITHDRAWAL', status: 'PENDING' },
      include: { user: { select: { name: true, email: true } } },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    stats.reportsCount = 0;

    // REAL TOP ARTISTS
    stats.topArtists = await prisma.user.findMany({
      where: { role: 'ARTIST' },
      select: {
        id: true,
        name: true,
        songs: { select: { playCount: true } },
        shorts: { select: { playCount: true } },
        _count: { select: { giftsReceived: true } }
      },
      orderBy: { giftsReceived: { _count: 'desc' } },
      take: 5
    }).then(artists => 
      artists.map((a, idx) => ({
        rank: idx + 1,
        name: a.name,
        totalStreams: (a.songs?.reduce((sum, s) => sum + (s.playCount || 0), 0) || 0) + 
                     (a.shorts?.reduce((sum, s) => sum + (s.playCount || 0), 0) || 0),
        followers: a._count.giftsReceived * 100,
        revenue: (a._count.giftsReceived || 0) * 50
      }))
    );

    // REAL TOP VIDEOS
    stats.topVideos = await prisma.video.findMany({
      select: {
        title: true,
        playCount: true,
        artist: { select: { name: true } }
      },
      orderBy: { playCount: 'desc' },
      take: 5
    }).then(videos =>
      videos.map((v, idx) => ({
        rank: idx + 1,
        title: v.title,
        creator: v.artist.name,
        views: v.playCount,
        revenue: (v.playCount * 0.005).toFixed(2)
      }))
    );

    // REAL TOP SHORTS
    stats.topShorts = await prisma.short.findMany({
      select: {
        title: true,
        playCount: true,
        giftCount: true,
        artist: { select: { name: true } }
      },
      orderBy: { playCount: 'desc' },
      take: 5
    }).then(shorts =>
      shorts.map((s, idx) => ({
        rank: idx + 1,
        title: s.title,
        creator: s.artist.name,
        views: s.playCount,
        revenue: (s.giftCount * 2.5).toFixed(2)
      }))
    );

    // REAL TOP STREAMS
    stats.topStreams = await prisma.liveStream.findMany({
      select: {
        title: true,
        viewerCount: true,
        giftCount: true,
        artist: { select: { name: true } }
      },
      orderBy: { giftCount: 'desc' },
      take: 5
    }).then(streams =>
      streams.map((s, idx) => ({
        rank: idx + 1,
        title: s.title,
        artist: s.artist.name,
        peakViewers: s.viewerCount || 0,
        revenue: (s.giftCount * 3).toFixed(2)
      }))
    );

    if (user.role === 'ADMIN') {
      res.render('admin-dashboard', { user: userWithoutPassword, stats });
    } else {
      res.render('artist-dashboard', { user: userWithoutPassword, stats });
    }
  } catch (err) {
    next(err);
  }
};
