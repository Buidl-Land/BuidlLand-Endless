@echo off
echo Cleaning up Next.js cache...
echo This script needs to be run with administrator privileges

echo Stopping any running Next.js dev servers...
taskkill /f /im node.exe

echo Removing .next directory...
rd /s /q .next
echo Creating empty .next directory...
mkdir .next

echo Done! You can now run yarn dev to start Next.js again.
pause