@echo off
REM Test login endpoint
echo Testing Admin Login...
powershell -Command "
`$body = @{email='akwera@gmail.com'; password='1234Abc!'} | ConvertTo-Json
`$response = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login-dashboard' -Method POST -Headers @{'Content-Type'='application/json'} -Body `$body -UseBasicParsing
`$cookies = `$response.Headers['Set-Cookie']
echo 'Status: '$response.StatusCode
echo 'Has Set-Cookie: '(`$cookies -ne `$null)
if (`$cookies) { echo 'Cookies: '$cookies }
"
pause
