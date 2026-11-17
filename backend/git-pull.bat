@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   MillTrack - Git Pull (Backend Context)
echo ===================================================
cd /d "%~dp0.."

for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if "%CURRENT_BRANCH%"=="" (
    echo [ERROR] Not in a git repository or detached HEAD.
    pause
    exit /b 1
)

echo Current branch: %CURRENT_BRANCH%
echo Pulling latest changes from origin/%CURRENT_BRANCH%...
git pull origin %CURRENT_BRANCH%

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Backend repository updated!
) else (
    echo.
    echo [FAILED] Pull failed. Please resolve conflicts or check connection.
)

echo.
pause
