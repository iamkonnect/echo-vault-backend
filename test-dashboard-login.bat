@echo off
REM Test Dashboard Login

echo Testing Dashboard Login (should redirect to dashboard)...
echo.

curl -X POST http://localhost:5000/api/auth/login-dashboard ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"akwera@gmail.com\",\"password\":\"1234Abc!\"}" ^
  -v

echo.
echo.
echo If you see HTML content above, the dashboard loaded successfully!
echo Now visit: http://localhost:5000/ to log in via the split-screen portal
pause
