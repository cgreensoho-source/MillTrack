@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   MillTrack Monorepo - One-Click Environment Setup
echo ===================================================
cd /d "%~dp0"

echo.
echo [1/4] Checking System Prerequisites...
echo ---------------------------------------------------
where git >nul 2>nul
if %errorlevel% equ 0 (
    echo   [OK] Git is installed
) else (
    echo   [MISSING] Git is not found in PATH!
)

where go >nul 2>nul
if %errorlevel% equ 0 (
    echo   [OK] Go is installed
) else (
    echo   [MISSING] Go compiler is not found in PATH! (Download from https://go.dev/dl/)
)

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo   [OK] Node.js is installed
) else (
    echo   [MISSING] Node.js is not found in PATH! (Download from https://nodejs.org/)
)

where flutter >nul 2>nul
if %errorlevel% equ 0 (
    echo   [OK] Flutter is installed
) else (
    echo   [MISSING] Flutter SDK is not found in PATH! (Download from https://docs.flutter.dev/get-started/install)
)

echo.
echo [2/4] Setting Up Backend (Go Fiber)...
echo ---------------------------------------------------
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo   [CREATED] Copied backend\.env.example to backend\.env
        echo   [ACTION REQUIRED] Please edit backend\.env with your real PostgreSQL credentials!
    )
) else (
    echo   [EXISTS] backend\.env already exists.
)

where go >nul 2>nul
if %errorlevel% equ 0 (
    echo   Downloading Go modules...
    cd backend
    go mod download
    cd ..
    echo   [OK] Backend dependencies ready!
) else (
    echo   [SKIPPED] Go is not installed. Run 'go mod download' manually in backend/ later.
)

echo.
echo [3/4] Setting Up Web Admin (React Vite)...
echo ---------------------------------------------------
where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo   Installing npm packages in web-admin/...
    cd web-admin
    call npm.cmd install
    cd ..
    echo   [OK] Web Admin dependencies installed!
) else (
    echo   [SKIPPED] npm is not found in PATH.
)

echo.
echo [4/4] Setting Up Mobile Client (Flutter)...
echo ---------------------------------------------------
where flutter >nul 2>nul
if %errorlevel% equ 0 (
    echo   Fetching Flutter pub packages...
    cd mobile
    call flutter.bat pub get
    cd ..
    echo   [OK] Flutter packages installed!
) else (
    echo   [SKIPPED] Flutter is not in PATH. Run 'flutter pub get' manually in mobile/ later.
)

echo.
echo ===================================================
echo   Setup Complete!
echo ===================================================
echo Next steps:
echo   1. Backend:   cd backend   ^&^& go run main.go
echo   2. Web Admin: cd web-admin ^&^& npm run dev
echo   3. Mobile:    cd mobile    ^&^& flutter run
echo.
pause
