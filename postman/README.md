# EchoVault API Collection - Complete Setup & Reference

## Overview

This directory contains a **production-ready Postman collection** for testing the EchoVault API with:

- ✅ **39 API endpoints** across 7 categories
- ✅ **Automated test scripts** on every request
- ✅ **Pre-configured environment variables**
- ✅ **Collection runner** for batch testing
- ✅ **CI/CD integration** ready
- ✅ **Newman CLI support** for headless testing
- ✅ **Performance monitoring** capabilities

---

## 📁 Directory Structure

```
postman/
├── collections/
│   └── EchoVault API/
│       ├── Auth/                    # 7 auth endpoints
│       ├── Artist/                  # 7 artist operations
│       ├── Artist Dashboard/        # 6 dashboard endpoints
│       ├── Admin/                   # 10 admin operations
│       ├── Analytics/               # 3 analytics endpoints
│       ├── Tracks/                  # 2 public track endpoints
│       ├── Live Streams/            # 3 streaming endpoints
│       └── .resources/              # Shared assets
├── environments/
│   └── EchoVault Local.yaml         # Local development environment
├── TESTING_GUIDE.md                 # Comprehensive testing documentation
├── SCRIPT_LIBRARY.js                # Reusable test script snippets
├── run-tests.bat                    # Windows batch runner
├── enhance_collection.js            # Script to add tests to endpoints
└── runner-config.json               # Collection runner configuration
```

---

## 🚀 Quick Start (5 Minutes)

### 1. Import Collection

```bash
# Using Postman UI
1. Click "Import" (top-left)
2. Select "File" tab
3. Choose: postman/collections/EchoVault API/definition.yaml
4. Click "Import"
```

### 2. Import Environment

```bash
1. Click "Environments" (left sidebar)
2. Click "Import"
3. Choose: postman/environments/EchoVault Local.yaml
4. Click "Import"
```

### 3. Select Environment & Test

```bash
1. Select "EchoVault Local" from environment dropdown (top-right)
2. Go to: Auth → Login
3. Click "Send"
4. Token auto-saves to {{token}} variable
5. All other endpoints now have authorization
```

---

## 📊 Collection Statistics

| Category | Requests | Status |
|----------|----------|--------|
| Auth | 7 | ✅ Complete |
| Artist | 7 | ✅ Complete |
| Artist Dashboard | 6 | ✅ Complete |
| Admin | 10 | ✅ Complete |
| Analytics | 3 | ✅ Complete |
| Tracks | 2 | ✅ Complete |
| Live Streams | 3 | ✅ Complete |
| **TOTAL** | **39** | ✅ **Complete** |

### Test Coverage
- ✅ Status code validation
- ✅ Response structure validation
- ✅ Data type checking
- ✅ Token extraction & storage
- ✅ Performance timing

---

## 🔐 Authentication Flow

### Pre-Authentication
```
Default credentials:
Email: artist@example.com
Password: password123
```

### Post-Login
The **Login** request automatically saves token to:
- `{{token}}` - Current artist token
- `{{artistToken}}` - Alias for artist token
- `{{adminToken}}` - Set this manually for admin requests

```javascript
// Auto-saved by Login request
pm.environment.set("token", response.token);
pm.environment.set("artistToken", response.token);
```

---

## ⚙️ Environment Variables

### Current Variables

```yaml
baseUrl: http://localhost:5000
token: (auto-set after login)
artistToken: (auto-set after login)
adminToken: (set manually from admin login)
```

### Adding Variables

1. Click **Environments** → **EchoVault Local**
2. Add new variable under **VARIABLE** column
3. Set **INITIAL VALUE** and **CURRENT VALUE**
4. Click **Save**

---

## 🧪 Running Tests

### Option 1: Postman UI (Manual)

```
1. Select endpoint
2. Click "Send"
3. View "Tests" tab for results
```

### Option 2: Collection Runner

```
1. Click "Runner" (top-left)
2. Select "EchoVault API" collection
3. Select "EchoVault Local" environment
4. Click "Run"
5. Watch live results
```

### Option 3: Newman CLI (Headless)

```bash
# Full collection
newman run postman/collections/EchoVault\ API.json \
  -e postman/environments/EchoVault\ Local.json

# Specific folder
newman run postman/collections/EchoVault\ API.json \
  -e postman/environments/EchoVault\ Local.json \
  --folder "Auth"

# With HTML report
newman run postman/collections/EchoVault\ API.json \
  -e postman/environments/EchoVault\ Local.json \
  -r html --reporter-html-export report.html
```

### Option 4: Windows Batch Script

```bash
cd postman
run-tests.bat
```

---

## 📝 Test Scripts

Every request includes **post-response tests** that automatically:

1. ✅ Validate HTTP status code
2. ✅ Check response is valid JSON
3. ✅ Verify required fields exist
4. ✅ Extract and save tokens
5. ✅ Check performance timing

### Example Auth Test
```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("token");
  pm.environment.set("token", json.token);
});
```

### Example Data Test
```javascript
pm.test("Has required data", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("data");
  pm.expect(json.data).to.be.an("array");
});
```

---

## 🔗 Endpoint Categories

### Auth (7 endpoints)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/register-dashboard` - Register dashboard admin
- `POST /api/auth/login` - Login user
- `POST /api/auth/login-dashboard` - Login admin
- `POST /api/auth/logout` - Logout (invalidate token)
- `POST /api/auth/refresh` - Refresh expired token
- `GET /api/auth/verify` - Verify current session

### Artist (7 endpoints)
- `GET /api/artist/insights` - Get streaming insights
- `GET /api/artist/library` - Get music library
- `GET /api/artist/earnings-breakdown` - Get earnings detail
- `GET /api/artist/withdrawal-history` - Get payout history
- `POST /api/artist/upload-music` - Upload audio file
- `POST /api/artist/upload-short` - Upload short video
- `POST /api/artist/withdrawal-request` - Request payout

### Artist Dashboard (6 endpoints)
- `GET /api/dashboard` - Dashboard overview
- `GET /api/dashboard/music` - Music page data
- `GET /api/dashboard/shorts-insights` - Short videos data
- `GET /api/dashboard/revenue` - Revenue analytics
- `GET /api/dashboard/upload-audio` - Audio upload page
- `GET /api/dashboard/upload-video` - Video upload page

### Admin (10 endpoints)
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user detail
- `POST /api/admin/create-user` - Create new admin
- `GET /api/admin/unverified-artists` - List unverified artists
- `PUT /api/admin/verify-artist/:id` - Verify artist
- `PUT /api/admin/reject-artist/:id` - Reject artist
- `PUT /api/admin/approve-payout/:id` - Approve withdrawal
- `PUT /api/admin/reject-payout/:id` - Reject withdrawal
- `POST /api/admin/platform-withdraw` - Platform withdrawal

### Analytics (3 endpoints)
- `GET /api/analytics/data` - Get analytics data
- `GET /api/analytics/export/csv` - Export CSV report
- `GET /api/analytics/export/xml` - Export XML report

### Tracks (2 endpoints)
- `GET /api/public/tracks/trending` - Trending tracks
- `GET /api/public/tracks/featured` - Featured tracks

### Live Streams (3 endpoints)
- `GET /api/streams/live` - Active live streams
- `GET /api/streams/active` - Stream status
- `GET /api/streams/:id` - Stream details

---

## 🛠️ Common Tasks

### Testing a Workflow

1. **Artist Signup & Upload**
   - Run: Auth → Register
   - Run: Artist → Get Insights
   - Run: Artist → Upload Music
   - Run: Artist → Request Withdrawal

2. **Admin Verification**
   - Run: Auth → Login (as admin)
   - Run: Admin → Get Unverified Artists
   - Run: Admin → Verify Artist
   - Run: Admin → Approve Payout

3. **Public Data Access**
   - Run: Tracks → Get Trending Tracks
   - Run: Tracks → Get Featured Tracks
   - Run: Live Streams → Get Live Streams

### Debugging Failed Tests

1. Check response status code
2. Expand test in **Tests** tab
3. Read error message
4. Compare with example response
5. Verify request body/headers

### Performance Monitoring

1. Run collection with timing
2. Check **Response Time** column
3. Flag slow endpoints (>500ms)
4. Run `newman` with `-n 5` for load test

---

## 🔄 Integration with CI/CD

### GitHub Actions

```yaml
- name: Run API Tests
  run: |
    newman run postman/collections/EchoVault\ API.json \
      -e postman/environments/EchoVault\ Local.json \
      -r json --reporter-json-export results.json
```

See `.github/workflows/api-tests.yml` for full workflow.

### Jenkins

```groovy
stage('API Tests') {
  steps {
    sh '''
      newman run postman/collections/EchoVault\ API.json \
        -e postman/environments/EchoVault\ Local.json \
        -r junit --reporter-junit-export results.xml
    '''
    junit 'results.xml'
  }
}
```

---

## 📈 Reports & Analytics

### Generated Reports

- **HTML Report** - Visual test summary with charts
- **JSON Report** - Machine-readable results
- **JUnit Report** - For CI/CD integration
- **Combined Report** - Aggregated results

### Viewing Reports

```bash
# Generate report
newman run collection.json \
  -r html --reporter-html-export report.html

# Open in browser
open report.html
```

---

## 🎓 Learning Resources

- **Postman Learning**: https://learning.postman.com
- **Newman Docs**: https://github.com/postmanlabs/newman
- **Test Scripts**: See `SCRIPT_LIBRARY.js`
- **Testing Guide**: See `TESTING_GUIDE.md`

---

## 🐛 Troubleshooting

### "Connection refused" error

```bash
# Start API server
npm run dev

# Or Docker
docker-compose up
```

### "Invalid credentials" error

```bash
# Reset database
npm run seed-demo

# Or manually update user
npm run seed
```

### Token expired

```javascript
// Auto-handled by pre-request script
// Or manually refresh:
POST /api/auth/refresh
Authorization: Bearer {{token}}
```

### Port 5000 in use

```bash
# Update environment baseUrl
# Change: http://localhost:5000
# To: http://localhost:3000
```

---

## 📞 Support

- **API Issues**: Check server logs (`npm run dev`)
- **Postman Issues**: See TESTING_GUIDE.md
- **Test Issues**: Check test scripts in each request
- **Environment Issues**: Verify all variables are set

---

## ✅ Checklist

Before sharing collection:

- [ ] All 39 requests have test scripts
- [ ] Environment variables are documented
- [ ] Example requests/responses are complete
- [ ] Collection runs without errors
- [ ] Documentation is up-to-date

---

## 📄 Files

- `definition.yaml` - Collection definition
- `EchoVault Local.yaml` - Environment variables
- `TESTING_GUIDE.md` - Detailed testing documentation
- `SCRIPT_LIBRARY.js` - Reusable test snippets
- `run-tests.bat` - Windows test runner
- `enhance_collection.js` - Script generator
- `runner-config.json` - Runner settings
- `.github/workflows/api-tests.yml` - GitHub Actions workflow

---

**Last Updated**: January 2024
**Collection Version**: 2.0
**API Version**: 1.0
**Postman Version**: 11+
