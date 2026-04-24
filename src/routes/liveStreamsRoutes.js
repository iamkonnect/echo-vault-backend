const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/live/streams - All live streams (active, scheduled, and ended)
router.get('/streams', async (req, res) => {
  try {
    const { status = 'LIVE', limit = 10, offset = 0 } = req.query;

    let whereCondition = {};
    if (status) {
      whereCondition.status = status.toUpperCase();
    }

    const liveStreams = await prisma.liveStream.findMany({
      where: whereCondition,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        _count: {
          select: { gifts: true },
        },
      },
    });

    // Format response to match Flutter UI expectations
    const formattedStreams = liveStreams.map((stream) => ({
      id: stream.id,
      title: stream.title,
      artist: stream.artist.name || stream.artist.username,
      artistId: stream.artist.id,
      artistAvatar: stream.artist.avatarUrl,
      isVerified: stream.artist.isVerified,
      status: stream.status,
      viewers: stream.viewerCount,
      giftCount: stream._count.gifts || stream.giftCount,
      thumbnail: stream.artist.avatarUrl || 'assets/default-avatar.jpeg',
      scheduledAt: stream.scheduledAt,
      startedAt: stream.startedAt,
      createdAt: stream.createdAt,
    }));

    res.json({
      success: true,
      data: formattedStreams,
      count: formattedStreams.length,
      status: status || 'ALL',
    });
  } catch (error) {
    console.error('Error fetching live streams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live streams',
      error: error.message,
    });
  }
});

// GET /api/live/streams/active - Only currently active (LIVE) streams
router.get('/streams/active', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const activeStreams = await prisma.liveStream.findMany({
      where: { status: 'LIVE' },
      take: parseInt(limit),
      orderBy: { startedAt: 'desc' },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        _count: {
          select: { gifts: true },
        },
      },
    });

    const formattedStreams = activeStreams.map((stream) => ({
      id: stream.id,
      title: stream.title,
      artist: stream.artist.name || stream.artist.username,
      artistId: stream.artist.id,
      thumbnail: stream.artist.avatarUrl || 'assets/default-avatar.jpeg',
      viewers: stream.viewerCount,
      giftCount: stream._count.gifts || stream.giftCount,
      isVerified: stream.artist.isVerified,
    }));

    res.json({
      success: true,
      data: formattedStreams,
      liveCount: formattedStreams.length,
    });
  } catch (error) {
    console.error('Error fetching active streams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active streams',
      error: error.message,
    });
  }
});

// GET /api/live/streams/:id - Get specific stream details
router.get('/streams/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const stream = await prisma.liveStream.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
            walletBalance: true,
          },
        },
        gifts: {
          include: {
            sender: {
              select: { id: true, username: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!stream) {
      return res.status(404).json({
        success: false,
        message: 'Stream not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: stream.id,
        title: stream.title,
        artist: stream.artist,
        status: stream.status,
        viewers: stream.viewerCount,
        totalGiftValue: stream.gifts.reduce((sum, g) => sum + g.amount, 0),
        gifts: stream.gifts.map((g) => ({
          id: g.id,
          amount: g.amount,
          sender: g.sender,
          createdAt: g.createdAt,
        })),
        scheduledAt: stream.scheduledAt,
        startedAt: stream.startedAt,
        endedAt: stream.endedAt,
        createdAt: stream.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching stream details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stream details',
      error: error.message,
    });
  }
});

module.exports = router;
