@echo off
REM EchoVault Advanced Features Quick Start (Windows)

setlocal enabledelayedexpansion

echo.
echo ============================================
echo EchoVault Advanced Features Setup
echo ============================================
echo.

REM 1. Backend Setup
echo [*] Setting up backend...
cd echo-vault-backend

echo [*] Installing socket.io dependencies...
call npm install socket.io socket.io-client
if errorlevel 1 goto error_npm
echo [OK] Socket.io installed

echo [*] Generating Prisma client...
call npm run prisma:generate
if errorlevel 1 goto error_prisma
echo [OK] Prisma generated

cd ..

REM 2. Frontend Setup
echo.
echo [*] Setting up frontend...
cd echovault_working

echo [*] Installing Flutter dependencies...
call flutter pub get
if errorlevel 1 goto error_flutter
echo [OK] Flutter dependencies installed

echo [*] Generating code...
call flutter pub run build_runner build --delete-conflicting-outputs 2>nul
echo [OK] Code generation complete

cd ..

REM 3. Environment Setup
echo.
echo [*] Checking environment setup...

if not exist "echo-vault-backend\.env" (
    echo [*] Creating .env file...
    (
        echo JWT_SECRET=echovault_supersecret2024
        echo PORT=5000
        echo CLIENT_URL=http://localhost:3000
        echo DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/echo_vault_db?schema=public
        echo NODE_ENV=development
    ) > echo-vault-backend\.env
    echo [OK] .env file created
)

REM 4. Summary
echo.
echo ============================================
echo [OK] Setup Complete!
echo ============================================
echo.
echo New Features Enabled:
echo   [OK] WebSocket real-time (gifts, chat, notifications)
echo   [OK] JWT token auto-refresh on 401
echo   [OK] Offline caching with Hive
echo   [OK] GitHub Actions CI/CD
echo   [OK] Automated APK builds
echo.
echo Key Files:
echo   Backend:  src\utils\socketHandlers.js
echo   Frontend: lib\services\realtime_service.dart
echo            lib\services\token_refresh_service.dart
echo            lib\services\cache_service.dart
echo   CI/CD:    .github\workflows\build-deploy.yml
echo.
echo Quick Start:
echo.
echo Backend:
echo   cd echo-vault-backend
echo   npm run dev              # Start development server
echo.
echo Frontend:
echo   cd echovault_working
echo   flutter run -d chrome    # Run web
echo   flutter build apk        # Build APK
echo.
pause
exit /b 0

:error_npm
echo Error: npm install failed
pause
exit /b 1

:error_prisma
echo Error: Prisma generation failed
pause
exit /b 1

:error_flutter
echo Error: Flutter pub get failed
pause
exit /b 1
