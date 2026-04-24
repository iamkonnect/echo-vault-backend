@echo off
REM EchoVault API - Collection Runner
REM Quickly run Postman collections from command line

setlocal enabledelayedexpansion

set COLLECTION_PATH=postman\collections\EchoVault API.json
set ENVIRONMENT_PATH=postman\environments\EchoVault Local.json

REM Check if collection exists
if not exist "%COLLECTION_PATH%" (
    echo Error: Collection not found at %COLLECTION_PATH%
    pause
    exit /b 1
)

if not exist "%ENVIRONMENT_PATH%" (
    echo Error: Environment not found at %ENVIRONMENT_PATH%
    pause
    exit /b 1
)

REM Check if Newman is installed
where newman >nul 2>nul
if %errorlevel% neq 0 (
    echo Newman not found. Installing...
    npm install -g newman
)

echo.
echo ====================================================
echo   EchoVault API - Collection Runner
echo ====================================================
echo.
echo Select test option:
echo [1] Run Full Collection
echo [2] Run Auth Tests Only
echo [3] Run Artist Tests Only
echo [4] Run Admin Tests Only
echo [5] Run with HTML Report
echo [6] Run with Performance Timing
echo [0] Exit
echo.
set /p choice="Enter choice [0-6]: "

if "%choice%"=="0" goto :eof
if "%choice%"=="1" goto :runFull
if "%choice%"=="2" goto :runAuth
if "%choice%"=="3" goto :runArtist
if "%choice%"=="4" goto :runAdmin
if "%choice%"=="5" goto :runReport
if "%choice%"=="6" goto :runPerf
goto :invalid

:runFull
echo.
echo Running full collection...
newman run "%COLLECTION_PATH%" -e "%ENVIRONMENT_PATH%" -r cli,json
pause
goto :eof

:runAuth
echo.
echo Running Auth tests only...
newman run "%COLLECTION_PATH%" -e "%ENVIRONMENT_PATH%" --folder "Auth" -r cli
pause
goto :eof

:runArtist
echo.
echo Running Artist tests only...
newman run "%COLLECTION_PATH%" -e "%ENVIRONMENT_PATH%" --folder "Artist" -r cli
pause
goto :eof

:runAdmin
echo.
echo Running Admin tests only...
newman run "%COLLECTION_PATH%" -e "%ENVIRONMENT_PATH%" --folder "Admin" -r cli
pause
goto :eof

:runReport
echo.
echo Running collection with HTML report...
newman run "%COLLECTION_PATH%" -e "%ENVIRONMENT_PATH%" ^
  -r html --reporter-html-export "api-test-report.html"
echo.
echo Report generated: api-test-report.html
echo Opening in browser...
start api-test-report.html
pause
goto :eof

:runPerf
echo.
echo Running with performance metrics...
newman run "%COLLECTION_PATH%" -e "%ENVIRONMENT_PATH%" ^
  -r cli,json --reporter-json-export "perf-results.json"
echo.
echo Performance data saved: perf-results.json
pause
goto :eof

:invalid
echo Invalid choice. Please try again.
pause
cls
goto :start
