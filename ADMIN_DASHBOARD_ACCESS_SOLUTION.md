# Admin Dashboard Access - Complete Solution Guide

## ✅ What Was Fixed

1. **Login Flow** - Updated `/api/auth/login-dashboard` to return JSON with redirect URL instead of trying to render HTML
2. **Frontend Handler** - Fixed `index.html` to properly handle JSON response and redirect
3. **Role Authorization** - Added validation to ensure only ADMIN/ARTIST roles can access dashboard
4. **Database Setup** - Created setup script to initialize admin user

---

## 🚀 Quick Start (Follow These Steps)

### Step 1: Start PostgreSQL Database

**Windows - Option A (Services):**
```bash
# Open Services (Win+R, type "services.msc")
# Find "PostgreSQL" service → Right-click → Start
```

**Windows - Option B (Command):**
```bash
net start postgresql-x64-15
# Replace x64-15 with your PostgreSQL version
```

**Verify it's running:**
```bash
netstat -ano | findstr :5433
# Should show PostgreSQL listening on port 5433
```

---

### Step 2: Setup Database and Admin User

```bash
cd C:\Users\infin\Desktop\echo-vault-backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Run setup script (creates admin user)
node setup.js
```

Expected output:
```
✅ Database connected
✅ Admin user created successfully!
   Email: akwera@gmail.com
   Role: ADMIN
```

---

### Step 3: Start the Server

```bash
cd C:\Users\infin\Desktop\echo-vault-backend
npm run dev
```

Expected output:
```
EchoVault Server running on port 5000
```

---

### Step 4: Access Dashboard

**In your browser:**
```
http://localhost:5000
```

**Login as Admin:**
- Email: `akwera@gmail.com`
- Password: `1234Abc!`

**Click:** "Access Admin Dashboard"

✅ Should redirect to `/api/admin/dashboard`

---

## 🔧 Troubleshooting

### Issue: "Can't reach database server at localhost:5433"

**Solution:**
```bash
# Check if PostgreSQL is running
net start postgresql-x64-15

# Or restart it
net stop postgresql-x64-15
net start postgresql-x64-15

# Verify connection
cd C:\Users\infin\Desktop\echo-vault-backend
node -e "require('./src/utils/prisma').$connect().then(() => console.log('Connected!')).catch(e => console.error('Failed:', e.message))"
```

---

### Issue: "Invalid credentials" on login

**Solution:**

1. **Check if admin user exists:**
```bash
cd C:\Users\infin\Desktop\echo-vault-backend
node setup.js
```

2. **Verify password hash:**
```bash
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('1234Abc!', 10).then(hash => {
  console.log('Hash for 1234Abc!:', hash);
});
"
```

3. **Check database directly:**
```bash
cd C:\Users\infin\Desktop\echo-vault-backend
node -e "
const prisma = require('./src/utils/prisma');
prisma.user.findUnique({where: {email: 'akwera@gmail.com'}})
  .then(u => console.log('User:', u ? 'Found - Role: ' + u.role : 'NOT FOUND'))
  .catch(e => console.error('Error:', e.message))
  .finally(() => process.exit());
"
```

---

### Issue: "Connection error. Is the backend running?"

**Solution:**

1. **Verify server is running:**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000
```

2. **Start server properly:**
```bash
cd C:\Users\infin\Desktop\echo-vault-backend
npm run dev
```

3. **Check for errors:**
```bash
# Look for error messages in terminal
# Common errors:
# - Port already in use → change PORT in .env
# - Database not connected → start PostgreSQL
# - Missing dependencies → run npm install
```

---

### Issue: Page shows error after login

**Solution:**

1. **Check browser console (F12)**
   - Network tab → Check login request response
   - Console tab → Look for JavaScript errors

2. **Check server logs**
   - Should show request and response codes
   - 401 = invalid credentials
   - 403 = role not authorized
   - 500 = server error

3. **Verify token is set:**
```bash
# Check if token cookie is created
# In browser F12 → Application → Cookies → http://localhost:5000
# Should see "token" cookie with long value
```

---

## 🔄 Manual Admin User Creation

If setup.js doesn't work:

```bash
cd C:\Users\infin\Desktop\echo-vault-backend

node -e "
const prisma = require('./src/utils/prisma');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const hash = await bcrypt.hash('1234Abc!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'akwera@gmail.com',
        password: hash,
        name: 'Admin User',
        username: 'admin',
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin created:', user.email, user.role);
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
"
```

---

## 📋 Files Modified

| File | Change |
|------|--------|
| `src/controllers/authController.js` | Fixed loginDashboard to return JSON with redirect URL |
| `public/index.html` | Updated login form to handle JSON response and redirect properly |
| `setup.js` (NEW) | Script to initialize database and create admin user |

---

## ✅ Verification Checklist

After following the steps above, verify:

- [ ] PostgreSQL running on port 5433
- [ ] Database migrations completed
- [ ] Admin user created (run `node setup.js`)
- [ ] Server running on port 5000 (`npm run dev`)
- [ ] Can access http://localhost:5000
- [ ] Login successful with akwera@gmail.com / 1234Abc!
- [ ] Redirected to /api/admin/dashboard
- [ ] Dashboard shows platform stats

---

## 📞 Still Having Issues?

Run this diagnostic:

```bash
cd C:\Users\infin\Desktop\echo-vault-backend

echo "=== DIAGNOSTIC CHECK ==="
echo "Checking database..."
node -e "
const env = require('dotenv');
env.config();
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'NOT SET');
"

echo "Checking server files..."
node -c server.js && echo "✅ server.js syntax OK"
node -c src/controllers/authController.js && echo "✅ authController.js syntax OK"
node -c adminRoutes.js && echo "✅ adminRoutes.js syntax OK"

echo "Checking database connection..."
node -e "
require('dotenv').config();
const prisma = require('./src/utils/prisma');
prisma.\$connect()
  .then(() => console.log('✅ Database connected'))
  .catch(e => console.log('❌ Database error:', e.message))
  .finally(() => process.exit());
"
```

---

## 🎯 Success Indicators

When everything is working:

1. ✅ Server starts without errors
2. ✅ Browser loads http://localhost:5000
3. ✅ Login button is clickable
4. ✅ Login request returns success (check F12 Network tab)
5. ✅ Page redirects to /api/admin/dashboard
6. ✅ Dashboard displays stats and users

---

## 🚀 Next Steps After Access

Once admin dashboard is accessible:

1. **Verify all admin features work:**
   - Gift Management → Create/Delete gifts
   - User Directory → View/Manage users
   - Artist Verification → Verify artists
   - Payouts → Approve/Reject payouts
   - Reports → Handle user reports

2. **Test with artist account:**
   - Login as artist@gmail.com / 1234Abc!
   - Upload music/videos
   - View revenue dashboard

3. **Monitor server logs:**
   - Check for any errors
   - Verify real-time features working

---

For detailed logs and debugging, check:
- Server console output (`npm run dev`)
- Browser F12 DevTools (Network, Console tabs)
- Database logs in PostgreSQL logs directory
