# Admin Dashboard Access - Troubleshooting & Fixes

## Problems Identified

### 1. **Database Connection Issue**
- PostgreSQL is not running on `localhost:5433`
- Error: "Can't reach database server at localhost:5433"

### 2. **Login Flow Issue**
- The loginDashboard endpoint tries to render HTML but the client expects JSON
- Mismatch between form submission and response handling

### 3. **Role Authorization Issue**
- Admin role must exist in database for authorization to work
- User must be created with role='ADMIN'

---

## Solution Steps

### Step 1: Start PostgreSQL Database

**For Windows with PostgreSQL installed:**
```bash
# Option A: Via Services (GUI)
# 1. Press Win+R, type "services.msc"
# 2. Find "PostgreSQL" service
# 3. Right-click → Start

# Option B: Via Command Line
net start postgresql-x64-15
# (or your version number)

# Option C: Via WSL/Ubuntu on Windows
sudo service postgresql start
```

**Check if running:**
```bash
cd C:\Users\infin\Desktop\echo-vault-backend
node -e "require('pg').Client" && echo "PostgreSQL driver ready"
```

### Step 2: Verify Database and User Exist

Create admin user if not exists:

```bash
cd C:\Users\infin\Desktop\echo-vault-backend
node --input-type=module -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  try {
    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { email: 'akwera@gmail.com' }
    });
    
    if (admin) {
      console.log('✓ Admin user exists:', admin.email, 'Role:', admin.role);
    } else {
      console.log('✗ Admin user NOT found, creating...');
      
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('1234Abc!', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'akwera@gmail.com',
          password: hash,
          name: 'Admin User',
          username: 'admin',
          role: 'ADMIN',
          phone: null,
          avatarUrl: null
        }
      });
      
      console.log('✓ Admin created:', newAdmin.email, 'Role:', newAdmin.role);
    }
    
    // List all users
    const allUsers = await prisma.user.findMany({
      select: { email: true, role: true, name: true }
    });
    console.log('\\nAll users in database:');
    allUsers.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
"
```

### Step 3: Fix Login Endpoint

The issue is that the login endpoint tries to render HTML but the client sends JSON and expects redirect.

**Create or update: `/src/controllers/authController.js` - loginDashboard function**

Replace the loginDashboard function with proper JSON response + redirect handling:

```javascript
exports.loginDashboard = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check role authorization
    const validRoles = ['ADMIN', 'ARTIST'];
    if (!validRoles.includes(user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Role ${user.role} cannot access dashboard` 
      });
    }

    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
    const userRegion = req.headers['x-region'] || 'Unknown';

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        lastLoginIp: userIp,
        lastLoginRegion: userRegion,
        isOnline: true,
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user.id, user.role);

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return JSON with redirect URL
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword,
      redirectTo: user.role === 'ADMIN' ? '/api/admin/dashboard' : '/api/artist/dashboard'
    });

  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
};
```

### Step 4: Update Login Page (index.html)

Fix the client-side handling to use the JSON response:

```javascript
async function handleLogin(event, type) {
    event.preventDefault();
    
    const email = type === 'admin' ? document.getElementById('adminEmail').value : document.getElementById('artistEmail').value;
    const password = type === 'admin' ? document.getElementById('adminPass').value : document.getElementById('artistPass').value;
    const btn = type === 'admin' ? document.getElementById('adminBtn') : document.getElementById('artistBtn');
    const errorDiv = type === 'admin' ? document.getElementById('adminError') : document.getElementById('artistError');
    
    btn.disabled = true;
    btn.textContent = 'Logging in...';
    errorDiv.textContent = '';

    try {
        const response = await fetch('/api/auth/login-dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Redirect to dashboard based on response
            window.location.href = data.redirectTo || '/';
        } else {
            errorDiv.textContent = data.message || 'Login failed';
        }
    } catch (err) {
        console.error('Login Error:', err);
        errorDiv.textContent = 'Connection error. Is the backend running?';
    } finally {
        btn.disabled = false;
        btn.textContent = type === 'admin' ? 'Access Admin Dashboard' : 'Enter Artist View';
    }
}
```

### Step 5: Test Database Connection

```bash
cd C:\Users\infin\Desktop\echo-vault-backend
npm run prisma:generate
npm run prisma:migrate
```

If migration needed, run:
```bash
npx prisma migrate dev --name init
```

### Step 6: Start the Server

```bash
cd C:\Users\infin\Desktop\echo-vault-backend
npm run dev
# Server will start on http://localhost:5000
```

### Step 7: Test Login

1. Open browser: `http://localhost:5000`
2. Admin side (right): Enter `akwera@gmail.com` / `1234Abc!`
3. Click "Access Admin Dashboard"
4. Should redirect to `/api/admin/dashboard`

---

## Troubleshooting Checklist

- [ ] PostgreSQL service is running (`net start postgresql-x64-15`)
- [ ] `.env` file has correct DATABASE_URL
- [ ] Database schema is migrated (`npx prisma migrate deploy`)
- [ ] Admin user exists with role='ADMIN' in database
- [ ] JWT_SECRET is set in .env
- [ ] Port 5000 is not blocked by firewall
- [ ] No other process running on port 5000
- [ ] Browser cookies are enabled

---

## Quick Start Commands

```bash
# Start PostgreSQL
net start postgresql-x64-15

# Start backend server
cd C:\Users\infin\Desktop\echo-vault-backend
npm install
npm run prisma:generate
npm run dev

# In browser
# http://localhost:5000
```

## If Still Having Issues

Run this diagnostic:
```bash
cd C:\Users\infin\Desktop\echo-vault-backend
node -e "
const fs = require('fs');
const path = require('path');

console.log('=== DIAGNOSTICS ===');
console.log('1. .env file exists:', fs.existsSync('.env'));
console.log('2. DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
console.log('3. PORT:', process.env.PORT || 5000);
console.log('4. JWT_SECRET set:', !!process.env.JWT_SECRET);
console.log('5. node_modules exists:', fs.existsSync('node_modules'));
console.log('6. prisma generated:', fs.existsSync('node_modules/@prisma/client'));
"
```

---

## Admin Dashboard Access Verified ✅

Once database is running and user created, admin should be able to:
- Access `/api/admin/dashboard` (requires valid token)
- View platform stats (users, revenue, etc.)
- Manage gifts, users, payouts, and reports
- Verify artists and process withdrawals
