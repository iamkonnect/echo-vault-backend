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

// POST /api/live/streams/start - Start a live stream (artist only)
router.post('/streams/start', async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    // Create live stream
    const stream = await prisma.liveStream.create({
      data: {
        artistId: userId,
        title,
        description: description || '',
        status: 'LIVE',
        startedAt: new Date(),
        viewerCount: 0,
        giftCount: 0,
      },
    });

    res.json({
      success: true,
      data: {
        id: stream.id,
        title: stream.title,
        status: stream.status,
        message: 'Live stream started',
      },
    });
  } catch (error) {
    console.error('Error starting stream:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start stream',
      error: error.message,
    });
  }
});

// POST /api/live/streams/stop - Stop a live stream (artist only)
router.post('/streams/stop', async (req, res) => {
  try {
    const { streamId } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!streamId) {
      return res.status(400).json({
        success: false,
        message: 'Stream ID is required',
      });
    }

    // Update stream status to ENDED
    const stream = await prisma.liveStream.update({
      where: { id: streamId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        id: stream.id,
        status: stream.status,
        message: 'Live stream ended',
      },
    });
  } catch (error) {
    console.error('Error stopping stream:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop stream',
      error: error.message,
    });
  }
});

// POST /api/live/streams/join-request - Join a stream (viewer)
router.post('/streams/join-request', async (req, res) => {
  try {
    const { streamId } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!streamId) {
      return res.status(400).json({
        success: false,
        message: 'Stream ID is required',
      });
    }

    // Verify stream exists
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
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
        streamId,
        joinedAt: new Date().toISOString(),
        message: 'Joined stream successfully',
      },
    });
  } catch (error) {
    console.error('Error joining stream:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join stream',
      error: error.message,
    });
  }
});

module.exports = router;
