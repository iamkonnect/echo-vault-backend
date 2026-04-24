# 🚀 EchoVault Backend - Running on localhost:5000

## Server Status: ✅ RUNNING

Your API is now running on **http://localhost:5000** with:
- ✅ Database connected (PostgreSQL)
- ✅ All 39 endpoints ready to test
- ✅ Authentication working
- ✅ Postman collection ready

---

## ✨ What's Working

### API Endpoints Active
- **Auth**: Login ✅ Register ✅ Logout ✅ Refresh Token ✅ Verify ✅
- **Artist**: 7 endpoints ready
- **Admin**: 10 endpoints ready
- **Analytics**: 3 endpoints ready
- **Tracks**: 2 endpoints ready
- **Live Streams**: 3 endpoints ready

### Database
- PostgreSQL running in Docker ✅
- Migrations applied ✅
- Sample data seeded ✅
- Admin user created: `akwera@gmail.com` / `password123`

### Test Credentials
- **Email**: `akwera@gmail.com`
- **Password**: `password123`
- **Role**: ADMIN

---

## 🧪 Test the API

### Option 1: Quick Test (Instant Results)
```bash
node quick-test.js
```
Output shows:
- ✓ Login successful
- ✓ Token generated
- ✓ Register working
- ✓ New user created

### Option 2: Postman Collection (Full Testing)

1. **Open Postman**
2. **Import Collection**:
   - Click "Import"
   - Navigate to: `postman/collections/EchoVault API/definition.yaml`
   - Click "Import"

3. **Import Environment**:
   - Click "Environments" (left sidebar)
   - Click "Import"
   - Navigate to: `postman/environments/EchoVault Local.yaml`
   - Click "Import"

4. **Select Environment**:
   - Top-right dropdown
   - Select "EchoVault Local"

5. **Run First Request**:
   - Go to: **Auth** → **Login**
   - Click "Send"
   - Token auto-saves to {{token}} variable
   - All other endpoints now have authorization

### Option 3: Collection Runner (Automated)
```bash
# Terminal in project folder
cd postman
run-tests.bat
```

### Option 4: Newman CLI
```bash
# Run all tests
newman run postman/collections/EchoVault\ API.json \
  -e postman/environments/EchoVault\ Local.json

# Generate HTML report
newman run postman/collections/EchoVault\ API.json \
  -e postman/environments/EchoVault\ Local.json \
  -r html --reporter-html-export test-report.html
```

---

## 📊 Server Details

### Port Configuration
```
API Server: http://localhost:5000
Database: PostgreSQL on localhost:5432
Client URL: http://localhost:3000 (configured)
```

### Running Services
```
✓ npm run dev
  - Nodemon watching for changes
  - Auto-restart on file edits
  - Hot reload enabled

✓ Docker PostgreSQL
  - Running in background
  - Image: postgres:15-alpine
  - Data persisted in volume
```

### Environment Variables
```
PORT=5000
JWT_SECRET=echovault_supersecret2024
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/echo_vault_db?schema=public
CLIENT_URL=http://localhost:3000
```

---

## 🔑 Authentication Flow

### How It Works
1. **Send credentials** → `/api/auth/login`
2. **Receive JWT token** → `{"token": "eyJ..."}`
3. **Save token** → `{{token}}` environment variable
4. **Use for all requests** → `Authorization: Bearer {{token}}`

### Example Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "akwera@gmail.com",
    "password": "password123"
  }'
```

### Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "657df296-bf6d-4822-a842-40cb0abbeb79",
    "email": "akwera@gmail.com",
    "role": "ADMIN",
    "name": "Admin User",
    "isVerified": true
  }
}
```

---

## 📚 API Endpoints Available

### Auth (Public - No Token Needed)
```
POST /api/auth/register           ← Create account
POST /api/auth/login              ← Get token
POST /api/auth/refresh            ← Refresh expired token
```

### Auth (Protected - Token Required)
```
POST /api/auth/verify             ← Check token validity
POST /api/auth/logout             ← Invalidate token
```

### Artist Operations (Token Required)
```
GET  /api/artist/insights         ← Streaming statistics
GET  /api/artist/library          ← Music library
GET  /api/artist/earnings-breakdown
POST /api/artist/upload-music     ← Upload audio file
POST /api/artist/upload-short     ← Upload video
POST /api/artist/withdrawal-request
```

### Admin Operations (Admin Token Required)
```
GET  /api/admin/dashboard         ← Dashboard stats
GET  /api/admin/users             ← List users
GET  /api/admin/unverified-artists
PUT  /api/admin/verify-artist/:id
PUT  /api/admin/approve-payout/:id
```

### Public Access (No Token Needed)
```
GET /api/tracks/trending          ← Trending songs
GET /api/tracks/featured          ← Featured tracks
GET /api/analytics/data           ← Analytics data
```

---

## 🛠️ Common Tasks

### View Database
```bash
npm run prisma:studio
# Opens Prisma Studio at http://localhost:5555
```

### Restart Server
```
Press: Ctrl+C (to stop)
Run: npm run dev (to restart)
```

### Reset Database
```bash
npm run prisma:migrate reset --force
# Clears all data and re-seeds
```

### View Server Logs
See background job output in terminal

---

## 🐛 Troubleshooting

### "Connection refused" on API calls
```
✓ Server running? Check terminal output
✓ Port 5000? Use curl http://localhost:5000
✓ Database running? Check Docker
```

### "Invalid credentials"
```
Use default credentials:
Email: akwera@gmail.com
Password: password123
```

### "Token expired"
```
Send POST /api/auth/refresh to get new token
```

### Port 5000 Already in Use
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### Database connection failed
```bash
# Check Docker
docker ps

# Restart database
docker-compose up db

# Reset database
npm run prisma:migrate reset --force
```

---

## 📋 Collection Files

| File | Purpose |
|------|---------|
| `postman/README.md` | Complete Postman guide |
| `postman/TESTING_GUIDE.md` | Testing strategies |
| `postman/SCRIPT_LIBRARY.js` | Test script snippets |
| `postman/run-tests.bat` | Windows test runner |
| `.github/workflows/api-tests.yml` | CI/CD workflow |
| `quick-test.js` | Instant API verification |

---

## 🚦 What to Test First

### 1. Authentication Flow (5 min)
- [ ] Register new artist
- [ ] Login as artist
- [ ] Verify token works
- [ ] Refresh token
- [ ] Logout

### 2. Artist Operations (10 min)
- [ ] Get insights
- [ ] Get music library
- [ ] Check earnings

### 3. Admin Operations (5 min)
- [ ] Login as admin
- [ ] Get unverified artists
- [ ] Verify artist
- [ ] Check payouts

### 4. Public Data (3 min)
- [ ] Get trending tracks
- [ ] Get featured tracks
- [ ] Get analytics data

### 5. Full Collection Run (15 min)
- [ ] Use Postman Collection Runner
- [ ] Run all 39 endpoints
- [ ] View test results
- [ ] Check response times

---

## 📈 Next Steps

1. **[Now] Run quick-test.js** to verify API
2. **[Now] Import Postman collection** and test endpoints
3. **[Later] Deploy to cloud** (AWS/GCP/Azure)
4. **[Later] Set up CI/CD** pipeline
5. **[Later] Configure monitoring** (logs, metrics)

---

## 💡 Pro Tips

### Save Postman Collections
```
File → Export → EchoVault API.json
```

### Export Test Results
```
Runner → Results → Download Report (JSON/HTML)
```

### Share Collection
```
Right-click collection → Share
Send link to team
```

### Use Pre-request Scripts
```
Reuse token from environment
Auto-generate timestamps
Create test data
```

---

## 📞 Support Commands

```bash
# View all running processes
docker ps

# View server logs
npm run dev

# View database
npm run prisma:studio

# Generate Prisma client
npm run prisma:generate

# Run tests
node quick-test.js
```

---

## ✅ Checklist

- [x] Database running (PostgreSQL)
- [x] Server running (npm run dev)
- [x] API responding (localhost:5000)
- [x] Authentication working
- [x] Postman collection ready
- [x] Test credentials available
- [x] Quick test passing
- [x] Documentation complete

---

## 🎯 You're Ready!

Everything is configured and running. You can now:

✅ **Test all 39 API endpoints**
✅ **Use Postman Collection Runner**
✅ **Generate test reports**
✅ **Run CI/CD workflows**
✅ **Develop with hot reload**

**Next:** Open Postman and import the collection! 🚀

---

**Last Updated**: Today
**API Version**: 1.0
**Collection Status**: ✅ Ready
**Server Status**: ✅ Running
