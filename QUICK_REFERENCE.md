# 🚀 EchoVault Quick Reference Card

## Start Backend (30 seconds)
```bash
cd C:\Users\infin\Desktop\echo-vault-backend
docker-compose up
```
✅ Wait for: "EchoVault Server running on port 5000"

---

## Test with Postman (5 minutes)

1. **Import Collection:**
   - File → Import → `EchoVault_API_Testing.postman_collection.json`

2. **Register & Get Token:**
   ```
   POST /api/auth/register
   {
     "email": "artist@test.com",
     "password": "password123",
     "name": "Test Artist",
     "role": "ARTIST"
   }
   ```
   → Copy `token` value

3. **Set Bearer Token:**
   - Top menu → Authorization tab
   - Type: Bearer Token
   - Paste token

4. **Test Endpoints:**
   - `GET /api/artist/insights` → 200 ✅
   - `GET /api/artist/music` → 200 ✅
   - `GET /api/artist/earnings` → 200 ✅
   - `POST /api/artist/withdraw` → 201 ✅

---

## Run Flutter App (2 minutes)

```bash
cd C:\Users\infin\Downloads\echovault_working
flutter run
```

Select platform:
- Android: `a`
- iOS: `i`
- Web: `w`

---

## Test Authentication (5 minutes)

### Register Flow:
1. Tap "Don't have an account? Register"
2. Enter: name, email, password
3. Tap **Register**
4. Should show dashboard (token saved)

### Login Flow:
1. Tap logout
2. Enter same credentials
3. Tap **Login**
4. Should show dashboard

### Token Persistence:
1. Close app (don't logout)
2. Reopen app
3. Should still be logged in ✅

---

## Test Artist Dashboard (5 minutes)

### View Stats:
- [x] Total Plays (0 initially)
- [x] Total Earnings ($0.00)
- [x] Available Balance ($0.00)
- [x] Shorts (0)

### Request Withdrawal:
1. Tap "Request Withdrawal"
2. Enter amount: `5.00`
3. Tap "Request"
4. Success snackbar appears ✅

---

## API Endpoints Reference

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Artist (Protected - Requires JWT)
```
GET  /api/artist/insights
GET  /api/artist/music
GET  /api/artist/earnings
GET  /api/artist/withdrawals
POST /api/artist/withdraw
POST /api/artist/upload-music
POST /api/artist/upload-short
```

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## Common Test Data

### Artist Registration
```json
{
  "email": "artist@test.com",
  "password": "password123",
  "name": "Test Artist",
  "role": "ARTIST"
}
```

### Withdrawal Request
```json
{
  "amount": 50.00
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Docker won't start | `docker ps` → check Docker daemon |
| Backend connection error | `docker-compose logs app` |
| Flutter can't reach API | Android: `10.0.2.2:5000`, iOS: `localhost:5000` |
| Token not saving | `flutter clean`, then `flutter pub get` |
| CORS error | Check `server.js` origin list |
| Database error | `docker-compose restart db` |

---

## File Locations

### Backend
- Endpoints: `C:\Users\infin\Desktop\echo-vault-backend\src\controllers\artistController.js`
- Routes: `C:\Users\infin\Desktop\echo-vault-backend\src\routes\artistRoutes.js`
- Config: `C:\Users\infin\Desktop\echo-vault-backend\server.js`

### Flutter
- Auth: `C:\Users\infin\Downloads\echovault_working\lib\screens\auth_screen.dart`
- Dashboard: `C:\Users\infin\Downloads\echovault_working\lib\screens\artist_dashboard_screen.dart`
- Services: `C:\Users\infin\Downloads\echovault_working\lib\services\`
- Providers: `C:\Users\infin\Downloads\echovault_working\lib\providers\`

### Documentation
- Testing: `TESTING_GUIDE.md`
- Checklist: `TESTING_CHECKLIST.md`
- Integration: `INTEGRATION_GUIDE.md`
- Summary: `IMPLEMENTATION_SUMMARY.md`

---

## Database Credentials

```
Host: localhost
Port: 5432
User: postgres
Password: yourpassword
Database: echo_vault_db
```

**Connect:**
```bash
docker exec -it echo_vault_postgres psql -U postgres -d echo_vault_db
```

---

## Expected Test Results

| Test | Expected Result | Status |
|------|-----------------|--------|
| Register Artist | 201 + JWT token | ✅ |
| Login | 200 + JWT token | ✅ |
| Get Insights | 200 + stats | ✅ |
| Get Music | 200 + library | ✅ |
| Request Withdrawal | 201 + transaction | ✅ |
| Invalid Token | 401 Unauthorized | ✅ |
| Insufficient Balance | 400 Bad Request | ✅ |
| Flutter Register | Dashboard shown | ✅ |
| Flutter Login | Dashboard shown | ✅ |
| Token Persistence | Still logged in after reopen | ✅ |

---

## Useful Commands

### Docker
```bash
# Start services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Rebuild
docker-compose up --build
```

### Flutter
```bash
# Get dependencies
flutter pub get

# Build
flutter build apk  # Android
flutter build ios  # iOS

# Run on device
flutter run -d <device_id>
```

### cURL Commands
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass","name":"User","role":"ARTIST"}'

# Get Insights
curl -X GET http://localhost:5000/api/artist/insights \
  -H "Authorization: Bearer TOKEN_HERE"

# Request Withdrawal
curl -X POST http://localhost:5000/api/artist/withdraw \
  -H "Authorization: Bearer TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"amount":50}'
```

---

## Total Testing Time Estimate

| Phase | Time |
|-------|------|
| Backend startup | 2 min |
| Postman testing | 10 min |
| Flutter app setup | 3 min |
| Auth testing | 10 min |
| Dashboard testing | 10 min |
| Error handling | 10 min |
| Full integration | 10 min |
| **Total** | **~60 minutes** |

---

## Success Criteria

✅ All tests pass when:
- Backend responds to all API calls
- JWT authentication works
- Flutter app registers/logins successfully
- Dashboard displays correct stats
- Withdrawal requests work
- Token persists after app restart
- Error handling is graceful

---

## Next Steps After Testing

1. Document any issues found
2. Deploy backend to cloud (AWS/GCP/Azure)
3. Update Flutter base URL for production
4. Implement file upload for music
5. Add payment gateway
6. Deploy to app stores

---

**Status:** Ready to test! 🚀
**Last Updated:** 2024
**Version:** 1.0.0
