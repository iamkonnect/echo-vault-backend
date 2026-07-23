/**
 * Super Admin Seed Script
 * Creates the main Super Admin: Akwera
 * Run: node seed-super-admin.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  try {
    console.log('🌱 Seeding Super Admin...');

    const email = 'akwera@echovaultz.com';
    const password = 'Deandre360xi!';
    const username = 'akwera';
    const name = 'Akwera';

    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log(`✅ Super Admin already exists: ${existing.email} (${existing.role})`);
      
      // Update password and role to ensure correctness
      const hashedPassword = await bcrypt.hash(password, 10);
      const updated = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isVerified: true,
          verifiedAt: new Date(),
          name: 'Akwera',
          username: 'akwera'
        }
      });
      console.log(`✅ Super Admin updated: ${updated.email} (${updated.role})`);
      return;
    }

    // Create new super admin
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username,
        role: 'ADMIN',
        isVerified: true,
        verifiedAt: new Date(),
        isOnline: false,
        walletBalance: 0
      }
    });

    console.log(`✅ Super Admin created successfully!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);

  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();

