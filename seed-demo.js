/**
 * Script to seed demo data for testing /api/tracks/trending and /api/live/streams endpoints
 * Run with: node seed-demo.js
 */

const prisma = require('./src/utils/prisma');

async function seedDemoData() {
  try {
    console.log('🌱 Seeding demo data...');

    // Create demo artists
    const artist1 = await prisma.user.upsert({
      where: { email: 'demo-artist-1@echov.com' },
      update: {},
      create: {
        email: 'demo-artist-1@echov.com',
        password: 'hashed-password', // In real app, use bcrypt
        name: 'DJ Shadow',
        username: 'dj-shadow',
        role: 'ARTIST',
        isVerified: true,
        avatarUrl: 'https://via.placeholder.com/150?text=DJ+Shadow',
      },
    });

    const artist2 = await prisma.user.upsert({
      where: { email: 'demo-artist-2@echov.com' },
      update: {},
      create: {
        email: 'demo-artist-2@echov.com',
        password: 'hashed-password',
        name: 'Luna Beats',
        username: 'luna-beats',
        role: 'ARTIST',
        isVerified: true,
        avatarUrl: 'https://via.placeholder.com/150?text=Luna+Beats',
      },
    });

    const artist3 = await prisma.user.upsert({
      where: { email: 'demo-artist-3@echov.com' },
      update: {},
      create: {
        email: 'demo-artist-3@echov.com',
        password: 'hashed-password',
        name: 'Echo Master',
        username: 'echo-master',
        role: 'ARTIST',
        avatarUrl: 'https://via.placeholder.com/150?text=Echo+Master',
      },
    });

    console.log('✅ Created demo artists');

    // Create demo videos
    const videos = await Promise.all([
      prisma.video.upsert({
        where: { id: 'demo-video-1' },
        update: { playCount: 5421 },
        create: {
          id: 'demo-video-1',
          title: 'Electronic Vibes 2024',
          artistId: artist1.id,
          thumbnailUrl: 'https://via.placeholder.com/300x169?text=Electronic+Vibes',
          fileUrl: 'https://demo.com/video1.mp4',
          duration: 240,
          playCount: 5421,
        },
      }),
      prisma.video.upsert({
        where: { id: 'demo-video-2' },
        update: { playCount: 3892 },
        create: {
          id: 'demo-video-2',
          title: 'Late Night Session',
          artistId: artist2.id,
          thumbnailUrl: 'https://via.placeholder.com/300x169?text=Late+Night',
          fileUrl: 'https://demo.com/video2.mp4',
          duration: 180,
          playCount: 3892,
        },
      }),
      prisma.video.upsert({
        where: { id: 'demo-video-3' },
        update: { playCount: 2156 },
        create: {
          id: 'demo-video-3',
          title: 'Ambient Soundscape',
          artistId: artist3.id,
          thumbnailUrl: 'https://via.placeholder.com/300x169?text=Ambient',
          fileUrl: 'https://demo.com/video3.mp4',
          duration: 300,
          playCount: 2156,
        },
      }),
    ]);

    console.log('✅ Created demo videos');

    // Create demo shorts
    const shorts = await Promise.all([
      prisma.short.upsert({
        where: { id: 'demo-short-1' },
        update: { playCount: 8234, giftCount: 156 },
        create: {
          id: 'demo-short-1',
          title: 'Dance Challenge #1',
          artistId: artist1.id,
          videoUrl: 'https://demo.com/short1.mp4',
          thumbnailUrl: 'https://via.placeholder.com/300x169?text=Dance+Challenge',
          duration: 60,
          playCount: 8234,
          giftCount: 156,
        },
      }),
      prisma.short.upsert({
        where: { id: 'demo-short-2' },
        update: { playCount: 6789, giftCount: 98 },
        create: {
          id: 'demo-short-2',
          title: 'Beats Drop Reaction',
          artistId: artist2.id,
          videoUrl: 'https://demo.com/short2.mp4',
          thumbnailUrl: 'https://via.placeholder.com/300x169?text=Beat+Drop',
          duration: 45,
          playCount: 6789,
          giftCount: 98,
        },
      }),
      prisma.short.upsert({
        where: { id: 'demo-short-3' },
        update: { playCount: 4321, giftCount: 67 },
        create: {
          id: 'demo-short-3',
          title: 'Studio Tips & Tricks',
          artistId: artist3.id,
          videoUrl: 'https://demo.com/short3.mp4',
          thumbnailUrl: 'https://via.placeholder.com/300x169?text=Studio+Tips',
          duration: 55,
          playCount: 4321,
          giftCount: 67,
        },
      }),
    ]);

    console.log('✅ Created demo shorts');

    // Create demo live streams
    const liveStreams = await Promise.all([
      prisma.liveStream.upsert({
        where: { id: 'demo-live-1' },
        update: { status: 'LIVE', viewerCount: 1247, giftCount: 342 },
        create: {
          id: 'demo-live-1',
          title: 'DJ Set House Music',
          artistId: artist1.id,
          status: 'LIVE',
          startedAt: new Date(),
          viewerCount: 1247,
          giftCount: 342,
        },
      }),
      prisma.liveStream.upsert({
        where: { id: 'demo-live-2' },
        update: { status: 'LIVE', viewerCount: 892, giftCount: 215 },
        create: {
          id: 'demo-live-2',
          title: 'Ambient Production Workshop',
          artistId: artist2.id,
          status: 'LIVE',
          startedAt: new Date(),
          viewerCount: 892,
          giftCount: 215,
        },
      }),
      prisma.liveStream.upsert({
        where: { id: 'demo-live-3' },
        update: { status: 'SCHEDULED' },
        create: {
          id: 'demo-live-3',
          title: 'Tomorrow\'s Beat Drop Session',
          artistId: artist3.id,
          status: 'SCHEDULED',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          viewerCount: 0,
          giftCount: 0,
        },
      }),
    ]);

    console.log('✅ Created demo live streams');

    console.log('\n✨ Demo data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Artists: 3`);
    console.log(`   - Videos: ${videos.length}`);
    console.log(`   - Shorts: ${shorts.length}`);
    console.log(`   - Live Streams: ${liveStreams.length}`);
    console.log('\n🚀 Test endpoints:');
    console.log('   GET http://localhost:5000/api/tracks/trending');
    console.log('   GET http://localhost:5000/api/tracks/featured');
    console.log('   GET http://localhost:5000/api/live/streams?status=LIVE');
    console.log('   GET http://localhost:5000/api/live/streams/active');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedDemoData();
