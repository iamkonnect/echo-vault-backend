const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { protect } = require('../middlewares/authMiddleware');

// GET /api/gifting - Get available gifts
router.get('/', async (req, res) => {
  try {
    const gifts = await prisma.giftTemplate.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        actualAmount: true,
        icon: true,
        isActive: true,
      },
      orderBy: { price: 'asc' },
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

// POST /api/gifting/send - Send a gift with revenue split
// context: 'standard' (listening to music) | 'live_artist' (artist live) | 'live_user_song' (user plays artist song during live) | 'short_artist' (artist-created short) | 'short_challenge' (user-created short challenge)
router.post('/send', protect, async (req, res) => {
  try {
    const { 
      receiverId, 
      amount, 
      quantity = 1, 
      giftId, 
      streamId, 
      shortId,
      context = 'standard',
      challengerId  // The frontend user who created the short challenge / played song during live
    } = req.body;
    const senderId = req.user.id;

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

    // ============ REVENUE SPLIT LOGIC ============
    // 
    // Revenue Split Rules:
    // 1. Artist-created shorts/live:         80% Artist, 20% Admin
    // 2. User song during live + gifts:      40% Artist, 20% Admin, 40% User (listener)
    // 3. Standard gifts (listening to music): 80% Artist, 20% Admin
    //

    let adminShare = 0;
    let artistShare = 0;
    let userShare = 0; // for the listener/challenger
    const totalAmount = parseFloat(amount) * parseInt(quantity || 1);

    if (context === 'live_user_song' || context === 'short_challenge') {
      // User plays artist song during live OR user-created short challenge
      // Split: 40% Artist, 20% Admin, 40% User (listener/challenger)
      adminShare = totalAmount * 0.20;
      artistShare = totalAmount * 0.40;
      userShare = totalAmount * 0.40;
    } else {
      // Standard gifting OR artist-created content (live/shorts)
      // Split: 80% Artist, 20% Admin
      adminShare = totalAmount * 0.20;
      artistShare = totalAmount * 0.80;
    }

    // ============ DATABASE OPERATIONS (Atomic Transaction) ============

    const operations = [];

    // 1. Deduct from sender's wallet
    operations.push(
      prisma.user.update({
        where: { id: senderId },
        data: { walletBalance: { decrement: totalAmount } }
      })
    );

    // 2. Credit artist (receiver)
    operations.push(
      prisma.user.update({
        where: { id: receiverId },
        data: { walletBalance: { increment: artistShare } }
      })
    );

    // 3. Credit challenger/listener if applicable
    if (userShare > 0 && challengerId) {
      operations.push(
        prisma.user.update({
          where: { id: challengerId },
          data: { walletBalance: { increment: userShare } }
        })
      );
    }

    // 4. Create gift record with split info
    operations.push(
      prisma.gift.create({
        data: {
          senderId,
          receiverId,
          liveStreamId: streamId || null,
          shortId: shortId || null,
          amount: totalAmount,
          adminPercentage: adminShare / totalAmount,
          artistPercentage: artistShare / totalAmount,
          userPercentage: userShare > 0 ? userShare / totalAmount : 0,
          createdAt: new Date(),
        },
      })
    );

    // 5. Update stream gift count if applicable
    if (streamId) {
      operations.push(
        prisma.liveStream.update({
          where: { id: streamId },
          data: { giftCount: { increment: parseInt(quantity) } },
        }).catch(() => {}) // Non-critical
      );
    }

    // 6. Update short gift count if applicable
    if (shortId) {
      operations.push(
        prisma.short.update({
          where: { id: shortId },
          data: { giftCount: { increment: parseInt(quantity) } },
        }).catch(() => {}) // Non-critical
      );
    }

    // Execute transaction
    await prisma.$transaction(operations);

    // ============ RESPONSE ============

    const splitBreakdown = {
      total: totalAmount,
      artistShare: parseFloat(artistShare.toFixed(2)),
      adminShare: parseFloat(adminShare.toFixed(2)),
      userShare: parseFloat(userShare.toFixed(2)),
    };

    // Log the transaction
    console.log(`💰 Gift: $${totalAmount} | Artist: $${artistShare.toFixed(2)} (${context}) | Admin: $${adminShare.toFixed(2)} | User: $${userShare.toFixed(2)}`);

    res.json({
      success: true,
      message: `Gift sent successfully! ${quantity}x gift worth $${totalAmount}`,
      data: {
        giftId: null, // Will be set from the create result
        split: splitBreakdown,
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

