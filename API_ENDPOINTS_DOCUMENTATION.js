// BACKEND API ENDPOINTS - NODE.JS/EXPRESS
// EchoVault - Complete API Implementation
// Maps to Postman Collection: EchoVault_API_Testing.postman_collection.json

// ============================================================================
// POSTMAN COLLECTION ENDPOINTS
// ============================================================================

// All authentication endpoints are in: src/routes/authRoutes.js
// All artist endpoints are in: src/routes/artistRoutes.js
// All track upload endpoints are in: src/routes/tracksRoutes.js
// All live stream endpoints are in: src/routes/liveStreamsRoutes.js
// All gifting endpoints are in: src/routes/giftingRoutes.js
// All payment endpoints are in: src/routes/paymentRoutes.js

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================
// Location: src/routes/authRoutes.js
// Controller: src/controllers/authController.js

/*
POST /api/auth/register
  Status: ✓ IMPLEMENTED
  Description: Register a new user (artist or listener)
  Body: {
    "email": "artist@test.com",
    "password": "password123",
    "name": "Test Artist",
    "role": "ARTIST"
  }
  Response (201): {
    "token": "jwt_token_here",
    "user": { id, email, name, role, ... },
    "message": "Account created successfully"
  }
  Controller: authController.register()

POST /api/auth/login
  Status: ✓ IMPLEMENTED
  Description: Login with email and password
  Postman Test: 
    - Email: artist@test.com
    - Password: password123
  Body: {
    "email": "artist@test.com",
    "password": "password123"
  }
  Response (200): {
    "token": "jwt_token_here",
    "user": { id, email, name, role, ... }
  }
  Controller: authController.login()
  Usage in Flutter: AuthService.login()

POST /api/auth/logout
  Status: ✓ IMPLEMENTED
  Description: Logout and clear session
  Headers: Authorization: Bearer {token}
  Response (200): {
    "message": "Logged out successfully"
  }
  Controller: authController.logout()
  Usage in Flutter: AuthService.logout()

POST /api/auth/refresh
  Status: ✓ IMPLEMENTED
  Description: Refresh expired token
  Body: { "token": "old_token_here" }
  Response (200): {
    "success": true,
    "token": "new_jwt_token",
    "user": { ... },
    "expiresIn": 86400
  }

POST /api/auth/verify
  Status: ✓ IMPLEMENTED
  Description: Verify if current token is valid
  Headers: Authorization: Bearer {token}
  Response (200): {
    "success": true,
    "user": { id, email, name, ... }
  }
*/

// ============================================================================
// ARTIST ENDPOINTS - DASHBOARD & MUSIC
// ============================================================================
// Location: src/routes/artistRoutes.js
// Controller: src/controllers/artistController.js

/*
GET /api/artist/dashboard
  Status: ✓ IMPLEMENTED
  Description: Get artist dashboard data
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Response (200): {
    "success": true,
    "data": {
      "totalPlays": 1500,
      "totalSongs": 25,
      "totalShorts": 10,
      "totalVideos": 5,
      "totalContent": 40,
      "currentBalance": 250.50,
      "artistName": "Artist Name",
      "artistEmail": "artist@test.com"
    }
  }
  Controller: artistController.getArtistDashboard()
  Usage in Flutter: ArtistServiceV2.getDashboardData()

GET /api/artist/music
  Status: ✓ IMPLEMENTED
  Description: Get artist's music library
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Response (200): {
    "success": true,
    "data": {
      "songs": [
        {
          "id": "song_id",
          "title": "Song Title",
          "fileUrl": "/uploads/music/...",
          "coverUrl": "/uploads/images/...",
          "duration": 240,
          "playCount": 150,
          "genre": "Electronic",
          "createdAt": "2026-05-27T..."
        }
      ],
      "videos": [...],
      "shorts": [...],
      "totalSongs": 25,
      "totalVideos": 5,
      "totalShorts": 10,
      "totalContent": 40
    }
  }
  Controller: artistController.getArtistMusic()
  Usage in Flutter: ArtistServiceV2.getArtistMusic()
*/

// ============================================================================
// ARTIST ENDPOINTS - INSIGHTS & ANALYTICS
// ============================================================================

/*
GET /api/artist/insights
  Status: ✓ IMPLEMENTED
  Description: Get artist insights and analytics
  Postman Test: Uses authorization header with JWT token
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Response (200): {
    "success": true,
    "data": {
      "totalPlays": 1500,
      "totalEarnings": 250.50,
      "currentBalance": 250.50,
      "shorts": [
        {
          "id": "short_id",
          "title": "Short Title",
          "playCount": 100,
          "giftCount": 5,
          "createdAt": "2026-05-27T..."
        }
      ],
      "recentTransactions": [...]
    }
  }
  Controller: artistController.getArtistInsights()
  Usage in Flutter: ArtistServiceV2.getArtistInsights()

GET /api/artist/live-insights
  Status: ✓ IMPLEMENTED
  Description: Get live stream insights
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Response (200): {
    "success": true,
    "data": {
      "activeStreams": 1,
      "totalLiveStreams": 10,
      "totalViewers": 5000,
      "totalGifts": 150,
      "recentStreams": [...]
    }
  }
  Controller: artistController.getLiveInsights()
  Usage in Flutter: ArtistServiceV2.getLiveInsights()

GET /api/artist/shorts-insights
  Status: ✓ IMPLEMENTED
  Description: Get shorts analytics
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Response (200): {
    "success": true,
    "data": {
      "totalShorts": 10,
      "totalPlays": 1000,
      "totalGifts": 50,
      "averagePlaysPerShort": 100,
      "topShorts": [...],
      "allShorts": [...]
    }
  }
  Controller: artistController.getShortsInsights()
  Usage in Flutter: ArtistServiceV2.getShortsInsights()
*/

// ============================================================================
// ARTIST ENDPOINTS - EARNINGS & WITHDRAWALS
// ============================================================================

/*
GET /api/artist/earnings
  Status: ✓ IMPLEMENTED
  Description: Get revenue data and earnings breakdown
  Postman Test: 
    - Authorization: Bearer YOUR_JWT_TOKEN_HERE
    - Expected response shows breakdown by shorts and live earnings
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Response (200): {
    "success": true,
    "data": {
      "shortEarnings": 150.00,
      "liveEarnings": 100.50,
      "totalEarnings": 250.50,
      "breakdown": {
        "shorts": {
          "amount": 150.00,
          "percentage": "59.88"
        },
        "live": {
          "amount": 100.50,
          "percentage": "40.12"
        }
      }
    }
  }
  Controller: artistController.getEarningsBreakdown()
  Usage in Flutter: ArtistServiceV2.getRevenueData()

GET /api/artist/withdrawals
  Status: ✓ IMPLEMENTED
  Description: Get withdrawal history
  Postman Test:
    - Authorization: Bearer YOUR_JWT_TOKEN_HERE
    - Returns all withdrawals, total withdrawn, and pending amount
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Response (200): {
    "success": true,
    "data": {
      "withdrawals": [
        {
          "id": "txn_id",
          "amount": 50.00,
          "status": "COMPLETED",
          "type": "WITHDRAWAL",
          "description": "Withdrawal request for $50.00",
          "createdAt": "2026-05-27T..."
        }
      ],
      "totalWithdrawn": 150.00,
      "pendingWithdrawals": [],
      "pendingAmount": 0
    }
  }
  Controller: artistController.getWithdrawalHistory()
  Usage in Flutter: ArtistServiceV2.getPayoutHistory()

POST /api/artist/withdraw
  Status: ✓ IMPLEMENTED
  Description: Request fund withdrawal
  Postman Test:
    - Method: POST
    - Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
    - Body: { "amount": 50.00 }
    - Expected: 201 response with transaction details
  Body: {
    "amount": 50.00,
    "bankAccount": "optional_account_number"
  }
  Response (201): {
    "success": true,
    "data": {
      "message": "Withdrawal request submitted",
      "transaction": {
        "id": "txn_id",
        "userId": "user_id",
        "amount": 50.00,
        "type": "WITHDRAWAL",
        "status": "PENDING",
        "description": "Withdrawal request for $50.00",
        "createdAt": "2026-05-27T..."
      }
    }
  }
  Response (400): { "success": false, "error": "Insufficient balance" }
  Controller: artistController.requestWithdrawal()
  Usage in Flutter: ArtistServiceV2.requestWithdrawal(amount: 50.0)
*/

// ============================================================================
// LIVE STREAM ENDPOINTS
// ============================================================================

/*
POST /api/artist/start-stream
  Status: ✓ IMPLEMENTED
  Description: Start a live stream
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Body: {
    "title": "My Live Stream",
    "thumbnail": "optional_url"
  }
  Response (201): {
    "success": true,
    "data": {
      "id": "stream_id",
      "title": "My Live Stream",
      "artistId": "artist_id",
      "status": "ACTIVE",
      "viewerCount": 0,
      "giftCount": 0,
      "createdAt": "2026-05-27T..."
    }
  }
  Controller: artistController.startLiveStream()
  Usage in Flutter: ArtistServiceV2.startLiveStream(title: "My Stream")

POST /api/artist/stop-stream
  Status: ✓ IMPLEMENTED
  Description: Stop an active live stream
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Body: {
    "streamId": "stream_id_to_stop"
  }
  Response (200): {
    "success": true,
    "data": {
      "id": "stream_id",
      "status": "ENDED",
      "endedAt": "2026-05-27T..."
    }
  }
  Controller: artistController.stopLiveStream()
  Usage in Flutter: ArtistServiceV2.stopLiveStream(streamId)
*/

// ============================================================================
// MUSIC MANAGEMENT ENDPOINTS
// ============================================================================

/*
PUT /api/artist/music/{musicId}
  Status: ✓ IMPLEMENTED
  Description: Edit music metadata
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Body: {
    "title": "Updated Title",
    "genre": "Electronic",
    "description": "Updated description"
  }
  Response (200): {
    "success": true,
    "data": {
      "id": "music_id",
      "title": "Updated Title",
      "genre": "Electronic",
      ...
    }
  }
  Controller: artistController.editMusic()
  Usage in Flutter: ArtistServiceV2.editMusic(musicId: "id", data: {...})

DELETE /api/artist/music/{musicId}
  Status: ✓ IMPLEMENTED
  Description: Delete music track
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Response (200): {
    "success": true,
    "message": "Music deleted successfully"
  }
  Controller: artistController.deleteMusic()
  Usage in Flutter: ArtistServiceV2.deleteMusic("musicId")

GET /api/artist/music/{musicId}/stats
  Status: ✓ IMPLEMENTED
  Description: Get detailed music statistics
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  Response (200): {
    "success": true,
    "data": {
      "type": "song",
      "id": "music_id",
      "title": "Song Title",
      "playCount": 150,
      "duration": 240,
      ...
    }
  }
  Controller: artistController.getMusicStats()
  Usage in Flutter: ArtistServiceV2.getMusicStats("musicId")
*/

// ============================================================================
// TRACK UPLOAD ENDPOINTS
// ============================================================================
// Location: src/routes/tracksRoutes.js

/*
POST /api/tracks/upload
  Description: Upload audio track with metadata
  Headers: 
    - Authorization: Bearer YOUR_JWT_TOKEN_HERE
    - Content-Type: multipart/form-data
  FormData:
    - audioFile (required): audio file
    - title (required): track title
    - quality (optional): HI_RES_LOSSLESS
    - genre (optional): music genre
    - description (optional): track description
    - coverArt (optional): cover art image
  Response (201): {
    "success": true,
    "data": { song object }
  }
  Usage in Flutter: ArtistServiceV2.uploadAudio()

POST /api/artist/upload/video
  Description: Upload video content
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  FormData:
    - videoFile (required): video file
    - title (required): video title
    - description (optional): video description
    - thumbnail (optional): thumbnail image
  Response (201): {
    "success": true,
    "data": { video object }
  }
  Usage in Flutter: ArtistServiceV2.uploadVideo()

POST /api/artist/upload/shorts
  Description: Upload short-form video
  Headers: Authorization: Bearer YOUR_JWT_TOKEN_HERE
  FormData:
    - shortFile (required): video file
    - title (required): short title
    - description (optional): short description
    - thumbnail (optional): thumbnail image
  Response (201): {
    "success": true,
    "data": { short object }
  }
  Usage in Flutter: ArtistServiceV2.uploadShorts()
*/

// ============================================================================
// API RESPONSE STRUCTURE
// ============================================================================

/*
Success Response (2xx):
{
  "success": true,
  "data": { ... }
}

Error Response (4xx/5xx):
{
  "success": false,
  "error": "Error message"
}

Authentication Error (401):
{
  "success": false,
  "error": "Unauthorized"
}

Validation Error (400):
{
  "success": false,
  "error": "Validation error message"
}
*/

// ============================================================================
// HEADERS REQUIRED FOR ALL PROTECTED ENDPOINTS
// ============================================================================

/*
Authorization: Bearer {jwt_token}
Content-Type: application/json

Example:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
*/

// ============================================================================
// HOW TO TEST IN POSTMAN
// ============================================================================

/*
1. Open Postman and import: EchoVault_API_Testing.postman_collection.json

2. Authentication Flow:
   a) POST /api/auth/register (if needed)
      Body: {
        "email": "artist@test.com",
        "password": "password123",
        "name": "Test Artist",
        "role": "ARTIST"
      }
   
   b) POST /api/auth/login
      Body: {
        "email": "artist@test.com",
        "password": "password123"
      }
      Copy the returned "token" value
   
   c) Set Authorization header for all subsequent requests:
      - Type: Bearer Token
      - Token: {paste_token_here}

3. Test Artist Endpoints:
   - GET /api/artist/insights (with Bearer token)
   - GET /api/artist/music (with Bearer token)
   - GET /api/artist/earnings (with Bearer token)
   - GET /api/artist/withdrawals (with Bearer token)
   - POST /api/artist/withdraw
     Body: { "amount": 50.00 }

4. Verify responses match Flutter expectations
*/

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
Backend Tests:
✓ POST /api/auth/register - Creates new artist account
✓ POST /api/auth/login - Returns JWT token
✓ POST /api/auth/logout - Clears session
✓ GET /api/artist/dashboard - Returns dashboard data
✓ GET /api/artist/music - Returns music library
✓ GET /api/artist/insights - Returns analytics
✓ GET /api/artist/earnings - Returns revenue breakdown
✓ GET /api/artist/withdrawals - Returns withdrawal history
✓ POST /api/artist/withdraw - Creates withdrawal request
✓ POST /api/artist/start-stream - Starts live stream
✓ POST /api/artist/stop-stream - Stops live stream
✓ PUT /api/artist/music/{id} - Edits music metadata
✓ DELETE /api/artist/music/{id} - Deletes music
✓ GET /api/artist/music/{id}/stats - Gets music stats

Frontend Tests (Flutter):
✓ AuthService.register() calls POST /api/auth/register
✓ AuthService.login() calls POST /api/auth/login
✓ AuthService.logout() calls POST /api/auth/logout
✓ ArtistServiceV2.getDashboardData() calls GET /api/artist/dashboard
✓ ArtistServiceV2.getArtistMusic() calls GET /api/artist/music
✓ ArtistServiceV2.getArtistInsights() calls GET /api/artist/insights
✓ ArtistServiceV2.getRevenueData() calls GET /api/artist/earnings
✓ ArtistServiceV2.getPayoutHistory() calls GET /api/artist/withdrawals
✓ ArtistServiceV2.requestWithdrawal() calls POST /api/artist/withdraw
✓ ArtistServiceV2.startLiveStream() calls POST /api/artist/start-stream
✓ ArtistServiceV2.stopLiveStream() calls POST /api/artist/stop-stream
*/
