/**
 * ECHOVAULT - BACKEND SETUP & TESTING GUIDE
 * Node.js/Express Backend
 * Postman Collection Integration
 */

// ============================================================================
// QUICK START - LOCAL DEVELOPMENT
// ============================================================================

/*
1. Install Dependencies
   cd C:\Users\infin\Downloads\echo-vault-backend
   npm install

2. Setup Environment
   Copy .env.example to .env
   Configure database connection in .env

3. Run Prisma Migrations
   npm run prisma:generate
   npm run prisma:migrate

4. Start Development Server
   npm run dev
   Server will run on http://localhost:5000

5. Verify Health Check
   GET http://localhost:5000/api/health
   Expected: { "status": "healthy", "uptime": ..., "environment": "development" }
*/

// ============================================================================
// POSTMAN TESTING - STEP BY STEP
// ============================================================================

/*
STEP 1: Import Postman Collection
   File: C:\Users\infin\Downloads\echo-vault-backend\EchoVault_API_Testing.postman_collection.json
   - Open Postman
   - Click: Import
   - Select the JSON file
   - Collection is now ready to test

STEP 2: Authentication - Register Artist
   Endpoint: POST /api/auth/register
   URL: http://localhost:5000/api/auth/register
   Body (JSON):
   {
     "email": "artist@test.com",
     "password": "password123",
     "name": "Test Artist",
     "role": "ARTIST"
   }
   Expected Response (201):
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "user_123",
       "email": "artist@test.com",
       "name": "Test Artist",
       "role": "ARTIST"
     },
     "message": "Account created successfully"
   }

STEP 3: Authentication - Login
   Endpoint: POST /api/auth/login
   URL: http://localhost:5000/api/auth/login
   Body (JSON):
   {
     "email": "artist@test.com",
     "password": "password123"
   }
   Expected Response (200):
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "user_123",
       "email": "artist@test.com",
       "name": "Test Artist",
       "role": "ARTIST"
     }
   }
   
   ACTION: Copy the token value for next requests

STEP 4: Set Authorization Header for All Remaining Tests
   - In Postman, go to: Collection → Authorization
   - Type: Bearer Token
   - Token: {paste_the_jwt_token_from_login}
   
   OR set on individual request:
   - Headers Tab
   - Key: Authorization
   - Value: Bearer {jwt_token}

STEP 5: Test Artist Endpoints
   
   a) GET /api/artist/dashboard
      URL: http://localhost:5000/api/artist/dashboard
      Headers: Authorization: Bearer {token}
      Expected Response (200):
      {
        "success": true,
        "data": {
          "totalPlays": 0,
          "totalSongs": 0,
          "totalShorts": 0,
          "totalVideos": 0,
          "totalContent": 0,
          "currentBalance": 0,
          "artistName": "Test Artist",
          "artistEmail": "artist@test.com"
        }
      }
   
   b) GET /api/artist/music
      URL: http://localhost:5000/api/artist/music
      Headers: Authorization: Bearer {token}
      Expected Response (200):
      {
        "success": true,
        "data": {
          "songs": [],
          "videos": [],
          "shorts": [],
          "totalSongs": 0,
          "totalVideos": 0,
          "totalShorts": 0,
          "totalContent": 0
        }
      }
   
   c) GET /api/artist/insights
      URL: http://localhost:5000/api/artist/insights
      Headers: Authorization: Bearer {token}
      Expected Response (200):
      {
        "success": true,
        "data": {
          "totalPlays": 0,
          "totalEarnings": 0,
          "currentBalance": 0,
          "shorts": [],
          "recentTransactions": []
        }
      }
   
   d) GET /api/artist/earnings
      URL: http://localhost:5000/api/artist/earnings
      Headers: Authorization: Bearer {token}
      Expected Response (200):
      {
        "success": true,
        "data": {
          "shortEarnings": 0,
          "liveEarnings": 0,
          "totalEarnings": 0,
          "breakdown": {
            "shorts": { "amount": 0, "percentage": "0" },
            "live": { "amount": 0, "percentage": "0" }
          }
        }
      }
   
   e) GET /api/artist/withdrawals
      URL: http://localhost:5000/api/artist/withdrawals
      Headers: Authorization: Bearer {token}
      Expected Response (200):
      {
        "success": true,
        "data": {
          "withdrawals": [],
          "totalWithdrawn": 0,
          "pendingWithdrawals": [],
          "pendingAmount": 0
        }
      }
   
   f) POST /api/artist/withdraw
      URL: http://localhost:5000/api/artist/withdraw
      Headers: Authorization: Bearer {token}
      Body (JSON):
      {
        "amount": 50.00
      }
      Expected Response (400 - insufficient balance):
      {
        "success": false,
        "error": "Insufficient balance"
      }

STEP 6: Test Live Stream Endpoints
   
   a) POST /api/artist/start-stream
      URL: http://localhost:5000/api/artist/start-stream
      Headers: Authorization: Bearer {token}
      Body (JSON):
      {
        "title": "My Live Stream"
      }
      Expected Response (201):
      {
        "success": true,
        "data": {
          "id": "stream_123",
          "title": "My Live Stream",
          "artistId": "user_123",
          "status": "ACTIVE",
          "viewerCount": 0,
          "giftCount": 0
        }
      }
   
   b) POST /api/artist/stop-stream
      URL: http://localhost:5000/api/artist/stop-stream
      Headers: Authorization: Bearer {token}
      Body (JSON):
      {
        "streamId": "stream_123"
      }
      Expected Response (200):
      {
        "success": true,
        "data": {
          "id": "stream_123",
          "status": "ENDED"
        }
      }

STEP 7: Verify All Endpoints Are Working
   Summary:
   ✓ POST /api/auth/register - User created
   ✓ POST /api/auth/login - JWT token obtained
   ✓ GET /api/artist/dashboard - Dashboard data returned
   ✓ GET /api/artist/music - Music library returned
   ✓ GET /api/artist/insights - Insights returned
   ✓ GET /api/artist/earnings - Earnings breakdown returned
   ✓ GET /api/artist/withdrawals - Withdrawal history returned
   ✓ POST /api/artist/withdraw - Withdrawal request creation
   ✓ POST /api/artist/start-stream - Live stream started
   ✓ POST /api/artist/stop-stream - Live stream stopped
*/

// ============================================================================
// ENVIRONMENT SETUP - .env FILE
// ============================================================================

/*
Example .env configuration:

# Server
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/echovault"

# JWT Secret
JWT_SECRET="your_secret_key_here"
JWT_EXPIRY="24h"

# Client URLs
CLIENT_URL=http://localhost:3000
FLUTTER_CLIENT_URL=http://10.0.2.2:5000

# Uploads
UPLOAD_DIR=./uploads

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://10.0.2.2:*
*/

// ============================================================================
// DOCKER DEPLOYMENT
// ============================================================================

/*
Build Docker Image:
   cd C:\Users\infin\Downloads\echo-vault-backend
   docker build -f Dockerfile.prod -t echovault-backend:latest .

Run Docker Container:
   docker run -p 5000:5000 \
     -e DATABASE_URL="postgresql://..." \
     -e JWT_SECRET="your_secret" \
     -e NODE_ENV=production \
     echovault-backend:latest

Verify Container:
   curl http://localhost:5000/api/health
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
Issue: "Cannot find module" errors
Solution:
  npm install
  npm run prisma:generate

Issue: Database connection error
Solution:
  1. Check DATABASE_URL in .env
  2. Verify PostgreSQL is running
  3. Run: npm run prisma:migrate

Issue: JWT token errors
Solution:
  1. Ensure JWT_SECRET is set in .env
  2. Check token is included in Authorization header
  3. Token format: "Bearer {token}"

Issue: CORS errors when calling from Flutter
Solution:
  Already configured in server.js with:
  - localhost:* 
  - 10.0.2.2:*
  - Azure Container URLs
  - azurecontainers.io

Issue: Upload endpoints failing
Solution:
  1. Check /uploads directory exists
  2. Verify multer configuration in multerConfig.js
  3. Check file size limits (50MB in server.js)
*/

// ============================================================================
// INTEGRATION WITH FLUTTER FRONTEND
// ============================================================================

/*
Frontend calls backend via:
  Base URL: http://localhost:5000 (development)
  OR: http://echovault-backend.eastus.azurecontainer.io:5000 (production)

Flow:
1. Flutter app initializes ApiClient with baseUrl
2. User calls AuthService.login()
3. Backend returns JWT token
4. Token stored in flutter_secure_storage
5. ApiClient automatically injects token in all requests
6. Artist screens call ArtistServiceV2 methods
7. Each method maps to corresponding backend API endpoint

Example Flow:
1. User taps "Login"
2. AuthService.login(email, password) called
3. POST /api/auth/login executed
4. JWT token returned
5. Token stored securely
6. User navigated to artist dashboard
7. Dashboard calls ArtistServiceV2.getDashboardData()
8. GET /api/artist/dashboard called with Bearer token
9. Dashboard data displayed in Flutter UI
*/

// ============================================================================
// FILE STRUCTURE
// ============================================================================

/*
echo-vault-backend/
├── src/
│   ├── routes/
│   │   ├── authRoutes.js (POST /register, /login, /logout)
│   │   ├── artistRoutes.js (GET /dashboard, /music, /insights, POST /withdraw)
│   │   ├── tracksRoutes.js (POST /upload)
│   │   ├── liveStreamsRoutes.js (POST /start-stream, /stop-stream)
│   │   ├── giftingRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── ...
│   ├── controllers/
│   │   ├── authController.js (register, login, logout)
│   │   ├── artistController.js (dashboard, music, earnings, withdraw, stream)
│   │   └── ...
│   ├── middlewares/
│   │   ├── authMiddleware.js (protect, authorize)
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── prisma.js (database client)
│   │   ├── jwt.js (token generation/verification)
│   │   └── socketHandlers.js
│   └── config/
│       └── multerConfig.js (file uploads)
├── server.js (main entry point)
├── package.json
├── .env.example
├── Dockerfile (production)
├── Dockerfile.dev (development)
└── EchoVault_API_Testing.postman_collection.json
*/

// ============================================================================
// NEXT STEPS
// ============================================================================

/*
1. ✓ Start development server: npm run dev
2. ✓ Test all endpoints with Postman collection
3. ✓ Verify JWT token management works
4. ✓ Test Flutter frontend API calls
5. ✓ Run complete end-to-end flow:
   - Register artist in Flutter
   - Login
   - View dashboard
   - Check earnings
   - Request withdrawal
6. ✓ Deploy to production:
   - Build Docker image
   - Push to Azure Container Registry
   - Deploy Azure Container Instances
7. ✓ Monitor logs and performance
*/
