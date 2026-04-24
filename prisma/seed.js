const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const artists = [
  { name: 'The Weeknd', username: 'theweeknd', email: 'weeknd@example.com' },
  { name: 'Dua Lipa', username: 'dualipa', email: 'dua@example.com' },
  { name: 'Ariana Grande', username: 'arianagrande', email: 'ariana@example.com' },
  { name: 'Post Malone', username: 'postmalone', email: 'post@example.com' },
  { name: 'Taylor Swift', username: 'taylorswift', email: 'taylor@example.com' },
  { name: 'Billie Eilish', username: 'billieeilish', email: 'billie@example.com' },
  { name: 'The Chainsmokers', username: 'chainsmokers', email: 'chainsmokers@example.com' },
  { name: 'Coldplay', username: 'coldplay', email: 'coldplay@example.com' },
];

const songTitles = [
  'Blinding Lights', 'Don\'t Start Now', 'Physical', 'Watermelon Sugar',
  'Levitating', 'Peaches', 'Good as Hell', 'Drivers License', 'Kiss Me More',
  'Butter', 'Dynamite', 'Sunroof', 'Running Up That Hill', 'As It Was',
  'Take Me Home', 'Paradise', 'Fix You', 'Yellow', 'Clocks'
];

const shorts = [
  { title: 'Dance Challenge', duration: 15 },
  { title: 'Comedy Sketch', duration: 20 },
  { title: 'Lip Sync Battle', duration: 18 },
  { title: 'Fashion Tips', duration: 25 },
  { title: 'Studio Vlog', duration: 30 },
  { title: 'Behind the Scenes', duration: 22 },
  { title: 'Music Reaction', duration: 12 },
  { title: 'Performance Highlight', duration: 35 },
];

const streamTitles = [
  'Concert Live - NYC', 'Album Launch Party', 'Studio Session',
  'Fan Meet & Greet', 'Acoustic Performance', 'Q&A with Fans',
  'Live Jam Session', 'Performance Rehearsal'
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminExists = await prisma.user.findFirst({ where: { email: 'akwera@gmail.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('1234Abc!', 10);
      await prisma.user.create({
        data: {
          email: 'akwera@gmail.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          isVerified: true,
          verifiedAt: new Date(),
        }
      });
      console.log('✅ Admin user created: akwera@gmail.com\n');
    }

    // Create artist users
    console.log('🎤 Creating artist users...');
    const createdArtists = [];
    for (const artist of artists) {
      const existingArtist = await prisma.user.findFirst({ where: { email: artist.email } });
      if (!existingArtist) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const newArtist = await prisma.user.create({
          data: {
            email: artist.email,
            password: hashedPassword,
            name: artist.name,
            username: artist.username,
            role: 'ARTIST',
            isVerified: Math.random() > 0.3, // 70% verified
            verifiedAt: Math.random() > 0.3 ? new Date() : null,
            walletBalance: 0,
          }
        });
        createdArtists.push(newArtist);
        console.log(`  ✅ ${artist.name}`);
      } else {
        createdArtists.push(existingArtist);
      }
    }
    console.log();

    // Create songs
    console.log('🎵 Creating songs...');
    let songCount = 0;
    for (const artist of createdArtists) {
      const numSongs = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < numSongs; i++) {
        const title = songTitles[Math.floor(Math.random() * songTitles.length)];
        const existingSong = await prisma.song.findFirst({
          where: { artistId: artist.id, title }
        });
        if (!existingSong) {
          await prisma.song.create({
            data: {
              title: `${title} (${i + 1})`,
              artistId: artist.id,
              duration: Math.floor(Math.random() * 180) + 120,
              fileUrl: `/uploads/music/song_${Math.random().toString(36).substr(2, 9)}.mp3`,
              playCount: 0,
            }
          });
          songCount++;
        }
      }
    }
    console.log(`✅ Created ${songCount} songs\n`);

    // Create videos
    console.log('🎬 Creating videos...');
    let videoCount = 0;
    for (const artist of createdArtists) {
      const numVideos = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numVideos; i++) {
        const title = `Music Video ${i + 1}`;
        const existingVideo = await prisma.video.findFirst({
          where: { artistId: artist.id, title }
        });
        if (!existingVideo) {
          await prisma.video.create({
            data: {
              title: `${artist.name} - ${title}`,
              artistId: artist.id,
              duration: Math.floor(Math.random() * 300) + 180,
              fileUrl: `/uploads/video/video_${Math.random().toString(36).substr(2, 9)}.mp4`,
              playCount: 0,
            }
          });
          videoCount++;
        }
      }
    }
    console.log(`✅ Created ${videoCount} videos\n`);

    // Create shorts
    console.log('📹 Creating shorts...');
    let shortCount = 0;
    for (const artist of createdArtists) {
      const numShorts = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < numShorts; i++) {
        const short = shorts[Math.floor(Math.random() * shorts.length)];
        const existingShort = await prisma.short.findFirst({
          where: { artistId: artist.id, title: short.title }
        });
        if (!existingShort) {
          await prisma.short.create({
            data: {
              title: short.title,
              artistId: artist.id,
              duration: short.duration,
              videoUrl: `/uploads/shorts/short_${Math.random().toString(36).substr(2, 9)}.mp4`,
              playCount: 0,
              giftCount: 0,
            }
          });
          shortCount++;
        }
      }
    }
    console.log(`✅ Created ${shortCount} shorts\n`);

    // Create live streams
    console.log('📺 Creating live streams...');
    let streamCount = 0;
    const statuses = ['LIVE', 'ENDED', 'SCHEDULED'];
    for (const artist of createdArtists) {
      const numStreams = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numStreams; i++) {
        const title = streamTitles[Math.floor(Math.random() * streamTitles.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const existingStream = await prisma.liveStream.findFirst({
          where: { artistId: artist.id, title }
        });
        if (!existingStream) {
          const scheduledAt = new Date(Date.now() + Math.random() * 604800000);
          const startedAt = status === 'SCHEDULED' ? null : new Date(Date.now() - Math.random() * 86400000);
          const endedAt = status === 'LIVE' ? null : new Date(Date.now() - Math.random() * 3600000);

          await prisma.liveStream.create({
            data: {
              title: title,
              artistId: artist.id,
              status: status,
              scheduledAt,
              startedAt,
              endedAt,
              viewerCount: 0,
              giftCount: 0,
            }
          });
          streamCount++;
        }
      }
    }
    console.log(`✅ Created ${streamCount} live streams\n`);

    // Create gifts/transactions
    console.log('🎁 Creating gifts and transactions...');
    let giftCount = 0;
    for (const artist of createdArtists) {
      const numGifts = Math.floor(Math.random() * 20) + 5;
      for (let i = 0; i < numGifts; i++) {
        const amount = [10, 25, 50, 100, 250, 500][Math.floor(Math.random() * 6)];
        const randomArtist = createdArtists[Math.floor(Math.random() * createdArtists.length)];
        
        // Create gift transaction
        try {
          await prisma.gift.create({
            data: {
              amount,
              senderId: artist.id,
              receiverId: randomArtist.id,
              description: `Gift of $${amount}`,
            }
          });
          giftCount++;
        } catch (e) {
          // Silently skip if creation fails
        }
      }
    }
    console.log(`✅ Created ${giftCount} gifts\n`);

    // Create platform transactions
    console.log('💰 Creating platform transactions...');
    let transactionCount = 0;
    const transactionTypes = ['GIFT', 'PLATFORM_FEE', 'WITHDRAWAL'];
    const transactionStatuses = ['COMPLETED', 'PENDING', 'FAILED'];

    for (let i = 0; i < 30; i++) {
      const artist = createdArtists[Math.floor(Math.random() * createdArtists.length)];
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const status = transactionStatuses[Math.floor(Math.random() * transactionStatuses.length)];
      const amount = Math.floor(Math.random() * 500) + 10;

      try {
        await prisma.transaction.create({
          data: {
            userId: artist.id,
            amount,
            type,
            status,
            description: `${type.toLowerCase()} transaction - $${amount}`
          }
        });
        transactionCount++;
      } catch (e) {
        // Silently skip
      }
    }
    console.log(`✅ Created ${transactionCount} transactions\n`);

    console.log('✨ Database seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Admin user: 1`);
    console.log(`   - Artists: ${createdArtists.length}`);
    console.log(`   - Songs: ${songCount}`);
    console.log(`   - Videos: ${videoCount}`);
    console.log(`   - Shorts: ${shortCount}`);
    console.log(`   - Live Streams: ${streamCount}`);
    console.log(`   - Gifts: ${giftCount}`);
    console.log(`   - Transactions: ${transactionCount}\n`);

    console.log('🚀 Ready to go! Login with:');
    console.log('   Email: akwera@gmail.com');
    console.log('   Password: 1234Abc!\n');

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
