const prisma = require('./src/utils/prisma');
const bcrypt = require('bcryptjs');

async function seedSuperAdmin() {
  try {
    console.log('Seeding Super Admin user...');

    // Check if super admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'akwera@echovaultz.com' }
    });

    if (existing) {
      console.log('✓ Super Admin already exists:', existing.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Akwera@123', 10);

    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: 'akwera@echovaultz.com',
        password: hashedPassword,
        name: 'Akwera',
        username: 'akwera',
        role: 'ADMIN',
        isVerified: true,
        verifiedAt: new Date(),
      }
    });

    console.log('✓ Super Admin created successfully!');
    console.log('Email: akwera@echovaultz.com');
    console.log('Password: Akwera@123');
    console.log('Role: ADMIN');

  } catch (error) {
    console.error('Error seeding Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();
