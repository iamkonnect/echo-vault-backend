@echo off
REM EchoVault Full-Stack Setup Script for Windows
REM This script sets up both frontend and backend for local development

setlocal enabledelayedexpansion

echo.
echo ============================================
echo EchoVault Full-Stack Setup
echo ============================================
echo.

REM Check prerequisites
echo Checking prerequisites...

where node >nul 2>nul
if errorlevel 1 (
    echo Warning: Node.js not found. Please install Node.js 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION%

where npm >nul 2>nul
if errorlevel 1 (
    echo Warning: npm not found. Please install npm
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION%

where flutter >nul 2>nul
if errorlevel 1 (
    echo Warning: Flutter not found. Please install Flutter SDK
    exit /b 1
)
echo [OK] Flutter installed

echo.
echo Starting backend setup...
echo.

REM Backend setup
if exist "echo-vault-backend" (
    cd echo-vault-backend
) else if exist "..\echo-vault-backend" (
    cd ..\echo-vault-backend
) else (
    echo Error: Backend directory not found
    exit /b 1
)

REM Install dependencies
echo Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo Error: Failed to install backend dependencies
    exit /b 1
)
echo [OK] Backend dependencies installed

REM Check for .env file
if not exist ".env" (
    echo Creating .env file...
    (
        echo JWT_SECRET=echovault_supersecret2024
        echo PORT=5000
        echo CLIENT_URL=http://localhost:3000
        echo DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/echo_vault_db?schema=public
        echo NODE_ENV=development
    ) > .env
    echo [OK] .env file created
)

REM Prisma setup
echo Setting up Prisma...
call npm run prisma:generate
echo [OK] Prisma generated

echo.
echo Starting frontend setup...
echo.

REM Frontend setup
cd ..
if exist "echovault_working" (
    cd echovault_working
) else if exist "..\echovault_working" (
    cd ..\echovault_working
) else (
    echo Error: Frontend directory not found
    exit /b 1
)

REM Get dependencies
echo Installing frontend dependencies...
call flutter pub get
if errorlevel 1 (
    echo Error: Failed to install frontend dependencies
    exit /b 1
)
echo [OK] Frontend dependencies installed

REM Generate code
echo Generating code...
call flutter pub run build_runner build --delete-conflicting-outputs 2>nul || echo [WARNING] Code generation skipped
echo [OK] Code generation completed

echo.
echo ============================================
echo [OK] Setup Complete!
echo ============================================
echo.
echo Next steps:
echo.
echo Start Backend (from backend directory):
echo     npm run dev
echo.
echo Start Frontend Web (from frontend directory):
echo     flutter run -d chrome
echo.
echo Start Frontend Mobile (from frontend directory):
echo     flutter run
echo.
echo Or use Docker Compose (from backend directory):
echo     docker-compose -f docker-compose-dev.yml up
echo.

pause
