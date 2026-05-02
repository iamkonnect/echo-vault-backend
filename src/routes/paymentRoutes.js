const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/payments/coin-packages - Get available coin packages
router.get('/coin-packages', async (req, res) => {
  try {
    const packages = [
      { id: '1', name: '50 Coins', coins: 50, price: 4.99, popular: false },
      { id: '5', name: '250 Coins', coins: 250, price: 19.99, popular: true },
      { id: '10', name: '600 Coins', coins: 600, price: 39.99, popular: false },
      { id: '20', name: '1500 Coins', coins: 1500, price: 79.99, popular: false },
    ];

    res.json({
      success: true,
      data: packages,
      count: packages.length,
    });
  } catch (error) {
    console.error('Error fetching coin packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coin packages',
      error: error.message,
    });
  }
});

// POST /api/payments/initiate - Initiate a payment
router.post('/initiate', async (req, res) => {
  try {
    const { packageId, amount } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!packageId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: packageId, amount',
      });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        packageId,
        amount,
        status: 'PENDING',
        createdAt: new Date(),
      },
    }).catch(() => null);

    // Return mock payment session
    res.json({
      success: true,
      data: {
        paymentId: payment?.id || `pay_${Date.now()}`,
        sessionId: `session_${Date.now()}`,
        amount,
        packageId,
        status: 'PENDING',
        message: 'Payment session created',
      },
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message,
    });
  }
});

// POST /api/payments/webhook - Payment webhook (Stripe, PayPal, etc.)
router.post('/webhook', async (req, res) => {
  try {
    const { paymentId, status, amount } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Update payment status
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    }).catch(() => null);

    if (payment && status === 'COMPLETED') {
      // Add coins to user
      const coinPackages = {
        '1': 50,
        '5': 250,
        '10': 600,
        '20': 1500,
      };

      const coins = coinPackages[payment.packageId] || 0;
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          coins: {
            increment: coins,
          },
        },
      }).catch(() => {});
    }

    res.json({
      success: true,
      data: {
        paymentId,
        status,
        message: 'Payment status updated',
      },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message,
    });
  }
});

module.exports = router;
