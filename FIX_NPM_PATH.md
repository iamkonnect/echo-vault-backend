/**
 * FIX: npm not recognized even after installation
 * Solution: Add Node.js to PATH
 */

// ============================================================================
// QUICK FIX - Add Node.js to PATH
// ============================================================================

/*
PowerShell (as Administrator):

1. Add Node.js to current session:
   $env:PATH += ";C:\Program Files\nodejs"

2. Verify npm is now available:
   npm --version

3. Now run:
   npm run dev

After restart, you need to do step 1 again (temporary).
To make it permanent, see "Permanent Fix" below.
*/

// ============================================================================
// PERMANENT FIX - Add to System PATH
// ============================================================================

/*
Option A: Using PowerShell (as Administrator)

1. Open PowerShell as Administrator

2. Add Node.js to System PATH permanently:
   [Environment]::SetEnvironmentVariable(
     "PATH",
     [Environment]::GetEnvironmentVariable("PATH","Machine") + ";C:\Program Files\nodejs",
     "Machine"
   )

3. Restart PowerShell completely (close and reopen)

4. Verify:
   npm --version
   node --version


Option B: Using GUI

1. Right-click "This PC" or "My Computer"
2. Click "Properties"
3. Click "Advanced system settings"
4. Click "Environment Variables"
5. Under "System variables", find "Path"
6. Click "Edit"
7. Click "New"
8. Add: C:\Program Files\nodejs
9. Click OK three times
10. Restart PowerShell
11. Test: npm --version
*/

// ============================================================================
// IMMEDIATE SOLUTION (Do this now)
// ============================================================================

/*
In PowerShell (you can use regular user, not admin for this):

1. Run these commands one by one:

   # Add Node.js to current PATH
   $env:PATH += ";C:\Program Files\nodejs"
   
   # Verify it worked
   npm --version
   
   Expected output:
   10.2.4
   (or similar version number)

2. If that worked, run:
   cd C:\Users\infin\Downloads\echo-vault-backend
   npm install
   npm run dev

3. You should see:
   ✓ EchoVault Server Started
   ✓ Listening on port 5000
*/

// ============================================================================
// STEP-BY-STEP INSTRUCTIONS
// ============================================================================

/*
Step 1: Open PowerShell (regular window, not admin)

Step 2: Copy and paste this command:
   $env:PATH += ";C:\Program Files\nodejs"

Step 3: Check if npm works:
   npm --version

Step 4: If you see a version number (like 10.2.4), proceed:
   cd C:\Users\infin\Downloads\echo-vault-backend
   
Step 5: Install dependencies:
   npm install
   
   (This takes 2-5 minutes, wait for it to finish)

Step 6: Start the backend:
   npm run dev
   
   Expected output should show:
   ╔════════════════════════════════════╗
   ║  🎵 EchoVault Server Started       ║
   ╚════════════════════════════════════╝
   Environment: development
   Host: http://0.0.0.0:5000
   Database: Connected

Step 7: SUCCESS!
   Backend is running
   Open new PowerShell window and test:
   curl http://localhost:5000/api/health
*/

// ============================================================================
// IF ABOVE DOESN'T WORK - ALTERNATIVE METHOD
// ============================================================================

/*
Use Node directly with full path:

cd "C:\Users\infin\Downloads\echo-vault-backend"

"C:\Program Files\nodejs\npm.cmd" install

"C:\Program Files\nodejs\npm.cmd" run dev

This forces PowerShell to use npm with full path.
*/

// ============================================================================
// COMPLETE QUICK FIX SCRIPT
// ============================================================================

/*
Copy and paste all of this into PowerShell:

$env:PATH += ";C:\Program Files\nodejs"
cd "C:\Users\infin\Downloads\echo-vault-backend"
npm --version
npm install
npm run dev

Then wait for:
"EchoVault Server Started"
"Database: Connected"
"Listening on port 5000"
*/

// ============================================================================
// VERIFY IT'S WORKING
// ============================================================================

/*
Once backend is running (npm run dev is showing the server message):

Open NEW PowerShell window and run:

curl http://localhost:5000/api/health

Expected response:
{"status":"healthy","uptime":12.345,"environment":"development"}

If you see this JSON, backend is working!
*/

// ============================================================================
// THEN USE THE ENDPOINTS
// ============================================================================

/*
In a new PowerShell window:

1. Login to get token:

curl -Method POST http://localhost:5000/api/auth/login `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"admin@test.com","password":"password123"}'

Save the "token" from response.

2. Create new admin:

$token = "eyJ..." # Paste token here

curl -Method POST http://localhost:5000/api/admin/create-admin `
  -Headers @{
    "Authorization"="Bearer $token"
    "Content-Type"="application/json"
  } `
  -Body '{
    "name":"Manager",
    "email":"mgr@test.com",
    "username":"mgr123",
    "password":"SecurePass123!",
    "confirmPassword":"SecurePass123!",
    "role":"MANAGER"
  }'

Expected response (201):
{"success":true,"message":"Admin user created...","data":{...}}
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
Problem: "npm is still not recognized"
Solution:
  1. Make sure you ran: $env:PATH += ";C:\Program Files\nodejs"
  2. Verify Node.js exists: Get-ChildItem "C:\Program Files\nodejs"
  3. If not there, Node.js installation failed
  4. Reinstall: winget install OpenJS.NodeJS --force
  5. Then add to PATH again

Problem: "npm install fails with permission error"
Solution:
  1. Open PowerShell as Administrator
  2. Try: npm install --force
  3. If still fails, delete node_modules and try again:
     Remove-Item -Recurse "node_modules"
     npm install

Problem: "npm run dev shows error"
Solution:
  1. Make sure .env file exists and has JWT_SECRET
  2. Check: Get-Content ".env" | Select-String "JWT_SECRET"
  3. If missing, add JWT_SECRET to .env
  4. Try npm run dev again

Problem: "Port 5000 already in use"
Solution:
  1. Find process using port 5000:
     netstat -ano | findstr :5000
  2. Kill it:
     taskkill /PID [ID_NUMBER] /F
  3. Try npm run dev again
*/

// ============================================================================
// PERMANENT PATH FIX (So you don't need to do this again)
// ============================================================================

/*
Run this ONCE in PowerShell as Administrator:

[Environment]::SetEnvironmentVariable(
  "PATH",
  [Environment]::GetEnvironmentVariable("PATH","Machine") + ";C:\Program Files\nodejs",
  "Machine"
)

Then CLOSE all PowerShell windows and restart them.

After this, npm will always be available.
*/

// ============================================================================
// SUMMARY
// ============================================================================

/*
Current Status:
  ✓ Node.js installed at C:\Program Files\nodejs
  ✗ npm not in PowerShell PATH
  
Quick Fix:
  1. Add to PATH: $env:PATH += ";C:\Program Files\nodejs"
  2. Verify: npm --version
  3. Run: npm run dev
  
Expected Result:
  ✓ Backend starts
  ✓ Listens on port 5000
  ✓ Database connected
  ✓ Ready for API calls

Then:
  ✓ Login to get token
  ✓ Create admin with token
  ✓ Success!
*/
