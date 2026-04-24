#!/usr/bin/env node

/**
 * Setup script for EchoVault Backend
 * Creates admin user and verifies database connectivity
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 EchoVault Backend Setup\n');

// Check .env file
console.log('1️⃣  Checking environment variables...');
if (!fs.existsSync('.env')) {
    console.error('❌ .env file not found!');
    process.exit(1);
}
console.log('✅ .env file found\n');

// Load environment
require('dotenv').config();

const requiredVars = ['JWT_SECRET', 'DATABASE_URL', 'PORT'];
const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

console.log('✅ All required environment variables set\n');

// Test database connection and create admin user
(async () => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const bcrypt = require('bcryptjs');
        
        const prisma = new PrismaClient();

        console.log('2️⃣  Connecting to database...');
        await prisma.$connect();
        console.log('✅ Database connected\n');

        console.log('3️⃣  Checking for admin user...');
        const admin = await prisma.user.findUnique({
            where: { email: 'akwera@gmail.com' }
        });

        if (admin) {
            console.log(`✅ Admin user exists: ${admin.email}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   Name: ${admin.name}\n`);
        } else {
            console.log('⚠️  Admin user not found, creating...\n');
            
            const hashedPassword = await bcrypt.hash('1234Abc!', 10);
            const newAdmin = await prisma.user.create({
                data: {
                    email: 'akwera@gmail.com',
                    password: hashedPassword,
                    name: 'Admin User',
                    username: 'admin',
                    role: 'ADMIN',
                    phone: null,
                    avatarUrl: null,
                    lastLoginIp: 'localhost',
                    lastLoginRegion: 'Local'
                }
            });

            console.log('✅ Admin user created successfully!');
            console.log(`   Email: ${newAdmin.email}`);
            console.log(`   Role: ${newAdmin.role}`);
            console.log(`   Default Password: 1234Abc!\n`);
        }

        // Check for artist user
        console.log('4️⃣  Checking for demo artist user...');
        const artist = await prisma.user.findUnique({
            where: { email: 'artist@gmail.com' }
        });

        if (artist) {
            console.log(`✅ Artist user exists: ${artist.email}`);
            console.log(`   Role: ${artist.role}\n`);
        } else {
            console.log('⚠️  Artist user not found, creating...\n');
            
            const hashedPassword = await bcrypt.hash('1234Abc!', 10);
            const newArtist = await prisma.user.create({
                data: {
                    email: 'artist@gmail.com',
                    password: hashedPassword,
                    name: 'Test Artist',
                    username: 'testartist',
                    role: 'ARTIST',
                    phone: null,
                    avatarUrl: null,
                    lastLoginIp: 'localhost',
                    lastLoginRegion: 'Local'
                }
            });

            console.log('✅ Artist user created successfully!');
            console.log(`   Email: ${newArtist.email}`);
            console.log(`   Role: ${newArtist.role}\n`);
        }

        // List all users
        const allUsers = await prisma.user.findMany({
            select: { email: true, role: true, name: true },
            orderBy: { createdAt: 'desc' }
        });

        console.log('5️⃣  All users in database:');
        allUsers.forEach(u => {
            const icon = u.role === 'ADMIN' ? '👑' : u.role === 'ARTIST' ? '🎤' : '👤';
            console.log(`   ${icon} ${u.email} (${u.role}) - ${u.name}`);
        });

        console.log('\n✅ Setup complete!\n');
        console.log('📋 Next steps:');
        console.log('   1. Start the server: npm run dev');
        console.log('   2. Open: http://localhost:5000');
        console.log('   3. Admin login: akwera@gmail.com / 1234Abc!');
        console.log('   4. Artist login: artist@gmail.com / 1234Abc!\n');

        await prisma.$disconnect();
    } catch (error) {
        console.error('\n❌ Setup failed!');
        console.error(`Error: ${error.message}`);
        
        if (error.message.includes('localhost:5433')) {
            console.error('\n⚠️  Database connection failed!');
            console.error('   Make sure PostgreSQL is running on localhost:5433');
            console.error('   Command: net start postgresql-x64-15');
        }
        
        process.exit(1);
    }
})();
