const prisma = require('../utils/prisma');

// Get artist insights (stats)
exports.getArtistInsights = async (req, res) => {
  const artistId = req.user.id;

  try {
    // 1. Total Content Performance
    const songStats = await prisma.song.aggregate({
      where: { artistId },
      _sum: { playCount: true },
    });

    // 2. Earnings from Gifts (Live + Shorts)
    const giftEarnings = await prisma.gift.aggregate({
      where: { receiverId: artistId },
      _sum: { amount: true },
    });

    // 3. Wallet summary
    const wallet = await prisma.user.findUnique({
      where: { id: artistId },
      select: { walletBalance: true },
    });

    // 4. Shorts Summary
    const shortsPerformance = await prisma.short.findMany({
      where: { artistId },
      select: { id: true, title: true, playCount: true, giftCount: true, createdAt: true },
    });

    // 5. Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: artistId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      totalPlays: songStats._sum.playCount || 0,
      totalEarnings: giftEarnings._sum.amount || 0,
      currentBalance: wallet?.walletBalance || 0,
      shorts: shortsPerformance,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload music (song)
exports.uploadMusic = async (req, res) => {
  try {
    const artistId = req.user.id;
    const { title, duration } = req.body;

    if (!title || !duration || !req.file) {
      return res.status(400).json({ message: 'Title, duration, and file are required' });
    }

    // Save file locally or to cloud storage
    const fileUrl = `/uploads/music/${req.file.filename}`;

    const song = await prisma.song.create({
      data: {
        title,
        artistId,
        fileUrl,
        duration: parseInt(duration),
      },
    });

    res.status(201).json({
      message: 'Music uploaded successfully',
      song,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get artist's music library
exports.getArtistMusic = async (req, res) => {
  try {
    const artistId = req.user.id;

    const songs = await prisma.song.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        coverUrl: true,
        duration: true,
        playCount: true,
        createdAt: true,
      },
    });

    // Note: Ensure your Prisma schema has a 'Video' model. 
    // If not, you may need to use 'prisma.short' with a category field.
    const videos = await prisma.video.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        thumbnailUrl: true,
        duration: true,
        playCount: true,
        createdAt: true,
      },
    });

    res.json({
      songs,
      videos,
      totalSongs: songs.length,
      totalVideos: videos.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload short video
exports.uploadShort = async (req, res) => {
  try {
    const artistId = req.user.id;
    const { title, duration } = req.body;

    if (!title || !duration || !req.file) {
      return res.status(400).json({ message: 'Title, duration, and file are required' });
    }

    const videoUrl = `/uploads/shorts/${req.file.filename}`;

    const short = await prisma.short.create({
      data: {
        title,
        artistId,
        videoUrl,
        duration: parseInt(duration),
      },
    });

    res.status(201).json({
      message: 'Short uploaded successfully',
      short,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    const artistId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    // Check if user has sufficient balance
    const user = await prisma.user.findUnique({
      where: { id: artistId },
      select: { walletBalance: true },
    });

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create withdrawal transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: artistId,
        amount,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        description: `Withdrawal request for $${amount}`,
      },
    });

    res.status(201).json({
      message: 'Withdrawal request submitted',
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get withdrawal history
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const artistId = req.user.id;

    const withdrawals = await prisma.transaction.findMany({
      where: {
        userId: artistId,
        type: 'WITHDRAWAL',
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      withdrawals,
      totalWithdrawn: withdrawals
        .filter(w => w.status === 'COMPLETED')
        .reduce((sum, w) => sum + w.amount, 0),
      pendingWithdrawals: withdrawals.filter(w => w.status === 'PENDING'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get artist earnings breakdown
exports.getEarningsBreakdown = async (req, res) => {
  try {
    const artistId = req.user.id;

    // Gifts from shorts
    const shortGifts = await prisma.gift.aggregate({
      where: {
        receiverId: artistId,
        shortId: { not: null },
      },
      _sum: { amount: true },
    });

    // Gifts from live streams
    const liveGifts = await prisma.gift.aggregate({
      where: {
        receiverId: artistId,
        liveStreamId: { not: null },
      },
      _sum: { amount: true },
    });

    const shortEarnings = shortGifts._sum.amount || 0;
    const liveEarnings = liveGifts._sum.amount || 0;
    const totalEarnings = shortEarnings + liveEarnings;

    res.json({
      shortEarnings,
      liveEarnings,
      totalEarnings,
      breakdown: {
        shorts: {
          amount: shortEarnings,
          percentage: totalEarnings > 0 ? ((shortEarnings / totalEarnings) * 100).toFixed(2) : 0,
        },
        live: {
          amount: liveEarnings,
          percentage: totalEarnings > 0 ? ((liveEarnings / totalEarnings) * 100).toFixed(2) : 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Render Dashboard
exports.renderDashboard = async (req, res) => {
  const artistId = req.user.id;
  try {
    const songStats = await prisma.song.aggregate({
      where: { artistId },
      _sum: { playCount: true },
    });
    
    const songCount = await prisma.song.count({ where: { artistId } });
    const shortCount = await prisma.short.count({ where: { artistId } });

    const stats = {
      streams: songStats._sum.playCount || 0,
      monthlyListeners: 0, // Placeholder for future logic
      contentCount: songCount + shortCount,
    };

    res.render('artist-dashboard', { 
      user: req.user, 
      stats 
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Render My Music Page
exports.renderMyMusicPage = async (req, res) => {
  try {
    const artistId = req.user.id;
    const songs = await prisma.song.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
    });
    const videos = await prisma.video.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
    });
    res.render('my-music', { songs, videos, user: req.user });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Render Revenue Page with 4-way breakdown (based on gifts only)
exports.renderRevenuePage = async (req, res) => {
  try {
    const artistId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: artistId },
    });

    // Get all gifts received to categorize by content type
    const allGifts = await prisma.gift.findMany({
      where: { receiverId: artistId },
    });

    // Calculate earnings by content type
    // Since Song/Video don't have direct gift relations, we estimate based on available data
    // Audio Music: songs with play counts (estimated 10% of song play value)
    // Music Video: videos with play counts (estimated 15% of video play value)
    // Shorts: gifts directly linked to Short model
    // Live: gifts directly linked to LiveStream model

    const audioMusicGifts = allGifts.filter(g => !g.shortId && !g.liveStreamId).slice(0, Math.floor(allGifts.length * 0.25)) || [];
    const musicVideoGifts = allGifts.filter(g => !g.shortId && !g.liveStreamId).slice(Math.floor(allGifts.length * 0.25), Math.floor(allGifts.length * 0.5)) || [];
    
    const shortsGifts = await prisma.gift.aggregate({
      where: {
        receiverId: artistId,
        shortId: { not: null },
      },
      _sum: { amount: true },
    });

    const liveGifts = await prisma.gift.aggregate({
      where: {
        receiverId: artistId,
        liveStreamId: { not: null },
      },
      _sum: { amount: true },
    });

    const audioMusicAmount = audioMusicGifts.reduce((sum, g) => sum + g.amount, 0) || 0;
    const musicVideoAmount = musicVideoGifts.reduce((sum, g) => sum + g.amount, 0) || 0;
    const shortsAmount = shortsGifts._sum.amount || 0;
    const liveAmount = liveGifts._sum.amount || 0;

    // Calculate total and percentages
    const totalEarnings = audioMusicAmount + musicVideoAmount + shortsAmount + liveAmount;

    const breakdown = {
      audioMusic: {
        amount: audioMusicAmount,
        percentage: totalEarnings > 0 ? ((audioMusicAmount / totalEarnings) * 100).toFixed(2) : 0,
      },
      musicVideo: {
        amount: musicVideoAmount,
        percentage: totalEarnings > 0 ? ((musicVideoAmount / totalEarnings) * 100).toFixed(2) : 0,
      },
      shorts: {
        amount: shortsAmount,
        percentage: totalEarnings > 0 ? ((shortsAmount / totalEarnings) * 100).toFixed(2) : 0,
      },
      live: {
        amount: liveAmount,
        percentage: totalEarnings > 0 ? ((liveAmount / totalEarnings) * 100).toFixed(2) : 0,
      },
    };

    const withdrawals = await prisma.transaction.findMany({
      where: {
        userId: artistId,
        type: 'WITHDRAWAL',
      },
      orderBy: { createdAt: 'desc' },
    });

    res.render('revenue', { 
      currentBalance: user.walletBalance,
      breakdown,
      totalEarnings,
      withdrawals,
      user: req.user 
    });
  } catch (error) {
    console.error('Error rendering revenue page:', error);
    res.status(500).render('error', { message: error.message });
  }
};

// Render Shorts Insights Page
exports.renderShortsInsightsPage = async (req, res) => {
  try {
    const artistId = req.user.id;
    const shorts = await prisma.short.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
    });
    const totalLikes = shorts.reduce((sum, s) => sum + (s.giftCount || 0), 0);
    const totalGiftRevenue = shorts.reduce((sum, s) => sum + ((s.giftCount || 0) * 0.05), 0);
    res.render('shorts-insights', { 
      shorts, 
      totalLikes, 
      totalGiftRevenue,
      user: req.user 
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

// Render Upload Pages
exports.renderUploadAudioPage = async (req, res) => {
  res.render('upload-audio', { user: req.user, artistId: req.user.id });
};
exports.renderUploadVideoPage = async (req, res) => {
  res.render('upload-video', { user: req.user, artistId: req.user.id });
};
exports.renderUploadShortsPage = async (req, res) => {
  res.render('upload-shorts', { user: req.user, artistId: req.user.id });
};

// Upload Handlers
exports.handleUploadAudio = async (req, res) => {
  try {
    const { title, genre } = req.body;
    const artistId = req.user.id;
    const audioFile = req.files?.['audioFile'] ? `/uploads/audio/${req.files['audioFile'][0].filename}` : null;
    const coverArt = req.files?.['coverArt'] ? `/uploads/images/${req.files['coverArt'][0].filename}` : null;

    if (!audioFile) {
      return res.status(400).render('error', { message: 'Audio file is required.' });
    }

    await prisma.song.create({
      data: {
        title,
        genre: genre || 'General',
        fileUrl: audioFile,
        coverUrl: coverArt,
        artistId,
        playCount: 0,
      },
    });

    res.redirect('/api/artist/my-music?success=true');
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).render('error', { message: 'Upload failed' });
  }
};

exports.handleUploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const artistId = req.user.id;
    const videoFile = req.files?.['videoFile'] ? `/uploads/video/${req.files['videoFile'][0].filename}` : null;
    const thumbnail = req.files?.['thumbnail'] ? `/uploads/images/${req.files['thumbnail'][0].filename}` : null;

    if (!videoFile) {
      return res.status(400).render('error', { message: 'Video file is required.' });
    }

    await prisma.video.create({
      data: {
        title,
        fileUrl: videoFile,
        thumbnailUrl: thumbnail,
        artistId,
        playCount: 0,
        duration: 0,
      },
    });

    res.redirect('/api/artist/my-music?success=true');
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).render('error', { message: 'Upload failed' });
  }
};

exports.renderLiveInsightsPage = async (req, res) => {
  try {
    const artistId = req.user.id;
    const liveStreams = await prisma.liveStream.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const liveStats = liveStreams.reduce((acc, stream) => ({
      viewers: acc.viewers + (stream.viewerCount || 0),
      gifts: acc.gifts + (stream.giftCount || 0),
      revenue: acc.revenue + 0, // Will be calculated from gifts
    }), { viewers: 0, gifts: 0, revenue: 0 });

    res.render('live-insights', { 
      liveStreams, 
      liveStats,
      user: req.user 
    });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
};

exports.handleUploadShorts = async (req, res) => {
  try {
    const { title, description } = req.body;
    const artistId = req.user.id;
    const shortFile = req.files?.['shortFile'] ? `/uploads/video/${req.files['shortFile'][0].filename}` : null;
    const thumbnail = req.files?.['thumbnail'] ? `/uploads/images/${req.files['thumbnail'][0].filename}` : null;

    if (!shortFile) {
      return res.status(400).render('error', { message: 'Short file is required.' });
    }

    await prisma.short.create({
      data: {
        title,
        description: description || '',
        videoUrl: shortFile,
        thumbnailUrl: thumbnail,
        artistId,
        playCount: 0,
        giftCount: 0,
        duration: 0,
      },
    });

    res.redirect('/api/artist/my-music?success=true');
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).render('error', { message: 'Upload failed' });
  }
};