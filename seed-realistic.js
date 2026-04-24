#!/usr/bin/env node
/**
 * Enhanced Seed Script - Creates realistic platform revenue data
 * Run: npm run prisma:migrate reset --force && node seed-realistic.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding realistic transaction data...\n');

    // Get all artists
    const artists = await prisma.user.findMany({
      where: { role: 'ARTIST' }
    });

    if (artists.length === 0) {
      console.log('No artists found. Run main seed first.');
      await prisma.$disconnect();
      return;
    }

    console.log(`Found ${artists.length} artists\n`);

    let transactionCount = 0;
    let totalRevenue = 0;

    // Create realistic gift transactions (platform fees from gifts sent to artists)
    console.log('💝 Creating gift transactions (platform fees)...');
    for (const artist of artists) {
      // Each artist gets 20-50 gift transactions
      const giftCount = Math.floor(Math.random() * 30) + 20;
      
      for (let i = 0; i < giftCount; i++) {
        const giftAmounts = [10, 25, 50, 100, 250, 500];
        const giftAmount = giftAmounts[Math.floor(Math.random() * giftAmounts.length)];
        
        // Platform fee is 10% of gift amount
        const platformFee = giftAmount * 0.1;
        
        await prisma.transaction.create({
          data: {
            userId: artists[Math.floor(Math.random() * artists.length)].id,
            amount: platformFee,
            type: 'PLATFORM_FEE',
            status: 'COMPLETED',
            description: `Gift platform fee - $${giftAmount} gift (10% fee)`
          }
        });
        
        totalRevenue += platformFee;
        transactionCount++;
      }
    }
    console.log(`✅ Created ${transactionCount} gift platform fee transactions\n`);

    // Create streaming revenue transactions
    console.log('🎵 Creating streaming revenue transactions...');
    let streamTransactions = 0;
    for (let i = 0; i < 100; i++) {
      const streamingRevenue = Math.floor(Math.random() * 50) + 10; // $10-60 per transaction
      
      await prisma.transaction.create({
        data: {
          userId: artists[Math.floor(Math.random() * artists.length)].id,
          amount: streamingRevenue,
          type: 'PLATFORM_FEE',
          status: 'COMPLETED',
          description: `Streaming revenue from ${Math.floor(Math.random() * 10000) + 1000} plays`
        }
      });
      
      totalRevenue += streamingRevenue;
      streamTransactions++;
    }
    console.log(`✅ Created ${streamTransactions} streaming transactions\n`);

    // Create artist withdrawal requests (PENDING and COMPLETED)
    console.log('💸 Creating artist withdrawal requests...');
    let withdrawalCount = 0;
    
    for (const artist of artists) {
      const withdrawalCount_thisArtist = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < withdrawalCount_thisArtist; i++) {
        const withdrawalAmount = Math.floor(Math.random() * 2000) + 100; // $100-2100
        const isCompleted = Math.random() > 0.3; // 70% completed, 30% pending
        
        await prisma.transaction.create({
          data: {
            userId: artist.id,
            amount: withdrawalAmount,
            type: 'WITHDRAWAL',
            status: isCompleted ? 'COMPLETED' : 'PENDING',
            description: `Artist withdrawal request`
          }
        });
        
        withdrawalCount++;
      }
    }
    console.log(`✅ Created ${withdrawalCount} withdrawal requests\n`);

    // Summary
    const allTransactions = await prisma.transaction.count();
    const totalPlatformRevenue = await prisma.transaction.aggregate({
      where: { type: 'PLATFORM_FEE', status: 'COMPLETED' },
      _sum: { amount: true }
    });
    
    const totalWithdrawn = await prisma.transaction.aggregate({
      where: { type: 'WITHDRAWAL', status: 'COMPLETED' },
      _sum: { amount: true }
    });
    
    const pendingWithdrawals = await prisma.transaction.aggregate({
      where: { type: 'WITHDRAWAL', status: 'PENDING' },
      _sum: { amount: true }
    });

    console.log('📊 Transaction Summary:');
    console.log(`  Total Revenue (collected): $${(totalPlatformRevenue._sum.amount || 0).toFixed(2)}`);
    console.log(`  Total Withdrawn: $${(totalWithdrawn._sum.amount || 0).toFixed(2)}`);
    console.log(`  Pending Withdrawals: $${(pendingWithdrawals._sum.amount || 0).toFixed(2)}`);
    console.log(`  Available Revenue: $${((totalPlatformRevenue._sum.amount || 0) - (totalWithdrawn._sum.amount || 0)).toFixed(2)}`);
    console.log(`  Total Transactions: ${allTransactions}\n`);

    console.log('✨ Realistic transaction seeding complete!\n');

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
