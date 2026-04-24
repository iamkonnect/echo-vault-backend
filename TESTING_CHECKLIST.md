# EchoVault Testing Checklist

## 🚀 Phase 1: Backend Startup (5 min)

### Prerequisites
- [ ] Docker installed and running
- [ ] Backend code at `C:\Users\infin\Desktop\echo-vault-backend`
- [ ] Flutter code at `C:\Users\infin\Downloads\echovault_working`

### Backend Startup
- [ ] Navigate to backend: `cd C:\Users\infin\Desktop\echo-vault-backend`
- [ ] Start services: `docker-compose up`
- [ ] Wait for logs: "EchoVault Server running on port 5000"
- [ ] PostgreSQL healthy: `docker-compose ps` (all green)

**Expected:** Backend running on `http://localhost:5000`

---

## 🔐 Phase 2: Authentication Testing (10 min)

### 2.1 Register New Artist (Postman)

1. Open Postman
2. Import collection: `EchoVault_API_Testing.postman_collection.json`
3. Go to `Authentication` → `Register Artist`
4. Click **Send**

**Expected Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx123...",
    "email": "artist@test.com",
    "name": "Test Artist",
    "role": "ARTIST",
    "walletBalance": 0
  }
}
```

- [ ] Status code: 201
- [ ] Token present in response
- [ ] User object contains correct fields
- [ ] walletBalance defaults to 0

### 2.2 Login (Postman)

1. Go to `Authentication` → `Login`
2. Body: Same email/password as registration
3. Click **Send**

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

- [ ] Status code: 200
- [ ] New token generated (may differ from registration token)
- [ ] User data returned

### 2.3 Copy JWT Token

1. Copy `token` value from last response
2. In Postman top menu, go to `Authorization` tab
3. Set Type: **Bearer Token**
4. Paste token in Token field
5. This applies to all subsequent requests

- [ ] Token copied successfully
- [ ] Bearer type selected
- [ ] Token visible in header

---

## 📊 Phase 3: Artist Endpoints Testing (15 min)

### 3.1 Get Artist Insights

**Route:** `GET /api/artist/insights`

1. Go to `Artist Endpoints` → `Get Artist Insights`
2. Verify Bearer token in Authorization
3. Click **Send**

**Expected Response (200):**
```json
{
  "totalPlays": 0,
  "totalEarnings": 0,
  "currentBalance": 0,
  "shorts": [],
  "recentTransactions": []
}
```

- [ ] Status code: 200
- [ ] Contains: `totalPlays` (number)
- [ ] Contains: `totalEarnings` (number)
- [ ] Contains: `currentBalance` (number)
- [ ] Contains: `shorts` (array)
- [ ] Contains: `recentTransactions` (array)

### 3.2 Get Artist Music Library

**Route:** `GET /api/artist/music`

1. Go to `Artist Endpoints` → `Get Artist Music Library`
2. Click **Send**

**Expected Response (200):**
```json
{
  "songs": [],
  "videos": [],
  "totalSongs": 0,
  "totalVideos": 0
}
```

- [ ] Status code: 200
- [ ] Contains: `songs` (array)
- [ ] Contains: `videos` (array)
- [ ] Contains: `totalSongs` (number)
- [ ] Contains: `totalVideos` (number)

### 3.3 Get Earnings Breakdown

**Route:** `GET /api/artist/earnings`

1. Go to `Artist Endpoints` → `Get Earnings Breakdown`
2. Click **Send**

**Expected Response (200):**
```json
{
  "shortEarnings": 0,
  "liveEarnings": 0,
  "totalEarnings": 0,
  "breakdown": {
    "shorts": { "amount": 0, "percentage": 0 },
    "live": { "amount": 0, "percentage": 0 }
  }
}
```

- [ ] Status code: 200
- [ ] Contains earnings breakdown
- [ ] Percentages calculated correctly

### 3.4 Get Withdrawal History

**Route:** `GET /api/artist/withdrawals`

1. Go to `Artist Endpoints` → `Get Withdrawal History`
2. Click **Send**

**Expected Response (200):**
```json
{
  "withdrawals": [],
  "totalWithdrawn": 0,
  "pendingWithdrawals": []
}
```

- [ ] Status code: 200
- [ ] Contains: `withdrawals` (array)
- [ ] Contains: `totalWithdrawn` (number)
- [ ] Contains: `pendingWithdrawals` (array)

### 3.5 Request Withdrawal

**Route:** `POST /api/artist/withdraw`

1. Go to `Artist Endpoints` → `Request Withdrawal`
2. Update Body: `{ "amount": 10.00 }`
3. Click **Send**

**Expected Response (201):**
```json
{
  "message": "Withdrawal request submitted",
  "transaction": {
    "id": "...",
    "userId": "...",
    "amount": 10,
    "type": "WITHDRAWAL",
    "status": "PENDING",
    "createdAt": "2024-..."
  }
}
```

- [ ] Status code: 201
- [ ] Transaction created with PENDING status
- [ ] Amount correct
- [ ] User ID matches

### 3.6 Error Testing: Insufficient Balance

1. Request withdrawal with amount: `{ "amount": 1000.00 }`
2. Click **Send**

**Expected Response (400):**
```json
{
  "message": "Insufficient balance"
}
```

- [ ] Status code: 400
- [ ] Correct error message

### 3.7 Error Testing: Invalid Token

1. Change Authorization token to garbage: `Bearer invalid_token_here`
2. Request any endpoint (e.g., insights)
3. Click **Send**

**Expected Response (401):**
```json
{
  "message": "Invalid or expired token"
}
```

- [ ] Status code: 401
- [ ] Correct error message

---

## 📱 Phase 4: Flutter App Testing (20 min)

### 4.1 Run Flutter App

```bash
cd C:\Users\infin\Downloads\echovault_working
flutter run
```

When prompted, select:
- **Android Emulator:** Press `a`
- **iOS Simulator:** Press `i`
- **Web:** Press `w`

- [ ] App starts without crashes
- [ ] Login screen appears
- [ ] No connection errors

### 4.2 Auth Screen - Register

1. Tap "Don't have an account? Register"
2. Fill form:
   - Name: `Flutter Test User`
   - Email: `flutter.test@example.com`
   - Password: `fluttertest123`
3. Tap **Register**

**Expected:**
- [ ] Loading indicator appears
- [ ] Navigate to artist dashboard (no login screen)
- [ ] No error snackbar

### 4.3 Auth Screen - Login & Logout

1. Tap logout button (top right)
2. Should return to login screen
3. Enter credentials from step 4.2
4. Tap **Login**

**Expected:**
- [ ] Logout successful
- [ ] Login screen appears
- [ ] Login succeeds and returns to dashboard

### 4.4 Dashboard - View Stats

After login, artist dashboard should show:

- [ ] Welcome message with user name
- [ ] User role displayed
- [ ] Four stat cards visible:
  - [ ] Total Plays (0 initially)
  - [ ] Total Earnings ($0.00)
  - [ ] Available Balance ($0.00)
  - [ ] Shorts Uploaded (0)
- [ ] All stats loaded with correct format

### 4.5 Dashboard - Request Withdrawal

1. Tap **Request Withdrawal** button
2. Enter amount: `5.00`
3. Tap **Request**

**Expected:**
- [ ] Dialog appears with available balance
- [ ] Can enter amount
- [ ] Success snackbar appears
- [ ] Dashboard refreshes

### 4.6 Token Persistence

1. Close Flutter app (don't logout)
2. Reopen Flutter app
3. App should show dashboard immediately

**Expected:**
- [ ] No login screen appears
- [ ] Dashboard loaded with token
- [ ] User still logged in

### 4.7 Clear Token & Test Login Again

1. Device Settings → Apps → EchoVault → Clear Data
2. Reopen app
3. Should show login screen

**Expected:**
- [ ] Login screen appears after clear data
- [ ] Can register/login again

---

## 🔄 Phase 5: Full Integration Test (10 min)

### 5.1 Postman → Flutter Sync

1. Register new artist via Postman
2. Use same email/password in Flutter app
3. Login in Flutter app
4. Check if stats match between both

- [ ] Flutter login successful with Postman credentials
- [ ] Stats loaded correctly
- [ ] Token validated from both sources

### 5.2 Withdrawal Verification

1. Request withdrawal via Flutter (amount: $25)
2. Check withdrawal status via Postman:
   - GET `/api/artist/withdrawals` with token
3. Verify transaction appears in list

- [ ] Withdrawal appears in Postman response
- [ ] Status is PENDING
- [ ] Amount matches ($25)
- [ ] Dashboard shows pending withdrawal

### 5.3 Error Handling

Test error scenarios in Flutter:

1. **Logout and try accessing protected endpoint**
   - Tap logout
   - Try to access insights
   - Expected: Redirect to login

2. **Invalid credentials**
   - On login screen, enter wrong password
   - Expected: Error snackbar

3. **Network error**
   - Stop Docker: `docker-compose down`
   - Try to login
   - Expected: Connection error message

- [ ] Logout prevents access to protected routes
- [ ] Invalid credentials show error
- [ ] Network errors handled gracefully

---

## ✅ Final Verification

### Backend Health Check
```bash
# Check all services running
docker-compose ps

# Check API responds
curl http://localhost:5000/api/auth/login -X POST
```

- [ ] PostgreSQL container running
- [ ] App container running
- [ ] API responds

### Database Check
```bash
# Connect to database
docker exec -it echo_vault_postgres psql -U postgres -d echo_vault_db

# List users
\dt user
SELECT * FROM "User";
```

- [ ] Users table created
- [ ] Test users in database
- [ ] Transactions recorded

### Summary Table

| Component | Test | Status |
|-----------|------|--------|
| Backend Startup | Docker up, API responds | ✅ |
| Registration | Postman register endpoint | ✅ |
| Login | Postman login endpoint | ✅ |
| Artist Insights | GET /api/artist/insights | ✅ |
| Artist Music | GET /api/artist/music | ✅ |
| Earnings | GET /api/artist/earnings | ✅ |
| Withdrawals | GET /api/artist/withdrawals | ✅ |
| Withdraw Request | POST /api/artist/withdraw | ✅ |
| Flutter Register | Register in app | ✅ |
| Flutter Login | Login in app | ✅ |
| Flutter Dashboard | View stats in app | ✅ |
| Flutter Withdrawal | Request withdrawal in app | ✅ |
| Token Persistence | Close/reopen app | ✅ |
| Error Handling | Invalid token/balance | ✅ |

---

## 📝 Notes

### Common Issues & Solutions

**Issue:** Docker container exits immediately
```bash
# Solution: Check logs
docker-compose logs app
```

**Issue:** Flutter can't connect to backend
```
- Android Emulator: Use http://10.0.2.2:5000
- iOS Simulator: Use http://localhost:5000
- Check: Backend is running (docker ps)
```

**Issue:** Token not saving
```
- Check shared_preferences in pubspec.yaml
- Run: flutter pub get
- Clear app cache: Settings → Apps → EchoVault → Clear Cache
```

**Issue:** CORS errors in Flutter
```
- Verify CORS in server.js includes your client origin
- Check Authorization header format: "Bearer TOKEN"
```

---

## 🎉 Success Criteria

All phases completed successfully when:
- ✅ Backend responds to all API calls
- ✅ JWT authentication works correctly
- ✅ All artist endpoints return expected data
- ✅ Flutter app can register and login
- ✅ Dashboard displays correct stats
- ✅ Withdrawal requests work end-to-end
- ✅ Token persistence works
- ✅ Error handling is graceful

**Status:** Ready for cloud deployment once all tests pass! 🚀
