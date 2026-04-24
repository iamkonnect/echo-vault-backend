const prisma = require('../utils/prisma');
const json2csv = require('json2csv').parse;
const js2xmlparser = require('js2xmlparser');

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereCondition = {};
    
    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = new Date(startDate);
      if (endDate) whereCondition.createdAt.lte = new Date(endDate);
    }

    // Get key metrics
    const totalTransactions = await prisma.transaction.count({ where: whereCondition });
    
    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        ...whereCondition,
        type: 'PLATFORM_FEE',
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    });

    const totalPayouts = await prisma.transaction.aggregate({
      where: {
        ...whereCondition,
        type: 'WITHDRAWAL',
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    });

    const totalStreams = await prisma.song.aggregate({
      _sum: { playCount: true }
    });

    const totalGifts = await prisma.gift.aggregate({
      where: whereCondition,
      _sum: { amount: true }
    });

    const topArtists = await prisma.user.findMany({
      where: { role: 'ARTIST' },
      select: {
        id: true,
        name: true,
        _count: { select: { songs: true, shorts: true, giftsReceived: true } }
      },
      orderBy: {
        giftsReceived: { _count: 'desc' }
      },
      take: 10
    });

    const topTracks = await prisma.song.findMany({
      orderBy: { playCount: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        playCount: true,
        artist: { select: { name: true } }
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalTransactions,
          totalRevenue: totalRevenue._sum.amount || 0,
          totalPayouts: totalPayouts._sum.amount || 0,
          totalStreams: totalStreams._sum.playCount || 0,
          totalGiftValue: totalGifts._sum.amount || 0,
        },
        topArtists,
        topTracks,
        dateRange: {
          startDate: startDate || 'N/A',
          endDate: endDate || 'N/A'
        }
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Export analytics as CSV
exports.exportAnalyticsCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereCondition = {};
    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = new Date(startDate);
      if (endDate) whereCondition.createdAt.lte = new Date(endDate);
    }

    // Get transactions for export
    const transactions = await prisma.transaction.findMany({
      where: whereCondition,
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format data for CSV
    const csvData = transactions.map(t => ({
      'Transaction ID': t.id,
      'User': t.user.name,
      'Email': t.user.email,
      'Type': t.type,
      'Amount': t.amount,
      'Status': t.status,
      'Description': t.description,
      'Date': t.createdAt.toISOString()
    }));

    const csv = json2csv(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics_' + new Date().getTime() + '.csv"');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CSV',
      error: error.message
    });
  }
};

// Export analytics as XML
exports.exportAnalyticsXML = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereCondition = {};
    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = new Date(startDate);
      if (endDate) whereCondition.createdAt.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where: whereCondition,
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const xmlData = {
      analytics: {
        exportDate: new Date().toISOString(),
        dateRange: {
          startDate: startDate || 'All',
          endDate: endDate || 'All'
        },
        transactions: transactions.map(t => ({
          transactionId: t.id,
          user: {
            name: t.user.name,
            email: t.user.email
          },
          type: t.type,
          amount: t.amount,
          status: t.status,
          description: t.description,
          date: t.createdAt.toISOString()
        }))
      }
    };

    const xml = js2xmlparser.parse('root', xmlData);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics_' + new Date().getTime() + '.xml"');
    res.send(xml);
  } catch (error) {
    console.error('XML export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export XML',
      error: error.message
    });
  }
};
