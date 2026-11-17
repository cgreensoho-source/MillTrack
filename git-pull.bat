@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   MillTrack Monorepo - Git Pull
echo ===================================================
cd /d "%~dp0"

echo [1/2] Checking current branch...
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

if "%CURRENT_BRANCH%"=="" (
    echo [ERROR] Not in a git repository or detached HEAD.
    pause
    exit /b 1
)

echo Current branch: %CURRENT_BRANCH%
echo.
echo [2/2] Pulling latest changes from origin/%CURRENT_BRANCH%...
git pull origin %CURRENT_BRANCH%

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo   [SUCCESS] Repository updated successfully!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo   [FAILED] Git pull encountered errors.
    echo ===================================================
)

echo.
pause
