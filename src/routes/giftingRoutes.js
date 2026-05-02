const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/gifting - Get available gifts
router.get('/', async (req, res) => {
  try {
    const gifts = await prisma.giftTemplate.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        amount: true,
        icon: true,
        isActive: true,
      },
      orderBy: { amount: 'asc' },
    });

    res.json({
      success: true,
      data: gifts,
      count: gifts.length,
    });
  } catch (error) {
    console.error('Error fetching gifts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gifts',
      error: error.message,
    });
  }
});

// POST /api/gifting/send - Send a gift
router.post('/send', async (req, res) => {
  try {
    const { receiverId, amount, quantity = 1, giftId, streamId } = req.body;
    const senderId = req.user?.id; // From auth middleware

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!receiverId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: receiverId, amount',
      });
    }

    // Create gift record
    const gift = await prisma.gift.create({
      data: {
        senderId,
        receiverId,
        liveStreamId: streamId || null,
        amount,
        quantity,
        createdAt: new Date(),
      },
    });

    // Update receiver's wallet
    await prisma.user.update({
      where: { id: receiverId },
      data: {
        walletBalance: {
          increment: amount,
        },
      },
    });

    // Update stream gift count if applicable
    if (streamId) {
      await prisma.liveStream.update({
        where: { id: streamId },
        data: {
          giftCount: {
            increment: quantity,
          },
        },
      }).catch(() => {}); // Non-critical, don't fail if stream not found
    }

    res.json({
      success: true,
      data: {
        id: gift.id,
        message: `Gift sent successfully! ${quantity}x gift sent for $${amount}`,
      },
    });
  } catch (error) {
    console.error('Error sending gift:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send gift',
      error: error.message,
    });
  }
});

module.exports = router;
