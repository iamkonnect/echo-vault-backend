/**
 * THE ACTUAL FIX - POST http://localhost:5000/api/admin/create-admin
 * 
 * All the APIs and Tokens Involved
 */

// ============================================================================
// WHAT WAS BROKEN
// ============================================================================

/*
URL: http://localhost:5000/api/admin/create-admin
Method: POST
Headers: (probably missing)
Status: 401 / 500 / other error

Root Cause Chain:
  1. No .env file in project root
  2. process.env.JWT_SECRET = undefined
  3. jwt.verify() cannot verify tokens
  4. protect middleware fails
  5. req.user never set
  6. authorize middleware fails or req.user undefined
  7. Controller doesn't execute or has errors
  8. POST returns error instead of creating admin
*/

// ============================================================================
// THE COMPLETE FIX
// ============================================================================

// ISSUE #1: Missing .env file
// ─────────────────────────────

// BEFORE: No .env exists
/*
echo-vault-backend/
├── src/
├── package.json
├── server.js
└── (NO .env file)
*/

// AFTER: .env created with JWT_SECRET
// FILE: echo-vault-backend/.env
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

// ISSUE #2: APIs and Tokens Responsible
// ───────────────────────────────────────

/*
1. LOGIN API → Generates Token
   ───────────────────────────────
   
   Endpoint: POST /api/auth/login
   File: src/routes/authRoutes.js (line 18)
   Handler: src/controllers/authController.js → exports.login()
   
   Flow:
     a) Client sends email + password
     b) Server finds user in database
     c) Compares password with bcrypt
     d) Calls: generateToken(user.id, user.role)
     e) Returns: { token, user }
   
   Code:
     const token = generateToken(user.id, user.role);
     res.json({ token, user: userWithoutPassword });
   
   Response:
     {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": { "id": "...", "email": "...", "role": "ADMIN" }
     }


2. TOKEN GENERATION → Uses JWT_SECRET
   ────────────────────────────────────
   
   Function: generateToken(userId, role)
   File: src/utils/jwt.js (line 3)
   
   Code:
     const generateToken = (userId, role) => {
       return jwt.sign(
         { userId, role },
         process.env.JWT_SECRET,  ← MUST be set in .env
         { expiresIn: '7d' }
       );
     };
   
   Dependency: process.env.JWT_SECRET
     ├─ Reads from .env file
     ├─ If missing → undefined
     └─ If undefined → jwt.sign() fails


3. CREATE ADMIN API → Requires Token
   ─────────────────────────────────
   
   Endpoint: POST /api/admin/create-admin
   File: src/routes/adminRoutes.js (line 119)
   Route: router.post('/create-admin', protect, authorize(['ADMIN']), adminController.createAdminUser);
   
   Middleware Chain:
     a) protect middleware
     b) authorize(['ADMIN']) middleware
     c) createAdminUser handler
   
   Handler: src/controllers/adminController.js → exports.createAdminUser()
   
   Response on Success (201):
     {
       "success": true,
       "message": "Admin user created successfully",
       "data": { id, name, email, username, role, createdAt }
     }


4. PROTECT MIDDLEWARE → Verifies Token
   ─────────────────────────────────────
   
   File: src/middlewares/authMiddleware.js (lines 3-28)
   Function: const protect = async (req, res, next) => { ... }
   
   Flow:
     a) Extract token from Authorization header
        const token = req.headers.authorization.split(' ')[1];
     
     b) Call verifyToken(token)
        const decoded = verifyToken(token);
     
     c) Lookup user in database
        const user = await prisma.user.findUnique({ id: decoded.userId });
     
     d) Set req.user
        req.user = user;
     
     e) Call next() to proceed
        next();
   
   Error Handling:
     - If no token: res.status(401).json({ message: 'Not authorized' })
     - If invalid token: res.status(401).json({ message: 'Invalid token' })
   
   Critical Line:
     const decoded = verifyToken(token);  ← Uses jwt.verify()


5. TOKEN VERIFICATION → Uses JWT_SECRET
   ───────────────────────────────────────
   
   Function: verifyToken(token)
   File: src/utils/jwt.js (line 8)
   
   Code:
     const verifyToken = (token) => {
       return jwt.verify(
         token,
         process.env.JWT_SECRET  ← MUST match secret used in generation
       );
     };
   
   Returns: { userId, role, iat, exp }
   Throws Error if:
     ├─ Token tampered
     ├─ JWT_SECRET doesn't match
     └─ Token expired


6. AUTHORIZE MIDDLEWARE → Checks Role
   ───────────────────────────────────
   
   File: src/middlewares/authMiddleware.js (lines 50-59)
   Function: const authorize = (allowedRoles) => { ... }
   
   Flow:
     a) Check if req.user exists (set by protect middleware)
     b) Check if req.user.role in allowedRoles
     c) If not: res.status(403).json({ message: 'Access denied' })
     d) If yes: next() to proceed
   
   For admin routes: authorize(['ADMIN'])
     └─ Only users with role='ADMIN' can proceed
*/

// ============================================================================
// REQUEST-RESPONSE CYCLE
// ============================================================================

/*
1. CLIENT STEP: Login
   ───────────────────
   
   Request:
     POST /api/auth/login
     Content-Type: application/json
     
     { "email": "admin@test.com", "password": "password123" }
   
   Server Processing:
     1. Receives request
     2. Finds user by email in database
     3. Compares password: bcrypt.compare(password, user.password)
     4. Calls: generateToken(user.id, user.role)
     5. jwt.sign uses JWT_SECRET from .env
     6. Returns token
   
   Response:
     {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": {
         "id": "admin_user_id",
         "email": "admin@test.com",
         "role": "ADMIN"
       }
     }
   
   Client Action:
     Store token: localStorage.setItem('authToken', response.token)


2. CLIENT STEP: Prepare Create Admin Request
   ──────────────────────────────────────────
   
   Action:
     Get stored token: const token = localStorage.getItem('authToken')
     Format header: "Authorization: Bearer " + token
   
   Request:
     POST /api/admin/create-admin
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     Content-Type: application/json
     
     {
       "name": "Manager User",
       "email": "manager@test.com",
       "username": "manager123",
       "password": "SecurePassword123!",
       "confirmPassword": "SecurePassword123!",
       "role": "MANAGER"
     }


3. SERVER STEP: protect Middleware
   ────────────────────────────────
   
   Processing:
     a) Extract token from header
        token = req.headers.authorization.split(' ')[1]
        └─ Result: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     
     b) Verify token
        decoded = jwt.verify(token, process.env.JWT_SECRET)
        └─ JWT_SECRET MUST match the secret used to generate token
        └─ If match: returns { userId: "...", role: "ADMIN", iat: ..., exp: ... }
        └─ If no match: throws error
     
     c) Lookup user
        user = await prisma.user.findUnique({ id: decoded.userId })
        └─ Result: { id: "...", email: "admin@test.com", role: "ADMIN", ... }
     
     d) Set req.user
        req.user = user
     
     e) Call next()
        next()  ← Proceed to authorize middleware


4. SERVER STEP: authorize(['ADMIN']) Middleware
   ──────────────────────────────────────────────
   
   Processing:
     a) Check user exists
        if (!req.user)  └─ Should exist from protect middleware
     
     b) Check role
        if (allowedRoles.includes(req.user.role))
        └─ Check if 'ADMIN' includes req.user.role='ADMIN'
        └─ Result: true
     
     c) Call next()
        next()  ← Proceed to controller


5. SERVER STEP: createAdminUser Controller
   ────────────────────────────────────────
   
   Processing:
     a) req.user is set: { id: "...", email: "admin@test.com", role: "ADMIN" }
     b) req.body has data: { name, email, username, password, role }
     
     c) Validate:
        ├─ All fields present
        ├─ Password matches confirmPassword
        ├─ Password >= 8 characters
        ├─ Email not already in use
        └─ Username not already in use
     
     d) Hash password: bcrypt.hash(password, 10)
     
     e) Create in database:
        const newAdmin = await prisma.user.create({
          data: { name, email, username, password: hashed, role }
        })
     
     f) Log action:
        console.log(`✅ New admin created: ${newAdmin.name} by ${req.user.email}`)
     
     g) Return response:
        res.status(201).json({
          success: true,
          message: "Admin user '...' created successfully",
          data: newAdmin
        })


6. RESPONSE: Success
   ──────────────────
   
   Status: 201 Created
   Body:
     {
       "success": true,
       "message": "Admin user 'Manager User' with role 'MANAGER' created successfully",
       "data": {
         "id": "new_admin_uuid",
         "name": "Manager User",
         "email": "manager@test.com",
         "username": "manager123",
         "role": "MANAGER",
         "createdAt": "2026-05-27T15:45:30.000Z"
       }
     }
*/

// ============================================================================
// THE JWT_SECRET - WHY IT MATTERS
// ============================================================================

/*
JWT_SECRET is the symmetric key used to sign and verify tokens.

Token Generation (Login):
  jwt.sign(payload, JWT_SECRET, options)
  └─ Signature = HMAC-SHA256(header.payload, JWT_SECRET)
  └─ Token = base64(header).base64(payload).base64(signature)

Token Verification (Create Admin):
  jwt.verify(token, JWT_SECRET)
  └─ Extract signature from token
  └─ Recompute: HMAC-SHA256(header.payload, JWT_SECRET)
  └─ Compare computed signature with extracted signature
  └─ If match: token is valid
  └─ If no match: token is invalid

Security Implication:
  - Only the server knows JWT_SECRET
  - Server can generate tokens
  - Server can verify tokens
  - Client CANNOT forge tokens (doesn't know JWT_SECRET)
  - If JWT_SECRET leaks: Security compromised


Without JWT_SECRET in .env:
  process.env.JWT_SECRET = undefined
  
  jwt.sign(payload, undefined, ...)
    └─ Creates token with undefined key
    └─ Token is weak or invalid
  
  jwt.verify(token, undefined)
    └─ Cannot verify because key is undefined
    └─ Throws error: "secretOrPublicKey must be an asymmetric key"
    └─ protect middleware fails
    └─ Request never reaches controller
    └─ User gets 401 "Not authorized"
*/

// ============================================================================
// EXACT SOLUTION
// ============================================================================

/*
Step 1: Create .env file (if doesn't exist)
Location: echo-vault-backend/.env
Content:
  JWT_SECRET=echovault_jwt_secret_key_2024_change_in_production_12345
  (plus other variables shown above)

Step 2: Restart backend
  npm run dev

Step 3: Test login
  POST http://localhost:5000/api/auth/login
  Body: { "email": "admin@test.com", "password": "password123" }
  Get token from response

Step 4: Test create admin
  POST http://localhost:5000/api/admin/create-admin
  Headers: Authorization: Bearer {token}
  Body: { name, email, username, password, confirmPassword, role }
  Should get 201 Created with new admin data

That's it! The endpoint now works.
*/

// ============================================================================
// VERIFICATION
// ============================================================================

/*
✓ .env file exists in echo-vault-backend/
✓ JWT_SECRET=... is defined in .env
✓ Backend is restarted (npm run dev)
✓ Can login and get JWT token
✓ Token starts with "eyJ"
✓ POST /api/admin/create-admin returns 201
✓ New admin appears in database
✓ New admin can login with provided credentials
*/
