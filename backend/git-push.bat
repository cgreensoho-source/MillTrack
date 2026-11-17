@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   MillTrack - Git Push (Backend Context)
echo ===================================================
cd /d "%~dp0.."

for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if "%CURRENT_BRANCH%"=="" (
    echo [ERROR] Not in a git repository or detached HEAD.
    pause
    exit /b 1
)

echo Current branch: %CURRENT_BRANCH%
echo.
echo Current backend changes:
git status -s backend\
echo.

set /p COMMIT_MSG="Enter backend commit message (or press ENTER to cancel): "
if "%COMMIT_MSG%"=="" (
    echo [ABORTED] Push cancelled.
    pause
    exit /b 0
)

echo.
echo Staging backend changes...
git add backend/
git commit -m "[backend] %COMMIT_MSG%"

echo.
echo Pushing to origin/%CURRENT_BRANCH%...
git push origin %CURRENT_BRANCH%

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Backend changes pushed successfully!
) else (
    echo.
    echo [FAILED] Push failed.
)

echo.
pause
