/**
 * SETUP GUIDE - ECHOVAULT BACKEND
 * You need Node.js installed first
 */

// ============================================================================
// STEP 1: INSTALL NODE.JS (Required)
// ============================================================================

// Windows 11 with Windows Package Manager (EASIEST):

/*
1. Open PowerShell as Administrator
   Right-click PowerShell → Run as Administrator

2. Install Node.js:
   winget install OpenJS.NodeJS

3. Wait for installation to complete (takes 2-3 minutes)

4. Close and reopen PowerShell

5. Verify installation:
   node --version
   npm --version
   
   Expected output:
   v20.11.0 (or similar)
   10.2.4 (or similar)
*/

// Alternative: Download from nodejs.org

/*
1. Go to: https://nodejs.org/en/download/
2. Click: "Windows Installer (.msi)"
3. Download latest LTS version
4. Run the installer
5. Follow prompts (Accept defaults)
6. Restart computer
7. Verify in PowerShell: node --version
*/

// ============================================================================
// STEP 2: VERIFY .env FILE EXISTS
// ============================================================================

/*
File: C:\Users\infin\Downloads\echo-vault-backend\.env

Content must include:
  PORT=5000
  NODE_ENV=development
  JWT_SECRET=echovault_jwt_secret_key_2024_change_in_production_12345
  DATABASE_URL=postgresql://postgres:[REDACTED]@localhost:5432/echo_vault_db?schema=public

If missing, create it with the content above.
*/

// ============================================================================
// STEP 3: INSTALL DEPENDENCIES
// ============================================================================

/*
Open PowerShell:

1. Navigate to backend:
   cd C:\Users\infin\Downloads\echo-vault-backend

2. Install npm packages:
   npm install

   This will:
   - Create node_modules/ folder
   - Install all dependencies from package.json
   - Takes 2-5 minutes depending on internet speed

3. When complete, you'll see:
   added 250+ packages
*/

// ============================================================================
// STEP 4: START THE BACKEND
// ============================================================================

/*
In PowerShell (same directory):

   npm run dev

Expected output:
   
   ╔════════════════════════════════════════╗
   ║  🎵 EchoVault Server Started           ║
   ╚════════════════════════════════════════╝
   Environment: development
   Host: http://0.0.0.0:5000
   Health: http://0.0.0.0:5000/api/health
   WebSocket: ws://0.0.0.0:5000/socket.io
   Database: Connected
   Time: 2026-05-27T15:50:00.000Z

Backend is now running!
*/

// ============================================================================
// STEP 5: VERIFY IT'S WORKING
// ============================================================================

/*
Open a NEW PowerShell window (don't close the dev server):

1. Test health endpoint:
   curl http://localhost:5000/api/health

   Expected response:
   {"status":"healthy","uptime":45.123,"environment":"development"}

2. If you see this JSON → Backend is working!
*/

// ============================================================================
// STEP 6: USE THE ENDPOINTS (POST /api/admin/create-admin)
// ============================================================================

/*
Now that backend is running with JWT_SECRET in .env:

1. Login to get token:
   
   Method: POST
   URL: http://localhost:5000/api/auth/login
   Headers: Content-Type: application/json
   Body:
   {
     "email": "admin@test.com",
     "password": "password123"
   }
   
   Save the "token" from response

2. Create new admin:
   
   Method: POST
   URL: http://localhost:5000/api/admin/create-admin
   Headers:
     Authorization: Bearer [PASTE_TOKEN_HERE]
     Content-Type: application/json
   Body:
   {
     "name": "New Manager",
     "email": "newmanager@test.com",
     "username": "newmanager123",
     "password": "SecurePass123!",
     "confirmPassword": "SecurePass123!",
     "phone": "555-1234",
     "role": "MANAGER"
   }
   
   Expected response (201 Created):
   {
     "success": true,
     "message": "Admin user 'New Manager' with role 'MANAGER' created successfully",
     "data": {
       "id": "...",
       "name": "New Manager",
       "email": "newmanager@test.com",
       "username": "newmanager123",
       "role": "MANAGER",
       "createdAt": "2026-05-27T..."
     }
   }
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
Error: "npm is not recognized"
Solution: Node.js not installed
  → Install Node.js from https://nodejs.org/
  → OR use: winget install OpenJS.NodeJS
  → Restart PowerShell after installation

Error: "Cannot find module..."
Solution: Dependencies not installed
  → Run: npm install

Error: "Port 5000 already in use"
Solution: Another process using port 5000
  → Find process: netstat -ano | findstr :5000
  → Kill it: taskkill /PID [PID] /F
  → Or change PORT in .env to 5001

Error: "JWT_SECRET is not set"
Solution: .env file missing JWT_SECRET
  → Create/edit: C:\Users\infin\Downloads\echo-vault-backend\.env
  → Add: JWT_SECRET=echovault_jwt_secret_key_2024_...
  → Restart backend: npm run dev

Error: "Database connection failed"
Solution: PostgreSQL not running or wrong DATABASE_URL
  → Check DATABASE_URL in .env
  → Verify PostgreSQL is running
  → Or use mock database for testing
*/

// ============================================================================
// COMPLETE WORKFLOW
// ============================================================================

/*
1. Install Node.js
   winget install OpenJS.NodeJS
   (restart PowerShell)

2. Navigate to backend
   cd C:\Users\infin\Downloads\echo-vault-backend

3. Install dependencies
   npm install

4. Start backend
   npm run dev

5. In NEW PowerShell window, test:
   curl http://localhost:5000/api/health

6. Once working, use the endpoints:
   - POST /api/auth/login → get token
   - POST /api/admin/create-admin → create admin (with token)

That's it!
*/

// ============================================================================
// WHAT HAPPENS AFTER YOU RUN npm run dev
// ============================================================================

/*
The server:
  ✓ Reads .env file → Gets JWT_SECRET
  ✓ Connects to database
  ✓ Starts listening on port 5000
  ✓ Registers all routes
  ✓ Enables WebSocket for real-time features
  ✓ Ready to receive API requests

When you POST /api/admin/create-admin:
  ✓ Token is verified using JWT_SECRET
  ✓ protect middleware sets req.user
  ✓ authorize checks user is ADMIN
  ✓ Controller validates input
  ✓ Admin created in database
  ✓ Returns 201 with new admin data

Everything works because:
  1. .env exists with JWT_SECRET
  2. Backend can verify tokens
  3. Authenticated requests succeed
  4. POST /api/admin/create-admin endpoint works
*/
