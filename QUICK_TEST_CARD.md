# ⚡ Quick Start - EchoVault Testing

## Start Backend
```powershell
cd C:/Users/infin/Desktop/echo-vault-backend
docker-compose up -d
docker exec echo-vault-backend-app-1 node seed.js
```

## Test URLs
- **Login Portal**: http://localhost:5000
- **Admin Dashboard**: Accessible after admin login
- **Artist Dashboard**: Accessible after artist login

## Test Credentials

| Role   | Email                 | Password |
|--------|----------------------|----------|
| Admin  | akwera@gmail.com      | 1234Abc! |
| Artist | artist@gmail.com      | 1234Abc! |

## What to Test

### 1. Login (40 seconds)
- [ ] Open http://localhost:5000
- [ ] See split-screen login form
- [ ] Admin login → Admin Dashboard appears ✅
- [ ] Logout → Back to login ✅
- [ ] Artist login → Artist Dashboard appears ✅

### 2. Admin Navigation (30 seconds)
After admin login, test sidebar:
- [ ] Click "User Directory" → Page loads, shows users ✅
- [ ] Click "Artist Verification" → Page loads, shows artists ✅
- [ ] Click "Add Admin" → Form appears ✅
- [ ] Check browser console → No errors ✅

### 3. Artist Dashboard (20 seconds)
After artist login:
- [ ] Sidebar appears ✅
- [ ] Stats display (plays, earnings, balance) ✅
- [ ] Shorts table populates ✅

### 4. Server Verification (10 seconds)
```powershell
docker logs echo-vault-backend-app-1 --tail 5
# Should show: "EchoVault Server running on port 5000"
```

## If Something Fails

### "Failed to Fetch" Error
1. Check browser console (F12)
2. Look for 401/402/403 status
3. Verify cookies exist: DevTools → Application → Cookies → token
4. Restart backend: `docker-compose restart`

### Sidebar Link Returns Blank
1. Check server logs for error details
2. Clear browser cache (Ctrl+Shift+Del)
3. Hard refresh (Ctrl+F5)

### Login Doesn't Work
1. Verify containers running: `docker ps`
2. Reseed data: `docker exec echo-vault-backend-app-1 node seed.js`
3. Check database: `docker logs echo_vault_postgres`

## Key Files

| File | Purpose |
|------|---------|
| `src/controllers/authController.js` | Login/token logic |
| `src/routes/adminRoutes.js` | Admin endpoints |
| `src/controllers/adminController.js` | Admin business logic |
| `admin-dashboard.ejs` | Admin UI |
| `artist-dashboard.ejs` | Artist UI |
| `public/index.html` | Login page |

## Expected Results After All Tests

- ✅ Login redirects to correct dashboard
- ✅ Sidebar links work without 401 errors
- ✅ User Directory shows all users
- ✅ Artist Verification shows unverified artists
- ✅ Artist Dashboard displays stats and shorts
- ✅ Logout clears token and returns to login
- ✅ Browser console is clean (no red errors)
- ✅ Server logs show 200 status codes

## Time Estimate
- **Total Testing**: 2-3 minutes
- **Quick Check**: 30 seconds
- **Full Verification**: 5 minutes

---

**Status**: Ready to Test ✅  
**Last Updated**: 04-08-2026  
**Confidence**: High (90%)
