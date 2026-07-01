const prisma = require('./src/utils/prisma');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createSuperAdmin() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set in environment');
    process.exit(1);
  }
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'akwera@echovaultz.com' }
    });

    if (existingUser) {
      console.log('Super admin user already exists');
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Deandre360xi!', 10);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email: 'akwera@echovaultz.com',
        password: hashedPassword,
        name: 'Super Admin',
        username: 'superadmin',
        role: 'ADMIN',
        isVerified: true,
        verifiedAt: new Date(),
        phone: null,
      }
    });

    console.log('✓ Super admin user created successfully');
    console.log('Email: akwera@echovaultz.com');
    console.log('Password: Deandre360xi!');
    console.log('Role: ADMIN');
    console.log('User ID:', superAdmin.id);
    console.log('\nYou can now login to both Admin and Artist dashboards with these credentials.');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createSuperAdmin();
