@echo off
echo ===== IdeaPulse: Starting clean Next.js server =====

echo 1. Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo    Node processes terminated successfully.
) else (
  echo    No Node.js processes were running.
)

echo 2. Cleaning problematic Next.js cache files...
node force-clean-cache.js

echo 3. Starting Next.js development server...
echo    The server will start momentarily in a new window.
start cmd /k "yarn dev"

echo ===== Done! =====
echo Next.js is now running in a new window.
echo You can close this window.