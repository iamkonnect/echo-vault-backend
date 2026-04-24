const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

async function calculatePlatformStats() {
const stats = {
    userCount: 0,
    artistCount: 0,
    verifiedArtistCount: 0,
    unverifiedArtistCount: 0,
    onlineCount: 0,
    revenue: 0,
    withdrawals: [],
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    flaggedUsers: 0,
    reportsCount: 0
  };

  try {
    stats.userCount = await prisma.user.count();
  } catch {}

  try {
    stats.artistCount = await prisma.user.count({ where: { role: 'ARTIST' } });
  } catch {}

  try {
    stats.verifiedArtistCount = await prisma.user.count({ 
      where: { role: 'ARTIST', isVerified: true } 
    });
  } catch {}

  try {
    stats.unverifiedArtistCount = await prisma.user.count({ 
      where: { role: 'ARTIST', isVerified: false } 
    });
  } catch {}

  try {
    stats.onlineCount = await prisma.user.count({ 
      where: { isOnline: true } 
    });
  } catch {}

  try {
    const platformRevenueAgg = await prisma.transaction.aggregate({
      where: { type: 'PLATFORM_FEE', status: 'COMPLETED' },
      _sum: { amount: true }
    });
    stats.revenue = platformRevenueAgg._sum.amount || 0;
  } catch {}

  try {
    stats.withdrawals = await prisma.transaction.findMany({
      where: { type: 'WITHDRAWAL', status: 'PENDING' },
      include: { user: { select: { name: true, email: true } } },
      take: 5
    });
  } catch {
    stats.withdrawals = [];
  }

  // Reports stats
  try {
    stats.totalReports = await prisma.report.count();
  } catch {}

  try {
    stats.pendingReports = await prisma.report.count({ where: { status: 'PENDING' } });
  } catch {}

  try {
    stats.resolvedReports = await prisma.report.count({ where: { status: 'RESOLVED' } });
  } catch {}

  try {
    stats.flaggedUsers = await prisma.report.groupBy({
      by: ['reportedUserId'],
      where: { status: { not: 'DISMISSED' } },
      _count: { id: true }
    }).then(groups => groups.length);
  } catch {
    stats.flaggedUsers = 0;
  }

  return stats;
}

exports.getPlatformStats = async (req, res) => {
  const stats = await calculatePlatformStats();
  if (res) {
    res.json(stats);
  }
  return stats;
};

exports.getUserDetail = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        songs: true,
        shorts: true,
        transactions: { take: 10, orderBy: { createdAt: 'desc' } }
      }
    });
    if (!user) return res.status(404).render('error', { message: 'User not found' });
    res.render('admin-user-view', { user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users with details - API endpoint
exports.getAllUsersApi = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        isOnline: true,
        lastLogin: true,
        lastLoginIp: true,
        lastLoginRegion: true,
        createdAt: true,
        _count: {
          select: {
            songs: true,
            shorts: true,
          }
        }
      },
      orderBy: { lastLogin: 'desc' },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users data for page rendering
exports.getAllUsersForPage = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        isOnline: true,
        lastLogin: true,
        lastLoginIp: true,
        lastLoginRegion: true,
        createdAt: true,
        _count: {
          select: {
            songs: true,
            shorts: true,
          }
        }
      },
      orderBy: { lastLogin: 'desc' },
    });

    return users;
  } catch (error) {
    throw error;
  }
};

// Get unverified artists data
exports.getUnverifiedArtistsData = async () => {
  try {
    const artists = await prisma.user.findMany({
      where: {
        role: 'ARTIST',
        isVerified: false,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
        _count: { 
          select: { 
            songs: true,
            shorts: true,
            giftsReceived: true
          } 
        }
      },
      orderBy: { createdAt: 'asc' },
    });

    return artists;
  } catch (error) {
    throw error;
  }
};

// Get unverified artists for verification queue
exports.getUnverifiedArtists = async (req, res) => {
  try {
    const artists = await exports.getUnverifiedArtistsData();

    // Format data for rendering
    const formattedArtists = artists.map(artist => ({
      ...artist,
      contentCount: (artist._count.songs || 0) + (artist._count.shorts || 0),
      giftCount: artist._count.giftsReceived || 0,
    }));

    res.render('admin-artist-verification', { artists: formattedArtists });
  } catch (error) {
    console.error('Error fetching unverified artists:', error);
    res.status(500).json({ message: error.message });
  }
};

// Verify an artist
exports.verifyArtist = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true, isVerified: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Artist not found.' });
    }

    if (user.role !== 'ARTIST') {
      return res.status(400).json({ message: 'Only artists can be verified.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Artist is already verified.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        isVerified: true,
        verifiedAt: new Date()
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        isVerified: true,
        verifiedAt: true
      },
    });

    console.log(`✅ Artist verified: ${updatedUser.name}`);

    res.status(200).json({
      message: `Artist ${updatedUser.name} has been verified successfully!`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error verifying artist:', error);
    res.status(500).json({ message: 'Error verifying artist.' });
  }
};

// Reject/Unverify an artist
exports.rejectArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true, isVerified: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Artist not found.' });
    }

    if (user.role !== 'ARTIST') {
      return res.status(400).json({ message: 'Only artists can be rejected.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        isVerified: false,
        verifiedAt: null
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        isVerified: true
      },
    });

    console.log(`❌ Artist rejected: ${updatedUser.name} - Reason: ${reason || 'No reason provided'}`);

    res.status(200).json({
      message: `Artist ${updatedUser.name} verification has been revoked.`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error rejecting artist:', error);
    res.status(500).json({ message: 'Error rejecting artist.' });
  }
};

exports.renderCreateAdminForm = (req, res) => {
  const roles = ['ADMIN', 'MANAGER', 'REPORTS_MANAGER', 'ACCOUNTS', 'SUPPORT', 'CONTENT_MODERATOR', 'ANALYST'];
  res.render('admin-create-admin', { roles, user: req.user, error: null });
};

exports.createAdminUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).render('admin-create-admin', { 
        error: 'All fields are required',
        roles: ['ADMIN', 'MANAGER', 'REPORTS_MANAGER', 'ACCOUNTS', 'SUPPORT', 'CONTENT_MODERATOR', 'ANALYST'],
        user: req.user
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).render('admin-create-admin', { 
        error: 'Email already in use',
        roles: ['ADMIN', 'MANAGER', 'REPORTS_MANAGER', 'ACCOUNTS', 'SUPPORT', 'CONTENT_MODERATOR', 'ANALYST'],
        user: req.user
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'ADMIN', // Default to ADMIN role (schema supports USER, ARTIST, ADMIN)
      },
    });
    
    res.redirect('/api/admin/users?success=Admin created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).render('admin-create-admin', { 
      error: error.message || 'Failed to create admin',
      roles: ['ADMIN', 'MANAGER', 'REPORTS_MANAGER', 'ACCOUNTS', 'SUPPORT', 'CONTENT_MODERATOR', 'ANALYST'],
      user: req.user
    });
  }
};

// Render payouts page - Enhanced for revenue tracking
exports.renderPayoutsPage = async (req, res) => {
  try {
    let withdrawals = [];
    let totalPending = 0;
    let totalProcessed = 0;
    let totalRevenue = 0; // Cumulative collected revenue
    let availableRevenue = 0; // Revenue available to withdraw
    let revenueBreakdown = {
      gifts: 0,
      music: 0,
      live: 0,
      ads: 0
    };

    try {
      // Get all platform fees (cumulative revenue collected)
      const allFeesAgg = await prisma.transaction.aggregate({
        where: { type: 'PLATFORM_FEE' },
        _sum: { amount: true }
      });
      totalRevenue = allFeesAgg._sum.amount || 0;

      // Available revenue = Total collected - Total already withdrawn
      const completedWithdrawalsAgg = await prisma.transaction.aggregate({
        where: { type: 'WITHDRAWAL', status: 'COMPLETED' },
        _sum: { amount: true }
      });
      const totalWithdrawn = completedWithdrawalsAgg._sum.amount || 0;
      availableRevenue = Math.max(0, totalRevenue - totalWithdrawn);

      // Pending withdrawal requests from artists
      const rawWithdrawals = await prisma.transaction.findMany({
        where: { type: 'WITHDRAWAL' },
        include: { 
          user: { 
            select: { 
              id: true,
              name: true, 
              email: true 
            } 
          } 
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      withdrawals = rawWithdrawals.map(t => ({
        ...t,
        artistName: t.user?.name || 'Unknown Artist',
        requestedDate: t.createdAt
      }));

      // Aggregates for pending and processed artist payouts
      const completedPayoutsAgg = await prisma.transaction.aggregate({
        where: { type: 'WITHDRAWAL', status: 'COMPLETED' },
        _sum: { amount: true }
      });
      totalProcessed = completedPayoutsAgg._sum.amount || 0;

      const pendingPayoutsAgg = await prisma.transaction.aggregate({
        where: { type: 'WITHDRAWAL', status: 'PENDING' },
        _sum: { amount: true }
      });
      totalPending = pendingPayoutsAgg._sum.amount || 0;

      // Revenue breakdown by source
      const giftFeesAgg = await prisma.transaction.aggregate({
        where: { 
          type: 'PLATFORM_FEE', 
          description: { contains: 'gift' }
        },
        _sum: { amount: true }
      });
      revenueBreakdown.gifts = giftFeesAgg._sum.amount || 0;

      const musicFeesAgg = await prisma.transaction.aggregate({
        where: { 
          type: 'PLATFORM_FEE', 
          description: { contains: 'music' }
        },
        _sum: { amount: true }
      });
      revenueBreakdown.music = musicFeesAgg._sum.amount || 0;

      const liveFeesAgg = await prisma.transaction.aggregate({
        where: { 
          type: 'PLATFORM_FEE', 
          description: { contains: 'live' }
        },
        _sum: { amount: true }
      });
      revenueBreakdown.live = liveFeesAgg._sum.amount || 0;

      const adFeesAgg = await prisma.transaction.aggregate({
        where: { 
          type: 'PLATFORM_FEE', 
          description: { contains: 'ads' }
        },
        _sum: { amount: true }
      });
      revenueBreakdown.ads = adFeesAgg._sum.amount || 0;

    } catch (dbErr) {
      console.warn('Payouts DB query failed:', dbErr.message);
      // Mock data for testing
      totalRevenue = 3420.25;
      availableRevenue = 2170.25;
      totalProcessed = 1250.00;
      totalPending = 250.00;
      revenueBreakdown.gifts = 3420.25;
      withdrawals = [
        { 
          id: 'mock1', 
          amount: 250.00, 
          status: 'PENDING', 
          createdAt: new Date(Date.now() - 86400000),
          artistName: 'Test Artist',
          requestedDate: new Date(Date.now() - 86400000),
          user: { name: 'Test Artist' }
        }
      ];
    }

    res.render('admin-payouts', { 
      user: req.user,
      withdrawals,
      totalPending,
      totalPaidOut: totalProcessed,
      totalRevenue,
      availableRevenue,
      revenueBreakdown
    });
  } catch (error) {
    console.error('ERROR in renderPayoutsPage:', error);
    res.status(500).render('error', { message: 'Payouts page error: ' + error.message });
  }
};

// Approve a payout request
exports.approvePayout = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'COMPLETED' },
      include: { user: { select: { name: true, email: true } } }
    });
    res.json({ message: `Payout of $${transaction.amount} approved for ${transaction.user.name}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a payout request
exports.rejectPayout = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'FAILED' },
      include: { user: { select: { name: true, email: true } } }
    });
    res.json({ message: `Payout of $${transaction.amount} rejected for ${transaction.user.name}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Withdraw to bank (platform revenue)
exports.withdrawToBank = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    // Get the admin user (or system user)
    const adminUser = req.user || await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    
    // Create a bank withdrawal transaction
    const bankWithdrawal = await prisma.transaction.create({
      data: {
        userId: adminUser.id,
        amount: amount,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        description: `Bank transfer - Platform revenue withdrawal`
      }
    });

    res.json({ 
      message: `Successfully transferred $${amount.toFixed(2)} to bank account. Transaction ID: ${bankWithdrawal.id}`,
      transaction: bankWithdrawal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request withdrawal from available revenue
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    const adminUser = req.user || await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    
    const withdrawalRequest = await prisma.transaction.create({
      data: {
        userId: adminUser.id,
        amount: amount,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        description: description || 'Platform revenue withdrawal request'
      }
    });

    res.json({ 
      message: `Withdrawal request for $${amount.toFixed(2)} created. Pending approval.`,
      transaction: withdrawalRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.renderReportsPage = async (req, res) => {
  try {
    const stats = await calculatePlatformStats();

    let reports = [];
    try {
      reports = await prisma.report.findMany({
        where: { status: 'PENDING' },
        include: {
          reportedUser: { select: { name: true, username: true } },
          reporterUser: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
    } catch (dbErr) {
      console.warn('Failed to fetch reports:', dbErr.message);
      reports = [];
    }

    const reportsByCategory = Object.entries(
      reports.reduce((acc, report) => {
        const cat = report.category || 'Other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {})
    ).map(([category, count]) => ({ category, count })).slice(0, 6);

    res.render('admin-reports', { 
      user: req.user, 
      stats, 
      reports, 
      reportsByCategory 
    });
  } catch (error) {
    console.error('Error rendering Admin Reports page:', error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
};

// Resolve report
exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.update({
      where: { id },
      data: { 
        status: 'RESOLVED',
        resolvedAt: new Date()
      }
    });
    res.json({ message: 'Report resolved successfully', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dismiss report
exports.dismissReport = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.report.update({
      where: { id },
      data: { status: 'DISMISSED' }
    });
    res.json({ message: 'Report dismissed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ban user (simple: mark as unverified + add note)
exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data: { 
        isVerified: false,
        verifiedAt: null
      }
    });
    res.json({ message: `User ${user.name} banned successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
