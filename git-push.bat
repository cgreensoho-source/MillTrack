@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   MillTrack Monorepo - Git Push
echo ===================================================
cd /d "%~dp0"

echo [1/4] Checking current branch...
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

if "%CURRENT_BRANCH%"=="" (
    echo [ERROR] Not in a git repository or detached HEAD.
    pause
    exit /b 1
)

echo Current branch: %CURRENT_BRANCH%
echo.

echo [2/4] Current working tree status:
git status -s
echo.

set /p COMMIT_MSG="Enter commit message (or press ENTER to cancel): "
if "%COMMIT_MSG%"=="" (
    echo [ABORTED] No commit message provided. Push cancelled.
    pause
    exit /b 0
)

echo.
echo [3/4] Staging and committing changes...
git add -A
git commit -m "%COMMIT_MSG%"

if %errorlevel% neq 0 (
    echo [WARNING] No changes to commit or commit failed.
)

echo.
echo [4/4] Pushing to origin/%CURRENT_BRANCH%...
git push origin %CURRENT_BRANCH%

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo   [SUCCESS] Changes pushed to origin/%CURRENT_BRANCH%!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo   [FAILED] Git push failed. Please check your network/auth.
    echo ===================================================
)

echo.
pause
