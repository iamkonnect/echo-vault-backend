# 🎵 EchoVault - Dashboard Access Guide

## ✅ API is Running & Ready

Your EchoVault backend is running on **http://localhost:5000** with full dashboard support!

---

## 🎯 How to Access the Dashboard

### **Option 1: Split-Screen Login Portal (Easiest)**

1. **Open your browser**
   ```
   http://localhost:5000/
   ```

2. **You'll see a split-screen login page:**
   - Left side: 🎤 Artist Portal
   - Right side: 🛡️ Admin Central

3. **Log in with:**

   **Admin Credentials:**
   ```
   Email: akwera@gmail.com
   Password: 1234Abc!
   ```

   **Artist Credentials (if available):**
   ```
   Email: artist@example.com
   Password: 1234Abc!
   ```

4. **Click the button** → Dashboard loads automatically ✅

---

## 🔍 What You'll See

### Admin Dashboard
- 📊 Dashboard statistics
- 👥 User management
- 🎤 Artist verification
- 💳 Payout management
- 📈 Analytics

### Artist Dashboard
- 🎵 Music library
- 📊 Insights & analytics
- 💰 Earnings breakdown
- 🎬 Upload center
- 💸 Withdrawal requests

---

## 🛠️ Behind the Scenes

### Login Flow
```
User clicks "Login" on http://localhost:5000/
   ↓
Sends credentials to POST /api/auth/login-dashboard
   ↓
Server validates credentials & generates JWT token
   ↓
Token saved in HTTP-only cookie
   ↓
Server renders dashboard HTML (admin-dashboard.html or artist-dashboard.html)
   ↓
Dashboard loads with user data from token ✅
```

### What Changed
- **Updated** `authController.js` → `loginDashboard` now renders HTML instead of JSON
- **Serves** appropriate dashboard based on user role (ADMIN or ARTIST)
- **Sets** HTTP-only cookie with JWT token
- **Pre-loads** user data in dashboard

---

## 🧪 Testing Different Endpoints

### API Endpoints (Return JSON)
These are for backend developers & mobile apps:
```bash
# Login via API (returns JWT token)
POST /api/auth/login
Body: {"email": "akwera@gmail.com", "password": "1234Abc!"}
Response: {"token": "eyJ...", "user": {...}}

# Logout
POST /api/auth/logout
Headers: {"Authorization": "Bearer eyJ..."}

# Refresh token
POST /api/auth/refresh
Body: {"token": "eyJ..."}
```

### Dashboard Routes (Return HTML)
These are for browser/UI:
```bash
# Login & redirect to dashboard (renders HTML)
POST /api/auth/login-dashboard
Body: {"email": "akwera@gmail.com", "password": "1234Abc!"}
Response: HTML dashboard page

# View split-screen login portal
GET /
Response: HTML login portal
```

---

## 🚀 Quick Access Links

| Page | URL |
|------|-----|
| **Split-Screen Login** | http://localhost:5000/ |
| **Admin Dashboard** (after login) | Loads automatically |
| **Artist Dashboard** (after login) | Loads automatically |

---

## 🔐 Credentials

### Pre-seeded Admin Account
```
Email: akwera@gmail.com
Password: 1234Abc!
Role: ADMIN
```

### Create New Artist Account
1. Go to http://localhost:5000/
2. Fill artist registration form (left side)
3. Set email & password
4. Login with those credentials

---

## 📱 For Postman API Testing

If you want to test the **API endpoints** (not the dashboard):

```bash
# Import Postman collection
postman/collections/EchoVault API/definition.yaml

# Use API login (returns JSON token)
POST /api/auth/login

# All other endpoints use the token from API login
```

---

## 🐛 Troubleshooting

### "Page Not Loading"
- Check server is running: `npm run dev`
- Verify port: http://localhost:5000

### "Invalid Credentials"
- Use: akwera@gmail.com / 1234Abc!
- Note: Passwords are case-sensitive

### "Dashboard Not Showing"
- Check browser console (F12) for errors
- Clear cookies & try again
- Verify dashboards exist: `public/admin-dashboard.html`

### "Token Not Saved"
- Check browser allows cookies
- Dashboard requires cookies for persistence

---

## 📊 What's Working

- ✅ User registration
- ✅ Admin/Artist login
- ✅ Dashboard rendering
- ✅ Token generation
- ✅ User session persistence
- ✅ Role-based dashboard selection
- ✅ Cookie-based authentication

---

## 🎯 Next Steps

1. **Access Dashboard Now:**
   ```
   http://localhost:5000/
   ```

2. **Login with:**
   ```
   Email: akwera@gmail.com
   Password: 1234Abc!
   ```

3. **Explore the Admin Dashboard**

4. **Or use Postman** for API testing with the collection

---

## 📚 Files Modified

- ✅ `src/controllers/authController.js` - Updated `loginDashboard` to render HTML
- ✅ `public/admin-dashboard.html` - Admin dashboard UI
- ✅ `public/artist-dashboard.html` - Artist dashboard UI
- ✅ `public/index.html` - Split-screen login portal

---

**Your dashboard is ready!** 🚀

Visit **http://localhost:5000/** now to access the login portal and see the dashboard in action!
