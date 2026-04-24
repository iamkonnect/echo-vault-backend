@echo off
REM EchoVault Quick Start Testing Script (Windows)

echo.
echo ============================================================
echo         EchoVault Backend ^& Flutter Integration Test
echo ============================================================
echo.

REM Check if Docker is running
echo [1/6] Checking Docker status...
docker ps > nul 2>&1
if errorlevel 1 (
    echo X Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Navigate to backend directory
set BACKEND_DIR=C:\Users\infin\Desktop\echo-vault-backend
if not exist "%BACKEND_DIR%" (
    echo X Backend directory not found at %BACKEND_DIR%
    pause
    exit /b 1
)

REM Verify .env exists
if not exist "%BACKEND_DIR%\.env" (
    echo [WARN] .env file not found. Creating from template...
    echo DATABASE_URL=postgresql://postgres:yourpassword@db:5432/echo_vault_db?schema=public > "%BACKEND_DIR%\.env"
    echo JWT_SECRET=your_super_secret_jwt_key_123 >> "%BACKEND_DIR%\.env"
    echo NODE_ENV=development >> "%BACKEND_DIR%\.env"
)

REM Start Docker Compose
echo [2/6] Starting Docker Compose (PostgreSQL + Node.js)...
cd /d "%BACKEND_DIR%"
docker-compose down > nul 2>&1
docker-compose up -d
echo [WAIT] Waiting for services to start (30 seconds)...
timeout /t 30 /nobreak

REM Check if services are running
echo.
echo [3/6] Verifying services...
docker-compose ps db | find "Up" > nul
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is running
) else (
    echo X PostgreSQL failed to start
    docker-compose logs db
    pause
    exit /b 1
)

docker-compose ps backend | find "Up" > nul
if %errorlevel% equ 0 (
    echo [OK] Node.js API is running
) else (
    echo X Node.js API failed to start
    docker-compose logs app
    pause
    exit /b 1
)
echo.

REM Test API with curl
echo [4/6] Testing Backend API...
for /f "tokens=*" %%A in ('curl -s -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{ \"email\": \"test@echovault.local\", \"password\": \"testpass123\", \"name\": \"Test User\", \"role\": \"ARTIST\" }"') do (
    set RESPONSE=%%A
)

echo %RESPONSE% | find "token" > nul
if %errorlevel% equ 0 (
    echo [OK] API is responding correctly
    echo.
    echo Response: %RESPONSE%
) else (
    echo X API is not responding correctly
    echo Response: %RESPONSE%
    pause
    exit /b 1
)
echo.

REM Flutter Setup
echo [5/6] Flutter App Setup...
set FLUTTER_DIR=C:\Users\infin\Downloads\echovault_working
if exist "%FLUTTER_DIR%" (
    cd /d "%FLUTTER_DIR%"
    echo [RUN] flutter pub get
    call flutter pub get > nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Flutter dependencies installed
    ) else (
        echo X Flutter dependency installation failed
    )
) else (
    echo [WARN] Flutter directory not found at %FLUTTER_DIR%
)
echo.

REM Summary
echo ============================================================
echo              ^!^! Testing Complete ^^!
echo ============================================================
echo.
echo NEXT STEPS:
echo.
echo 1. Start Flutter App:
echo    cd C:\Users\infin\Downloads\echovault_working
echo    flutter run
echo.
echo 2. Test Authentication:
echo    - Register with new account
echo    - Verify token is saved locally
echo    - Close and reopen app ^(token should persist^)
echo.
echo 3. Test Artist Dashboard:
echo    - Login as artist role
echo    - View stats ^(Total Plays, Earnings, Balance^)
echo    - Request a withdrawal
echo.
echo 4. Use Postman for advanced testing:
echo    - Import: %BACKEND_DIR%\EchoVault_API_Testing.postman_collection.json
echo    - Test all endpoints with Bearer token
echo.
echo BACKEND STATUS:
echo    - API: http://localhost:5000
echo    - Database: localhost:5432
echo    - Docs: See TESTING_GUIDE.md
echo.
echo STOP SERVICES: docker-compose down
echo.
pause
