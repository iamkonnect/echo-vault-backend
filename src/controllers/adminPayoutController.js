const prisma = require('../utils/prisma');

// Approve payout request
exports.approvePayout = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, walletBalance: true } } }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending withdrawals can be approved' });
    }

    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date()
      },
      include: { user: { select: { name: true, email: true } } }
    });

    // Deduct from artist's wallet balance
    await prisma.user.update({
      where: { id: transaction.userId },
      data: {
        walletBalance: {
          decrement: transaction.amount
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `Payout of $${transaction.amount.toFixed(2)} approved for ${updatedTransaction.user.name}`,
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Error approving payout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve payout',
      error: error.message
    });
  }
};

// Reject payout request
exports.rejectPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending withdrawals can be rejected' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'REJECTED',
        description: `${transaction.description} - Rejected: ${reason || 'No reason provided'}`,
        updatedAt: new Date()
      },
      include: { user: { select: { name: true, email: true } } }
    });

    res.status(200).json({
      success: true,
      message: `Payout request for ${updatedTransaction.user.name} has been rejected`,
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Error rejecting payout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject payout',
      error: error.message
    });
  }
};

// Platform withdrawal (admin withdraws platform revenue to bank)
exports.platformWithdraw = async (req, res) => {
  try {
    const { amount, bankAccountId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    // Get admin user
    const adminUser = req.user;
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Only admins can withdraw platform funds' });
    }

    // Create platform withdrawal transaction
    const platformTransaction = await prisma.transaction.create({
      data: {
        userId: adminUser.id,
        amount: amount,
        type: 'PLATFORM_WITHDRAWAL',
        status: 'COMPLETED',
        description: `Platform revenue withdrawal to bank account ${bankAccountId || 'primary'}`
      }
    });

    res.status(201).json({
      success: true,
      message: `Platform withdrawal of $${amount.toFixed(2)} initiated successfully`,
      transaction: platformTransaction,
      bankAccount: bankAccountId || 'primary'
    });
  } catch (error) {
    console.error('Error with platform withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process platform withdrawal',
      error: error.message
    });
  }
};

// Get all pending withdrawals
exports.getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.transaction.findMany({
      where: {
        type: 'WITHDRAWAL',
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            walletBalance: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const summary = {
      totalCount: withdrawals.length,
      totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
      withdrawals
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching pending withdrawals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending withdrawals',
      error: error.message
    });
  }
};

// Get withdrawal history
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const withdrawals = await prisma.transaction.findMany({
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
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.transaction.count({
      where: { type: 'WITHDRAWAL' }
    });

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal history',
      error: error.message
    });
  }
};
