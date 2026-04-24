@echo off
REM Test EchoVault API

setlocal enabledelayedexpansion

echo Testing EchoVault API on localhost:5000...
echo.

REM Test Login
echo [1] Testing Login...
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"akwera@gmail.com\",\"password\":\"password123\"}"

echo.
echo.
echo [2] Testing Register...
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"testartist@example.com\",\"password\":\"password123\",\"name\":\"Test Artist\"}"

echo.
pause
