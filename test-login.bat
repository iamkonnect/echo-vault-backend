@echo off
REM Test Dashboard Login

echo Testing Artist Login...
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login-dashboard' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"email\":\"artist@gmail.com\",\"password\":\"1234Abc!\",\"role\":\"ARTIST\"}' -MaximumRedirectCount 0 | Select-Object StatusCode"

echo.
echo Testing Admin Login...
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login-dashboard' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"email\":\"akwera@gmail.com\",\"password\":\"1234Abc!\",\"role\":\"ADMIN\"}' -MaximumRedirectCount 0 | Select-Object StatusCode"

echo.
echo Test complete!
pause
