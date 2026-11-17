@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   MillTrack - Git Push (Web Admin Context)
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
echo Current web-admin changes:
git status -s web-admin\
echo.

set /p COMMIT_MSG="Enter web-admin commit message (or press ENTER to cancel): "
if "%COMMIT_MSG%"=="" (
    echo [ABORTED] Push cancelled.
    pause
    exit /b 0
)

echo.
echo Staging web-admin changes...
git add web-admin/
git commit -m "[web-admin] %COMMIT_MSG%"

echo.
echo Pushing to origin/%CURRENT_BRANCH%...
git push origin %CURRENT_BRANCH%

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Web Admin changes pushed successfully!
) else (
    echo.
    echo [FAILED] Push failed.
)

echo.
pause
