const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding default accounts...');

    // Hash passwords
    const artistPassword = await bcrypt.hash('1234Abc!', 10);
    const adminPassword = await bcrypt.hash('1234Abc!', 10);

    // Create or update Artist account
    const artist = await prisma.user.upsert({
      where: { email: 'artist@gmail.com' },
      update: {
        password: artistPassword,
        role: 'ARTIST',
        walletBalance: 500.00,
      },
      create: {
        email: 'artist@gmail.com',
        password: artistPassword,
        name: 'Test Artist',
        role: 'ARTIST',
        walletBalance: 500.00,
      },
    });
    console.log('✅ Artist account created/updated:', artist.email);

    // Create or update Admin account
    const admin = await prisma.user.upsert({
      where: { email: 'akwera@gmail.com' },
      update: {
        password: adminPassword,
        role: 'ADMIN',
        walletBalance: 0,
      },
      create: {
        email: 'akwera@gmail.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        walletBalance: 0,
      },
    });
    console.log('✅ Admin account created/updated:', admin.email);

    // Create a sample song for the artist
    const song = await prisma.song.create({
      data: {
        title: 'Sample Track',
        artistId: artist.id,
        fileUrl: '/uploads/sample.mp3',
        duration: 180,
        playCount: 150,
      },
    }).catch(() => {
      console.log('ℹ️  Sample song already exists');
      return null;
    });
    if (song) console.log('✅ Sample song created');

    // Create a sample short for the artist
    const short = await prisma.short.create({
      data: {
        title: 'Sample Short',
        artistId: artist.id,
        videoUrl: '/uploads/sample.mp4',
        duration: 30,
        playCount: 500,
        giftCount: 10,
      },
    }).catch(() => {
      console.log('ℹ️  Sample short already exists');
      return null;
    });
    if (short) console.log('✅ Sample short created');

    // Add sample transactions for payouts testing
    console.log('\n🌟 Adding sample transactions...');

    // Sample artist payout request (PENDING)
    await prisma.transaction.create({
      data: {
        userId: artist.id,
        amount: 250.00,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        description: 'Artist payout request'
      }
    }).catch(() => console.log('ℹ️ Sample payout already exists'));

    // Sample platform revenue (PLATFORM_FEE)
    await prisma.transaction.create({
      data: {
        userId: admin.id,
        amount: 3420.25,
        type: 'PLATFORM_FEE',
        status: 'COMPLETED',
        description: 'Gift revenue share (10%)'
      }
    }).catch(() => console.log('ℹ️ Sample platform fee already exists'));

    // Sample completed payout
    await prisma.transaction.create({
      data: {
        userId: artist.id,
        amount: 850.00,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        description: 'Approved payout - Bank transfer'
      }
    }).catch(() => console.log('ℹ️ Sample completed payout already exists'));

    console.log('\n✅ Seeding completed!');
    console.log('\n📋 Default Credentials:');
    console.log('   Artist Email: artist@gmail.com');
    console.log('   Artist Password: 1234Abc!');
    console.log('   Admin Email: akwera@gmail.com');
    console.log('   Admin Password: 1234Abc!');
    console.log('\n🧪 Test Payouts Flow:');
    console.log('   1. Login admin -> /api/admin/payouts');
    console.log('   2. Approve $250 pending payout');
    console.log('   3. Withdraw $1000+ to bank (revenue available $3420)');

  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

