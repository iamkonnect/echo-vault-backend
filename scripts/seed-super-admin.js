/**
 * Super Admin Seed Script
 * Run: node scripts/seed-super-admin.js
 * Creates the main Super Admin: Akwera (akwera@echovaultz.com)
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  console.log('\n=== EchoVault Super Admin Seeder ===\n');

  const email = 'akwera@echovaultz.com';
  const password = 'Deandre360xi!';
  const name = 'Akwera';
  const username = 'akwera';

  try {
    // Check if super admin already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('✅ Super Admin already exists! Updating credentials...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.update({
        where: { email },
        data
