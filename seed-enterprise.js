#!/usr/bin/env node
/**
 * Professional Seed Script - Creates realistic enterprise-level revenue data
 * Run: npx prisma db push && node seed-enterprise.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding ENTERPRISE-LEVEL transaction data...\n');

    // Delete old transactions
    await prisma.transaction.deleteMany({});
    console.log('🗑️  Cleared old transactions\n');

    // Get all artists
    const artists = await prisma.user.findMany({
      where: { role: 'ARTIST' },
      select: { id: true, name: true }
    });

    if (artists.length === 0) {
      console.log('❌ No artists found. Run main seed first.');
      await prisma.$disconnect();
      return;
    }

    console.log(`📊 Creating enterprise revenue for ${artists.length} artists\n`);

    let totalTransactions = 0;
    let totalPlatformRevenue = 0;
    let totalWithdrawn = 0;

    // ============================================
    // SECTION 1: LARGE GIFT TRANSACTIONS (Platform Fees - 30% of revenue)
    // ============================================
    console.log('💝 Creating large gift transactions...');
    
    for (const artist of artists) {
      // Each artist gets 200-400 gift transactions
      const giftTransactionCount = Math.floor(Math.random() * 200) + 200;
      
      for (let i = 0; i < giftTransactionCount; i++) {
        // Realistic gift amounts with higher values
        const giftAmounts = [10, 25, 50, 100, 250, 500, 1000];
        const weights = [10, 15, 20, 25, 20, 8, 2]; // heavier weight on $50-100
        
        let random = Math.random() * weights.reduce((a, b) => a + b);
        let giftAmount = giftAmounts[0];
        for (let j = 0; j < weights.length; j++) {
          random -= weights[j];
          if (random <= 0) {
            giftAmount = giftAmounts[j];
            break;
          }
        }
        
        // Platform takes 10% fee on gifts
        const platformFee = giftAmount * 0.1;
        
        // Random dates in last 90 days
        const daysAgo = Math.floor(Math.random() * 90);
        const transactionDate = new Date();
        transactionDate.setDate(transactionDate.getDate() - daysAgo);
        
        await prisma.transaction.create({
          data: {
            userId: artists[Math.floor(Math.random() * artists.length)].id,
            amount: platformFee,
            type: 'PLATFORM_FEE',
            status: 'COMPLETED',
            description: `Gift revenue (${giftAmount} gift, 10% fee)`,
            createdAt: transactionDate,
            updatedAt: transactionDate
          }
        });
        
        totalPlatformRevenue += platformFee;
        totalTransactions++;
      }
    }
    const giftTransactionCount = Math.floor(Math.random() * 200) + 200;
    console.log(`✅ Created ${giftTransactionCount * artists.length} gift transactions\n`);

    // ============================================
    // SECTION 2: STREAMING REVENUE (High volume - 50% of revenue)
    // ============================================
    console.log('🎵 Creating massive streaming revenue...');
    
    const streamingTransactionCount = 1500; // 1500 transactions
    for (let i = 0; i < streamingTransactionCount; i++) {
      // Each streaming transaction: $50-500
      const streamingAmount = Math.floor(Math.random() * 450) + 50;
      
      const daysAgo = Math.floor(Math.random() * 90);
      const transactionDate = new Date();
      transactionDate.setDate(transactionDate.getDate() - daysAgo);
      
      await prisma.transaction.create({
        data: {
          userId: artists[Math.floor(Math.random() * artists.length)].id,
          amount: streamingAmount,
          type: 'PLATFORM_FEE',
          status: 'COMPLETED',
          description: `Streaming revenue from ${Math.floor(Math.random() * 100000) + 10000} plays`,
          createdAt: transactionDate,
          updatedAt: transactionDate
        }
      });
      
      totalPlatformRevenue += streamingAmount;
      totalTransactions++;
    }
    console.log(`✅ Created ${streamingTransactionCount} streaming transactions\n`);

    // ============================================
    // SECTION 3: VIDEO & SHORT REVENUE (20% of revenue)
    // ============================================
    console.log('🎬 Creating video & shorts revenue...');
    
    const videoTransactionCount = 800;
    for (let i = 0; i < videoTransactionCount; i++) {
      const videoAmount = Math.floor(Math.random() * 300) + 20;
      
      const daysAgo = Math.floor(Math.random() * 90);
      const transactionDate = new Date();
      transactionDate.setDate(transactionDate.getDate() - daysAgo);
      
      await prisma.transaction.create({
        data: {
          userId: artists[Math.floor(Math.random() * artists.length)].id,
          amount: videoAmount,
          type: 'PLATFORM_FEE',
          status: 'COMPLETED',
          description: `Video/Shorts revenue from views and engagement`,
          createdAt: transactionDate,
          updatedAt: transactionDate
        }
      });
      
      totalPlatformRevenue += videoAmount;
      totalTransactions++;
    }
    console.log(`✅ Created ${videoTransactionCount} video/shorts transactions\n`);

    // ============================================
    // SECTION 4: ARTIST WITHDRAWAL REQUESTS (Realistic)
    // ============================================
    console.log('💸 Creating artist withdrawal requests...');
    
    let withdrawalCount = 0;
    let pendingWithdrawalAmount = 0;
    
    for (const artist of artists) {
      // Each artist makes 5-15 withdrawal requests
      const artistWithdrawalCount = Math.floor(Math.random() * 10) + 5;
      
      for (let i = 0; i < artistWithdrawalCount; i++) {
        // Withdrawal amounts: $500-5000 (realistic for music artists)
        const withdrawalAmount = Math.floor(Math.random() * 4500) + 500;
        
        // 60% completed, 40% pending
        const isCompleted = Math.random() > 0.4;
        
        const daysAgo = Math.floor(Math.random() * 90);
        const transactionDate = new Date();
        transactionDate.setDate(transactionDate.getDate() - daysAgo);
        
        await prisma.transaction.create({
          data: {
            userId: artist.id,
            amount: withdrawalAmount,
            type: 'WITHDRAWAL',
            status: isCompleted ? 'COMPLETED' : 'PENDING',
            description: `Artist withdrawal request`,
            createdAt: transactionDate,
            updatedAt: transactionDate
          }
        });
        
        if (isCompleted) {
          totalWithdrawn += withdrawalAmount;
        } else {
          pendingWithdrawalAmount += withdrawalAmount;
        }
        
        withdrawalCount++;
      }
    }
    console.log(`✅ Created ${withdrawalCount} withdrawal requests\n`);

    // ============================================
    // GENERATE SUMMARY REPORT
    // ============================================
    const allTransactions = await prisma.transaction.count();
    
    const platformRevenueAgg = await prisma.transaction.aggregate({
      where: { type: 'PLATFORM_FEE', status: 'COMPLETED' },
      _sum: { amount: true }
    });
    const totalRevenue = platformRevenueAgg._sum.amount || 0;
    
    const completedWithdrawalsAgg = await prisma.transaction.aggregate({
      where: { type: 'WITHDRAWAL', status: 'COMPLETED' },
      _sum: { amount: true }
    });
    const totalCompletedWithdrawals = completedWithdrawalsAgg._sum.amount || 0;
    
    const pendingWithdrawalsAgg = await prisma.transaction.aggregate({
      where: { type: 'WITHDRAWAL', status: 'PENDING' },
      _sum: { amount: true }
    });
    const totalPendingWithdrawals = pendingWithdrawalsAgg._sum.amount || 0;
    
    const availableRevenue = totalRevenue - totalCompletedWithdrawals;

    console.log('\n' + '='.repeat(60));
    console.log('📊 ENTERPRISE REVENUE SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n💰 PLATFORM REVENUE (Collected from all sources):`);
    console.log(`   Total Collected: $${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    console.log(`\n💳 ARTIST PAYOUTS:`);
    console.log(`   Total Withdrawn: $${totalCompletedWithdrawals.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    console.log(`   Pending Payouts: $${totalPendingWithdrawals.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    console.log(`   Number of Pending: ${(await prisma.transaction.count({ where: { type: 'WITHDRAWAL', status: 'PENDING' } }))}`);
    console.log(`\n📈 PLATFORM NET PROFIT:`);
    console.log(`   Available Revenue: $${availableRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    console.log(`\n📊 TRANSACTION BREAKDOWN:`);
    console.log(`   Total Transactions: ${allTransactions.toLocaleString()}`);
    console.log(`   - Platform Fees: ${await prisma.transaction.count({ where: { type: 'PLATFORM_FEE' } }).then(c => c.toLocaleString())}`);
    console.log(`   - Artist Withdrawals: ${await prisma.transaction.count({ where: { type: 'WITHDRAWAL' } }).then(c => c.toLocaleString())}`);
    console.log('\n' + '='.repeat(60) + '\n');

    console.log('✨ Enterprise-level transaction seeding complete!\n');
    console.log('🎉 Your EchoVault platform now has realistic production data!\n');

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
