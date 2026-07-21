const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

// GET available coin packages
router.get('/coin-packages', async (req, res) => {
  try {
    const packages = [
      { 
        id: 1, 
        coins: 100, 
        price: 9.99, 
        bonus: 0,
        label: 'Starter Pack',
        description: '100 coins'
      },
      { 
        id: 2, 
        coins: 500, 
        price: 39.99, 
        bonus: 50,
        label: 'Popular Pack',
        description: '500 coins + 50 bonus'
      },
      { 
        id: 3, 
        coins: 1000, 
        price: 69.99, 
        bonus: 200,
        label: 'Premium Pack',
        description: '1000 coins + 200 bonus'
      },
      { 
        id: 4, 
        coins: 2500, 
        price: 149.99, 
        bonus: 500,
        label: 'Elite Pack',
        description: '2500 coins + 500 bonus'
      }
    ];
    
    res.json({ 
      success: true, 
      data: packages 
    });
  } catch (error) {
    console.error('Error fetching coin packages:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST initiate payment
router.post('/initiate', protect, async (req, res) => {
  try {
    const { packageId, paymentMethod } = req.body;
    
    if (!packageId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'packageId and paymentMethod are required'
      });
    }
    
    const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    res.json({ 
      success: true, 
      message: 'Payment initiated successfully',
      data: {
        transactionId,
        packageId,
        paymentMethod,
        status: 'pending',
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST payment webhook (for payment gateway callbacks)
router.post('/webhook', async (req, res) => {
  try {
    const { transactionId, status, amount } = req.body;
    
    // TODO: Implement payment verification and user balance update
    // This would typically verify the webhook signature first
    
    res.json({ 
      success: true, 
      message: 'Webhook received and processed',
      data: { transactionId, status }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
