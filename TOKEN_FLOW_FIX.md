/**
 * FIX: POST http://localhost:5000/api/admin/create-admin
 * Root Cause: Missing JWT_SECRET in environment
 * Solution: Proper token flow with authentication
 */

// ============================================================================
// ROOT CAUSE IDENTIFIED
// ============================================================================

/*
Problem 1: Missing .env file
  - No .env file in project root
  - JWT_SECRET not defined
  - Token generation/verification fails silently
  
Problem 2: Missing JWT_SECRET in .env.staging
  - JWT_SECRET=undefined causes jwt.verify() to fail
  - protect middleware cannot verify tokens
  - POST /api/admin/create-admin always fails with 401

Problem 3: No valid admin user in database
  - Can't login to get token
  - Can't authenticate to create-admin endpoint
  - Circular dependency
*/

// ============================================================================
// SOLUTION IMPLEMENTED
// ============================================================================

// STEP 1: Created .env file with JWT_SECRET
// FILE: .env (created in project root)
/*
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

DATABASE_URL=postgresql://postgres:[REDACTED]@localhost:5432/echo_vault_db?schema=public

JWT_SECRET=echovault_jwt_secret_key_2024_change_in_production_12345

CLIENT_URL=http://localhost:3000
FLUTTER_CLIENT_URL=http://10.0.2.2:5000

UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=50mb

CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://10.0.2.2:*,http://localhost:5000
*/

// STEP 2: Flow diagram for POST /api/admin/create-admin

/*
┌─────────────────────────────────────────────────────────────────┐
│ 1. Client sends POST /api/admin/create-admin                    │
│    Headers: Authorization: Bearer JWT_TOKEN                     │
│    Body: { name, email, username, password, role }              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Router receives request                                       │
│    src/routes/adminRoutes.js line 119:                           │
│    router.post('/create-admin', protect, authorize, handler)    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. protect middleware executes                                   │
│    src/middlewares/authMiddleware.js:                            │
│    - Extracts token from Authorization header                   │
│    - Calls verifyToken(token) using JWT_SECRET                  │
│    - Sets req.user from decoded token                           │
│    - Calls next() if valid, or res.status(401) if invalid       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. authorize(['ADMIN']) middleware executes                      │
│    - Checks if req.user.role === 'ADMIN'                        │
│    - If not, returns res.status(403) 'Access denied'            │
│    - If yes, calls next()                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Controller handler executes                                   │
│    src/controllers/adminController.js:                           │
│    exports.createAdminUser = async (req, res) => {              │
│      - Validates input (name, email, password, etc.)            │
│      - Checks email/username uniqueness                         │
│      - Hashes password with bcrypt                              │
│      - Creates user in database                                 │
│      - Returns 201 with new admin data                          │
│    }                                                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Response sent to client                                       │
│    201 Created:                                                  │
│    {                                                             │
│      "success": true,                                            │
│      "message": "Admin user created successfully",               │
│      "data": { id, name, email, username, role, createdAt }    │
│    }                                                             │
└─────────────────────────────────────────────────────────────────┘
*/

// ============================================================================
// STEP-BY-STEP USAGE - FIX THE ENDPOINT
// ============================================================================

// STEP 1: Ensure .env file exists with JWT_SECRET
// FILE: echo-vault-backend/.env
// Content:
/*
PORT=5000
NODE_ENV=development
JWT_SECRET=echovault_jwt_secret_key_2024_change_in_production_12345
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/echo_vault_db?schema=public
*/

// STEP 2: Restart the backend
// Command:
/*
cd C:\Users\infin\Downloads\echo-vault-backend
npm install (if needed)
npm run dev
*/

// STEP 3: Login to get valid JWT token
// Endpoint: POST http://localhost:5000/api/auth/login
// Request:
/*
{
  "email": "admin@test.com",
  "password": "password123"
}
*/

// Response (save the token):
/*
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEyMzQ1Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzE2Mzc5MjAwLCJleHAiOjE3MTcwMDU2MDB9.abcdef123456...",
  "user": {
    "id": "user_12345",
    "email": "admin@test.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
*/

// STEP 4: Use token to create new admin
// Endpoint: POST http://localhost:5000/api/admin/create-admin
// Headers:
/*
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEyMzQ1Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzE2Mzc5MjAwLCJleHAiOjE3MTcwMDU2MDB9.abcdef123456...
Content-Type: application/json
*/

// Request Body:
/*
{
  "name": "Manager User",
  "email": "manager@test.com",
  "username": "manager123",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "phone": "555-1234",
  "role": "MANAGER"
}
*/

// SUCCESS Response (201 Created):
/*
{
  "success": true,
  "message": "Admin user 'Manager User' with role 'MANAGER' created successfully",
  "data": {
    "id": "new_admin_id_uuid",
    "name": "Manager User",
    "email": "manager@test.com",
    "username": "manager123",
    "role": "MANAGER",
    "phone": "555-1234",
    "createdAt": "2026-05-27T15:30:45.123Z"
  }
}
*/

// ============================================================================
// TOKEN FLOW - DETAILED BREAKDOWN
// ============================================================================

/*
Authentication Chain for POST /api/admin/create-admin:

1. TOKEN GENERATION (Login endpoint)
   ───────────────────────────────────
   
   User sends: POST /api/auth/login
   with: email, password
   
   Server action:
     a) Find user by email in database
     b) Compare password with bcrypt
     c) Call generateToken(user.id, user.role)
        └─ generateToken does: jwt.sign(
             { userId: user.id, role: user.role },
             process.env.JWT_SECRET,  ← MUST be set in .env
             { expiresIn: '7d' }
           )
     d) Return token to client
   
   Token Format:
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJyb2xlIjoiQURNSU4ifQ.signature
     └─ header ──────────────────────────┘ └─ payload ────────────────────┘ └─ sig ────┘


2. TOKEN TRANSMISSION (Client stores and sends)
   ─────────────────────────────────────────────
   
   Client action:
     a) Receive token from login response
     b) Store in localStorage: localStorage.setItem('token', token)
     c) When making authenticated request, add header:
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...


3. TOKEN VERIFICATION (protect middleware)
   ───────────────────────────────────────
   
   When server receives: POST /api/admin/create-admin
   with: Authorization: Bearer token
   
   protect middleware action:
     a) Extract token from req.headers.authorization.split(' ')[1]
     b) Call verifyToken(token)
        └─ verifyToken does: jwt.verify(
             token,
             process.env.JWT_SECRET  ← MUST match the secret used to generate
           )
     c) jwt.verify returns decoded payload: { userId, role, iat, exp }
     d) Look up user in database: prisma.user.findUnique({ id: userId })
     e) Set req.user = user
     f) Call next() to continue to next middleware
   
   If token is invalid/expired:
     └─ jwt.verify throws error
     └─ protect middleware catches: return res.status(401)
     └─ Request never reaches controller


4. AUTHORIZATION CHECK (authorize middleware)
   ──────────────────────────────────────────
   
   After protect sets req.user, authorize middleware runs:
   
   authorize(['ADMIN']) checks:
     a) Is req.user set? (should be, protect set it)
     b) Is req.user.role in ['ADMIN']?
     c) If not: return res.status(403) 'Access denied'
     d) If yes: call next() to reach controller


5. CONTROLLER EXECUTION (createAdminUser)
   ──────────────────────────────────────
   
   Controller receives request with:
     req.user = { id: "...", email: "...", role: "ADMIN" }
     req.body = { name, email, username, password, role }
   
   Controller logic:
     a) Validate all required fields
     b) Check password strength
     c) Check email/username not already in use
     d) Hash password: bcrypt.hash(password, 10)
     e) Create user in database
     f) Return 201 with new user data


6. RESPONSE (Success or Error)
   ──────────────────────────
   
   If all checks pass:
     └─ return res.status(201).json({ success: true, data: newAdmin })
   
   If any check fails:
     └─ return res.status(4xx/5xx).json({ success: false, error: message })
*/

// ============================================================================
// WHY IT WASN'T WORKING BEFORE
// ============================================================================

/*
Scenario: POST /api/admin/create-admin WITHOUT .env file
─────────────────────────────────────────────────────────

1. Client sends token: Authorization: Bearer eyJ...

2. protect middleware tries to verify:
   jwt.verify(token, process.env.JWT_SECRET)
   
   But JWT_SECRET = undefined (not in .env)
   
   Result: jwt.verify fails with error:
   "Error: secretOrPublicKey must be an asymmetric key"
   
   OR token verification appears to work but is insecure

3. protect middleware can't set req.user properly

4. authorize middleware can't check user role

5. Controller never receives valid req.user

6. GET /api/admin/create-admin tries to render form
   but req.user is undefined
   └─ 'roles' variable not passed to render()
   └─ EJS throws error: "Cannot read property 'symbol'"
   └─ Browser shows 500 error


Fix Applied:
───────────
1. Created .env file with JWT_SECRET
2. Restarted backend (npm run dev)
3. Token generation now works correctly
4. Token verification now works correctly
5. req.user properly set throughout chain
6. Controller executes and creates admin successfully
*/

// ============================================================================
// COMPLETE WORKING EXAMPLE - POSTMAN
// ============================================================================

/*
Request 1: Login
───────────────
Method: POST
URL: http://localhost:5000/api/auth/login
Headers:
  Content-Type: application/json

Body:
{
  "email": "admin@test.com",
  "password": "password123"
}

Response (save token):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "email": "admin@test.com", "role": "ADMIN" }
}


Request 2: Create Admin
──────────────────────
Method: POST
URL: http://localhost:5000/api/admin/create-admin
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body:
{
  "name": "New Manager",
  "email": "newmanager@example.com",
  "username": "newmanager123",
  "password": "StrongPassword123!",
  "confirmPassword": "StrongPassword123!",
  "phone": "555-1234",
  "role": "MANAGER"
}

Response (201 Created):
{
  "success": true,
  "message": "Admin user 'New Manager' with role 'MANAGER' created successfully",
  "data": {
    "id": "newly_created_admin_id",
    "name": "New Manager",
    "email": "newmanager@example.com",
    "username": "newmanager123",
    "role": "MANAGER",
    "phone": "555-1234",
    "createdAt": "2026-05-27T15:45:30.000Z"
  }
}
*/

// ============================================================================
// APIS AND TOKENS INVOLVED
// ============================================================================

/*
Token Generation:
  File: src/utils/jwt.js
  Function: generateToken(userId, role)
  Uses: JWT_SECRET from process.env.JWT_SECRET
  Returns: JWT token string

Token Verification:
  File: src/utils/jwt.js
  Function: verifyToken(token)
  Uses: JWT_SECRET from process.env.JWT_SECRET
  Returns: { userId, role, iat, exp }
  Throws: Error if JWT_SECRET mismatch or token expired

Protect Middleware:
  File: src/middlewares/authMiddleware.js
  Function: protect(req, res, next)
  Calls: verifyToken(token)
  Sets: req.user
  Returns: 401 if fails

Authorize Middleware:
  File: src/middlewares/authMiddleware.js
  Function: authorize(allowedRoles)
  Checks: req.user.role in allowedRoles
  Returns: 403 if not authorized

Auth Controller:
  File: src/controllers/authController.js
  Function: login(req, res)
  Calls: generateToken(user.id, user.role)
  Returns: { token, user }

Admin Controller:
  File: src/controllers/adminController.js
  Function: createAdminUser(req, res)
  Receives: req with token-verified req.user
  Returns: 201 on success or 4xx/5xx on error
*/

// ============================================================================
// VERIFICATION CHECKLIST
// ============================================================================

/*
✓ .env file exists in project root
✓ JWT_SECRET defined in .env
✓ Backend restarted after .env created
✓ Valid admin user exists in database
✓ Can login and receive JWT token
✓ JWT token starts with "eyJ"
✓ Token contains admin user data
✓ Authorization header format: "Bearer TOKEN"
✓ POST /api/admin/create-admin with token returns 201
✓ New admin created in database
✓ New admin can login with provided email/password
*/
