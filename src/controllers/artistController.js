const prisma = require('../utils/prisma');
const { uploadAudio, uploadVideo, uploadImage } = require('../../multerConfig');

// ============================================================================
// API ENDPOINTS - JSON Responses for Flutter Frontend
// ============================================================================

// GET /api/artist/dashboard
// Returns artist dashboard data (overview, stats)
exports.getArtistDashboard = async (req, res) => {
  try {
    const artistId = req.user.id;

    const songStats = await prisma.song.aggregate({
      where: { artistId },
      _sum: { playCount: true },
      _count: true,
    });

    const shortCount = await prisma.short.count({ where: { artistId } });
    const videoCount = await prisma.video.count({ where: { artistId } });

    const wallet = await prisma.user.findUnique({
      where: { id: artistId },
      select: { walletBalance: true, name: true, email: true },
    });

    res.json({
      success: true,
      data: {
        totalPlays: songStats._sum.playCount || 0,
        totalSongs: songStats._count || 0,
        totalShorts: shortCount,
        totalVideos: videoCount,
        totalContent: (songStats._count || 0) + shortCount + videoCount,
        currentBalance: wallet?.walletBalance || 0,
        artistName: wallet?.name,
        artistEmail: wallet?.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/artist/music
// Returns artist's uploaded music library
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
        genre: true,
        createdAt: true,
      },
    });

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

    const shorts = await prisma.short.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        videoUrl: true,
        thumbnailUrl: true,
        duration: true,
        playCount: true,
        giftCount: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: {
        songs,
        videos,
        shorts,
        totalSongs: songs.length,
        totalVideos: videos.length,
        totalShorts: shorts.length,
        totalContent: songs.length + videos.length + shorts.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/artist/insights
// Returns artist insights and analytics
exports.getArtistInsights = async (req, res) => {
  try {
    const artistId = req.user.id;

    // Total Content Performance
    const songStats = await prisma.song.aggregate({
      where: { artistId },
      _sum: { playCount: true },
    });

    // Earnings from Gifts
    const giftEarnings = await prisma.gift.aggregate({
      where: { receiverId: artistId },
      _sum: { amount: true },
    });

    // Wallet summary
    const wallet = await prisma.user.findUnique({
      where: { id: artistId },
      select: { walletBalance: true },
    });

    // Shorts Summary
    const shortsPerformance = await prisma.short.findMany({
      where: { artistId },
      select: {
        id: true,
        title: true,
        playCount: true,
        giftCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: artistId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        totalPlays: songStats._sum.playCount || 0,
        totalEarnings: giftEarnings._sum.amount || 0,
        currentBalance: wallet?.walletBalance || 0,
        shorts: shortsPerformance,
        recentTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/artist/live-insights
// Returns live stream insights and real-time analytics
exports.getLiveInsights = async (req, res) => {
  try {
    const artistId = req.user.id;

    const liveStreams = await prisma.liveStream.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const totalViewers = liveStreams.reduce((sum, s) => sum + (s.viewerCount || 0), 0);
    const totalGifts = liveStreams.reduce((sum, s) => sum + (s.giftCount || 0), 0);

    res.json({
      success: true,
      data: {
        activeStreams: liveStreams.filter(s => s.status === 'ACTIVE').length,
        totalLiveStreams: liveStreams.length,
        totalViewers,
        totalGifts,
        recentStreams: liveStreams,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/artist/shorts-insights
// Returns shorts-specific insights
exports.getShortsInsights = async (req, res) => {
  try {
    const artistId = req.user.id;

    const shorts = await prisma.short.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
    });

    const totalPlays = shorts.reduce((sum, s) => sum + (s.playCount || 0), 0);
    const totalGifts = shorts.reduce((sum, s) => sum + (s.giftCount || 0), 0);
    const averagePlaysPerShort = shorts.length > 0 ? Math.round(totalPlays / shorts.length) : 0;

    res.json({
      success: true,
      data: {
        totalShorts: shorts.length,
        totalPlays,
        totalGifts,
        averagePlaysPerShort,
        topShorts: shorts.slice(0, 5),
        allShorts: shorts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/artist/earnings
// Returns revenue data and earnings breakdown
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
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/artist/withdrawals
// Returns withdrawal history
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

    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0);

    const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING');

    res.json({
      success: true,
      data: {
        withdrawals,
        totalWithdrawn,
        pendingWithdrawals,
        pendingAmount: pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// POST /api/artist/withdraw
// Request a fund withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    const artistId = req.user.id;
    const { amount, bankAccount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid withdrawal amount',
      });
    }

    // Check if user has sufficient balance
    const user = await prisma.user.findUnique({
      where: { id: artistId },
      select: { walletBalance: true },
    });

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance',
      });
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
      success: true,
      data: {
        message: 'Withdrawal request submitted',
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// POST /api/artist/start-stream
// Start a new live stream
exports.startLiveStream = async (req, res) => {
  try {
    const artistId = req.user.id;
    const { title, thumbnail } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Stream title is required',
      });
    }

    const liveStream = await prisma.liveStream.create({
      data: {
        title,
        artistId,
        thumbnailUrl: thumbnail || null,
        status: 'ACTIVE',
        viewerCount: 0,
        giftCount: 0,
      },
    });

    res.status(201).json({
      success: true,
      data: liveStream,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// POST /api/artist/stop-stream
// Stop an active live stream
exports.stopLiveStream = async (req, res) => {
  try {
    const { streamId } = req.body;
    const artistId = req.user.id;

    if (!streamId) {
      return res.status(400).json({
        success: false,
        error: 'Stream ID is required',
      });
    }

    // Verify ownership
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream || stream.artistId !== artistId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const updatedStream = await prisma.liveStream.update({
      where: { id: streamId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: updatedStream,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// PUT /api/artist/music/{musicId}
// Edit music metadata
exports.editMusic = async (req, res) => {
  try {
    const { musicId } = req.params;
    const artistId = req.user.id;
    const { title, genre, description } = req.body;

    // Verify ownership - try song first
    let music = await prisma.song.findUnique({
      where: { id: musicId },
    });

    if (music && music.artistId !== artistId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (music) {
      const updated = await prisma.song.update({
        where: { id: musicId },
        data: { title, genre, ...(description && { description }) },
      });

      return res.json({
        success: true,
        data: updated,
      });
    }

    // Try video
    music = await prisma.video.findUnique({
      where: { id: musicId },
    });

    if (music && music.artistId !== artistId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (music) {
      const updated = await prisma.video.update({
        where: { id: musicId },
        data: { title, ...(description && { description }) },
      });

      return res.json({
        success: true,
        data: updated,
      });
    }

    // Try short
    music = await prisma.short.findUnique({
      where: { id: musicId },
    });

    if (music && music.artistId !== artistId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (music) {
      const updated = await prisma.short.update({
        where: { id: musicId },
        data: { title, ...(description && { description }) },
      });

      return res.json({
        success: true,
        data: updated,
      });
    }

    res.status(404).json({
      success: false,
      error: 'Music not found',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// DELETE /api/artist/music/{musicId}
// Delete music track
exports.deleteMusic = async (req, res) => {
  try {
    const { musicId } = req.params;
    const artistId = req.user.id;

    // Try song
    let music = await prisma.song.findUnique({
      where: { id: musicId },
    });

    if (music) {
      if (music.artistId !== artistId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      await prisma.song.delete({ where: { id: musicId } });

      return res.json({
        success: true,
        message: 'Music deleted successfully',
      });
    }

    // Try video
    music = await prisma.video.findUnique({
      where: { id: musicId },
    });

    if (music) {
      if (music.artistId !== artistId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      await prisma.video.delete({ where: { id: musicId } });

      return res.json({
        success: true,
        message: 'Video deleted successfully',
      });
    }

    // Try short
    music = await prisma.short.findUnique({
      where: { id: musicId },
    });

    if (music) {
      if (music.artistId !== artistId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      await prisma.short.delete({ where: { id: musicId } });

      return res.json({
        success: true,
        message: 'Short deleted successfully',
      });
    }

    res.status(404).json({
      success: false,
      error: 'Music not found',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/artist/music/{musicId}/stats
// Get detailed music statistics
exports.getMusicStats = async (req, res) => {
  try {
    const { musicId } = req.params;
    const artistId = req.user.id;

    // Try song
    let music = await prisma.song.findUnique({
      where: { id: musicId },
    });

    if (music) {
      if (music.artistId !== artistId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      return res.json({
        success: true,
        data: {
          type: 'song',
          ...music,
        },
      });
    }

    // Try video
    music = await prisma.video.findUnique({
      where: { id: musicId },
    });

    if (music) {
      if (music.artistId !== artistId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      return res.json({
        success: true,
        data: {
          type: 'video',
          ...music,
        },
      });
    }

    // Try short
    music = await prisma.short.findUnique({
      where: { id: musicId },
    });

    if (music) {
      if (music.artistId !== artistId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      return res.json({
        success: true,
        data: {
          type: 'short',
          ...music,
        },
      });
    }

    res.status(404).json({
      success: false,
      error: 'Music not found',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ============================================================================
// LEGACY EXPORTS (for backwards compatibility with existing routes)
// ============================================================================

exports.getArtistDashboard = exports.getArtistDashboard;
exports.renderDashboard = exports.getArtistDashboard;
exports.renderMyMusicPage = exports.getArtistMusic;
exports.renderRevenuePage = exports.getEarningsBreakdown;
exports.renderLiveInsightsPage = exports.getLiveInsights;
exports.renderShortsInsightsPage = exports.getShortsInsights;
exports.uploadMusic = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Use POST /api/tracks/upload instead',
  });
};
exports.uploadShort = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Use POST /api/artist/upload/shorts instead',
  });
};
exports.renderUploadAudioPage = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Use POST /api/tracks/upload instead',
  });
};
exports.renderUploadVideoPage = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Use POST /api/artist/upload/video instead',
  });
};
exports.renderUploadShortsPage = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Use POST /api/artist/upload/shorts instead',
  });
};
exports.handleUploadAudio = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Use POST /api/tracks/upload instead',
  });
};
exports.handleUploadVideo = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Use POST /api/artist/upload/video instead',
  });
};
exports.handleUploadShorts = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Use POST /api/artist/upload/shorts instead',
  });
};

