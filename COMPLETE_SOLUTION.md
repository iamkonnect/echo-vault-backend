/**
 * SUMMARY - ECHOVAULT ADMIN CREATE ENDPOINT FIX
 * 
 * Everything you need to know in one place
 */

// ============================================================================
// THE PROBLEM
// ============================================================================

/*
URL: POST http://localhost:5000/api/admin/create-admin
Status: 500 or 401 error
Cannot create admin users

Root Cause:
  1. .env file missing from project root
  2. JWT_SECRET not defined
  3. Token verification fails (protect middleware)
  4. Requests rejected with 401 Unauthorized
*/

// ============================================================================
// THE SOLUTION (3 PARTS)
// ============================================================================

/*
Part 1: Create .env file
───────────────────────
Location: C:\Users\infin\Downloads\echo-vault-backend\.env

Content:
  PORT=5000
  HOST=0.0.0.0
  NODE_ENV=development
  JWT_SECRET=echovault_jwt_secret_key_2024_change_in_production_12345
  DATABASE_URL=postgresql://postgres:[REDACTED]@localhost:5432/echo_vault_db?schema=public
  CLIENT_URL=http://localhost:3000
  FLUTTER_CLIENT_URL=http://10.0.2.2:5000
  UPLOAD_DIR=./uploads
  CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://10.0.2.2:*


Part 2: Install Node.js (Required)
──────────────────────────────────
PowerShell (as Administrator):
  winget install OpenJS.NodeJS

Then verify:
  node --version
  npm --version


Part 3: Start Backend
───────────────────
PowerShell:
  cd C:\Users\infin\Downloads\echo-vault-backend
  npm install
  npm run dev

Expected output:
  ✓ EchoVault Server Started
  ✓ Database: Connected
  ✓ Listening on http://0.0.0.0:5000
*/

// ============================================================================
// ALL APIs INVOLVED
// ============================================================================

/*
1. LOGIN ENDPOINT → Generates JWT Token
   ─────────────────────────────────────
   POST /api/auth/login
   
   Request:
     { "email": "admin@test.com", "password": "password123" }
   
   Response:
     { "token": "eyJ...", "user": { ... } }
   
   File: src/controllers/authController.js → exports.login()
   Uses: generateToken(userId, role) from src/utils/jwt.js
   Requires: JWT_SECRET from .env


2. CREATE ADMIN ENDPOINT → Protected Route
   ───────────────────────────────────────
   POST /api/admin/create-admin
   
   Headers:
     Authorization: Bearer [TOKEN_FROM_LOGIN]
   
   Request:
     {
       "name": "Manager",
       "email": "manager@test.com",
       "username": "manager123",
       "password": "SecurePass123!",
       "confirmPassword": "SecurePass123!",
       "role": "MANAGER"
     }
   
   Response (201):
     {
       "success": true,
       "message": "Admin user created successfully",
       "data": { ... }
     }
   
   File: src/controllers/adminController.js → exports.createAdminUser()


3. PROTECT MIDDLEWARE → Validates Token
   ──────────────────────────────────────
   File: src/middlewares/authMiddleware.js
   
   Flow:
     1. Extract token from Authorization header
     2. Call verifyToken(token) using JWT_SECRET
     3. Look up user in database
     4. Set req.user
     5. Call next() to proceed
   
   Error: Returns 401 if token invalid


4. AUTHORIZE MIDDLEWARE → Checks Role
   ──────────────────────────────────
   File: src/middlewares/authMiddleware.js
   
   Flow:
     1. Check if req.user exists
     2. Check if req.user.role in allowed roles
     3. Call next() if authorized
   
   Error: Returns 403 if not authorized


5. JWT TOKEN GENERATION
   ────────────────────
   Function: generateToken(userId, role)
   File: src/utils/jwt.js
   
   Code:
     jwt.sign(
       { userId, role },
       process.env.JWT_SECRET,  ← REQUIRES .env with JWT_SECRET
       { expiresIn: '7d' }
     )


6. JWT TOKEN VERIFICATION
   ──────────────────────
   Function: verifyToken(token)
   File: src/utils/jwt.js
   
   Code:
     jwt.verify(
       token,
       process.env.JWT_SECRET  ← MUST MATCH secret from generation
     )
*/

// ============================================================================
// COMPLETE WORKFLOW
// ============================================================================

/*
Step 1: Prerequisites
  ✓ Node.js installed (npm available)
  ✓ .env file created with JWT_SECRET
  ✓ Backend started with: npm run dev

Step 2: Login
  POST http://localhost:5000/api/auth/login
  Body: { "email": "admin@test.com", "password": "password123" }
  
  Response contains:
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
  Action: Copy this token

Step 3: Create Admin
  POST http://localhost:5000/api/admin/create-admin
  
  Headers:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    Content-Type: application/json
  
  Body: { "name": "...", "email": "...", ... }
  
  Process:
    1. Server receives request
    2. protect middleware validates token using JWT_SECRET
    3. authorize middleware checks user is ADMIN
    4. Controller validates input
    5. Creates admin in database
    6. Returns 201 Created
  
  Response:
    {
      "success": true,
      "message": "Admin user '...' created successfully",
      "data": { "id": "...", "name": "...", ... }
    }

Step 4: Success!
  ✓ New admin created
  ✓ Can login with email/password
  ✓ Assigned role (MANAGER, ADMIN, etc.)
*/

// ============================================================================
// WHY JWT_SECRET IS CRITICAL
// ============================================================================

/*
WITHOUT JWT_SECRET in .env:
  process.env.JWT_SECRET = undefined
  
  jwt.sign(payload, undefined)
    → Creates invalid or weak token
  
  jwt.verify(token, undefined)
    → Cannot verify token
    → Throws error
    → protect middleware fails
    → Request returns 401
  
  Result: POST /api/admin/create-admin fails with 401


WITH JWT_SECRET in .env:
  process.env.JWT_SECRET = "echovault_jwt_secret_..."
  
  jwt.sign(payload, JWT_SECRET)
    → Creates valid, secure token
  
  jwt.verify(token, JWT_SECRET)
    → Successfully verifies token
    → protect middleware succeeds
    → req.user is set
    → Request proceeds
  
  Result: POST /api/admin/create-admin succeeds with 201
*/

// ============================================================================
// QUICK CHECKLIST
// ============================================================================

/*
Before running backend:
  ☐ Node.js installed (winget install OpenJS.NodeJS)
  ☐ .env file exists (C:\Users\infin\Downloads\echo-vault-backend\.env)
  ☐ JWT_SECRET defined in .env
  ☐ DATABASE_URL configured in .env

When starting backend:
  ☐ Run: npm run dev
  ☐ See: "EchoVault Server Started"
  ☐ See: "Database: Connected"
  ☐ See: "Listening on port 5000"

When testing endpoint:
  ☐ Login first: POST /api/auth/login
  ☐ Copy token from response
  ☐ Use token in Authorization header
  ☐ POST /api/admin/create-admin
  ☐ Receive 201 Created with admin data
*/

// ============================================================================
// FILES TO CHECK / CREATE
// ============================================================================

/*
CREATE:
  ✓ .env (in project root)
    Content: JWT_SECRET=... + other config

VERIFY:
  ✓ .env exists
  ✓ JWT_SECRET is set
  ✓ DATABASE_URL is correct
  ✓ NODE_ENV=development
  ✓ PORT=5000

CHECK:
  ✓ src/routes/adminRoutes.js (POST /create-admin route)
  ✓ src/controllers/adminController.js (createAdminUser handler)
  ✓ src/middlewares/authMiddleware.js (protect and authorize)
  ✓ src/utils/jwt.js (generateToken and verifyToken)
  ✓ src/controllers/authController.js (login handler)
*/

// ============================================================================
// NEXT STEPS
// ============================================================================

/*
1. INSTALL NODE.JS (if not already done)
   Open PowerShell as Administrator:
     winget install OpenJS.NodeJS
   Restart PowerShell

2. CREATE .env FILE
   In C:\Users\infin\Downloads\echo-vault-backend\
   Add the content shown in Part 1 above

3. START BACKEND
   cd C:\Users\infin\Downloads\echo-vault-backend
   npm install
   npm run dev
   
   Wait for:
     "EchoVault Server Started"
     "Database: Connected"

4. TEST IN NEW POWERSHELL WINDOW
   curl http://localhost:5000/api/health
   
   Expected: { "status": "healthy", ... }

5. USE THE ENDPOINT
   See the "Complete Workflow" section above

6. SUCCESS!
   Admin users can be created via POST /api/admin/create-admin
*/

// ============================================================================
// SUPPORT
// ============================================================================

/*
If you get errors:

Error: "npm is not recognized"
  → Node.js not installed
  → Run: winget install OpenJS.NodeJS
  → Restart PowerShell

Error: "Cannot find module..."
  → Dependencies not installed
  → Run: npm install

Error: "Port 5000 already in use"
  → Another app using port 5000
  → Kill process: netstat -ano | findstr :5000
  → Then: taskkill /PID [ID] /F

Error: "Database connection failed"
  → PostgreSQL not running or wrong URL
  → Check DATABASE_URL in .env
  → Start PostgreSQL service

Error: "JWT_SECRET is not set"
  → .env file missing JWT_SECRET
  → Edit .env and add: JWT_SECRET=echovault_jwt_secret_...
  → Restart backend

Error: "401 Unauthorized"
  → Token missing or invalid
  → Make sure to include: Authorization: Bearer [token]
  → Token must be from successful login
*/
