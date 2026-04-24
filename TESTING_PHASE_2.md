# EchoVault Backend - API Testing Guide

This guide provides step-by-step instructions to test the fixed backend endpoints.

## Quick Start

### 1. Verify Backend is Running
```bash
docker ps
# Both containers should show as running:
# - echo-vault-backend-app-1 (port 5000)
# - echo_vault_postgres (port 5432)
```

### 2. Ensure Test Data is Seeded
```bash
docker exec echo-vault-backend-app-1 node seed.js
```

Expected output:
```
✅ Artist account created/updated: artist@gmail.com
✅ Admin account created/updated: akwera@gmail.com
✅ Seeding completed!
```

### 3. Open Browser and Test Login
**URL**: `http://localhost:5000`

**Admin Login**:
- Email: `akwera@gmail.com`
- Password: `1234Abc!`

**Artist Login**:
- Email: `artist@gmail.com`
- Password: `1234Abc!`

## Detailed Testing Checklist

### Phase 1: Authentication
- [ ] Page loads at `http://localhost:5000`
- [ ] Admin login form is visible (right side)
- [ ] Artist login form is visible (left side)
- [ ] Both forms pre-populated with test credentials
- [ ] Admin login redirects to admin dashboard
- [ ] Artist login redirects to artist dashboard
- [ ] Browser console shows no errors
- [ ] Server logs show POST 200 for login

### Phase 2: Admin Dashboard
After admin login:
- [ ] Admin dashboard page renders
- [ ] Sidebar is visible with all menu items
- [ ] Stats cards display (users, artists, reports, payouts)
- [ ] No console errors
- [ ] No "Failed to Fetch" messages

### Phase 3: Admin Sidebar Navigation
Click each link and verify page loads:

1. **Dashboard** (already on page)
   - [ ] Stats refresh correctly
   - [ ] Recent withdrawals display

2. **User Directory** (left click)
   - [ ] User table loads without errors
   - [ ] Shows all users in database
   - [ ] Columns: Name, Email, Role, Online Status, Last Login
   - [ ] No 401 or fetch errors

3. **Artist Verification** (left click)
   - [ ] Artist verification queue loads
   - [ ] Shows unverified artists
   - [ ] Verify/Reject buttons visible
   - [ ] Click verify button → Success message
   - [ ] Artist marked as verified

4. **Add Admin** (left click)
   - [ ] Admin creation form appears
   - [ ] Can submit new admin
   - [ ] Redirects back to User Directory

5. **Logout** (button at bottom)
   - [ ] Clears token cookie
   - [ ] Redirects to login page
   - [ ] Can login again

### Phase 4: Artist Dashboard
After artist login:
- [ ] Artist dashboard page renders
- [ ] Sidebar with menu items visible
- [ ] Stats display:
  - Total Plays (from seeded data)
  - Total Earnings (from gifts)
  - Available Balance (wallet)
- [ ] Shorts Performance table populated
- [ ] Logout button works

### Phase 5: API Endpoints (via curl)

#### Test Admin Login
```powershell
$body = @{
    email = "akwera@gmail.com"
    password = "1234Abc!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login-dashboard" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body `
  -UseBasicParsing
```

Expected:
- Status Code: 200
- Response: HTML (admin-dashboard rendered)
- Set-Cookie header present

#### Test Artist Login
```powershell
$body = @{
    email = "artist@gmail.com"
    password = "1234Abc!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login-dashboard" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body `
  -UseBasicParsing
```

Expected:
- Status Code: 200
- Response: HTML (artist-dashboard rendered)
- Set-Cookie header present

#### Test Get Users (requires token)
Get token from login response, then:
```powershell
# Note: This requires the token from login. The token is set as httpOnly cookie
# so it's automatically sent by the browser. Direct curl would need Bearer token.
```

In browser console after login:
```javascript
// Make authenticated request
fetch('/api/admin/users')
  .then(r => r.text())
  .then(html => console.log('User directory HTML loaded, length:', html.length))
  .catch(e => console.error('Error:', e))
```

Expected: User directory HTML should load without 401 error

#### Test Get Unverified Artists
```javascript
fetch('/api/admin/artist-verification')
  .then(r => r.text())
  .then(html => console.log('Artist verification HTML loaded, length:', html.length))
  .catch(e => console.error('Error:', e))
```

Expected: Artist verification page HTML loads

#### Test Verify Artist (in browser console after login)
```javascript
// Replace ARTIST_ID with actual ID from the page
fetch('/api/admin/artist/{ARTIST_ID}/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => console.log('Verify response:', data))
.catch(e => console.error('Error:', e))
```

## Server Logs Inspection

### View Real-Time Logs
```bash
docker logs -f echo-vault-backend-app-1
```

### Look For These Log Patterns

✅ **Success Patterns**:
```
POST /api/auth/login-dashboard 200 XXXms
GET /api/admin/users 200 XXXms
GET /api/admin/artist-verification 200 XXXms
```

❌ **Error Patterns** (should NOT see these):
```
POST /api/auth/login-dashboard 401 XXXms     # Token not set
GET /api/admin/users 302 XXXms              # Redirect (no token)
GET /api/admin/users 401 XXXms              # Not authenticated
```

## Troubleshooting

### Problem: "Failed to Fetch" after login
**Solution**: 
1. Check browser cookies: DevTools → Application → Cookies → token should exist
2. Check server logs for 401 responses
3. Restart containers: `docker-compose restart`

### Problem: User Directory shows "404" or blank
**Solution**:
1. Verify route exists: `GET /api/admin/users` (not `/api/admin/users/`)
2. Check token is being sent (check in DevTools Network tab)
3. Ensure middleware is protecting the route

### Problem: Artist Verification link gives 404
**Solution**:
1. Check admin-dashboard.ejs line for correct href: `/api/admin/artist-verification`
2. Verify route in adminRoutes.js exists
3. Rebuild Docker: `docker-compose up -d --build`

## Expected Database State After Seeding

```sql
-- Users table should contain:
SELECT email, role, isVerified FROM users;

-- Should show:
akwera@gmail.com  | ADMIN  | false
artist@gmail.com  | ARTIST | false

-- Songs table:
SELECT title, artistId FROM songs;

-- Should show at least 1 sample song for the artist

-- Shorts table:
SELECT title, artistId FROM shorts;

-- Should show at least 1 sample short for the artist
```

## Performance Notes

- First load after login: ~150ms (renders dashboard)
- Sidebar navigation clicks: ~50-100ms (page already loaded)
- Network requests: Should see <200ms response times

## Browser DevTools Checklist

Open DevTools (F12) while testing:

**Console Tab**:
- [ ] No red errors
- [ ] No 401/403 messages
- [ ] Network errors shown as yellow warnings only

**Network Tab**:
- [ ] `login-dashboard` → 200, Response Type: document
- [ ] `/users` → 200, Response Type: document
- [ ] `/artist-verification` → 200, Response Type: document
- [ ] Cookie `token` sent with all requests

**Application Tab**:
- [ ] Cookies: `token` exists
- [ ] Token value is not empty
- [ ] Token expires in 7 days

## Next Steps After Verification

1. ✅ Test web dashboard (this checklist)
2. ⏭️ Test Flutter app: `flutter run`
3. ⏭️ Test `/api/artist/insights` endpoint
4. ⏭️ Test music upload endpoints
5. ⏭️ Test withdrawal request flow

---

**Last Updated**: 04-08-2026
**Status**: Ready for Testing Phase
