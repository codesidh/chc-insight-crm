@echo off
REM Docker Cleanup Script (Batch)
REM Completely cleans Docker environment - containers, images, volumes, networks, and build cache

setlocal enabledelayedexpansion

echo [%date% %time%] Docker Cleanup Script
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo [INFO] Docker is running

REM Confirmation prompt
set /p "confirm=This will completely clean your Docker environment. Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo [INFO] Operation cancelled by user
    pause
    exit /b 0
)

echo.
echo [INFO] Starting Docker cleanup...

REM Step 1: Stop all running containers
echo [INFO] Stopping all running containers...
for /f "tokens=*" %%i in ('docker ps -q 2^>nul') do (
    docker stop %%i
)

REM Step 2: Remove all containers
echo [INFO] Removing all containers...
for /f "tokens=*" %%i in ('docker ps -aq 2^>nul') do (
    docker rm %%i
)

REM Step 3: Remove all images
echo [INFO] Removing all images...
for /f "tokens=*" %%i in ('docker images -q 2^>nul') do (
    docker rmi %%i -f
)

REM Step 4: Remove volumes
echo [INFO] Removing all volumes...
docker volume prune -f

REM Step 5: Remove networks
echo [INFO] Removing unused networks...
docker network prune -f

REM Step 6: Clear build cache
echo [INFO] Clearing build cache...
docker builder prune -a -f

REM Step 7: Clear buildx cache
echo [INFO] Clearing buildx cache...
docker buildx prune -a -f

REM Step 8: Final system cleanup
echo [INFO] Running final system cleanup...
docker system prune -a -f

REM Display final status
echo.
echo === FINAL DOCKER STATUS ===
docker system df
echo.
echo [SUCCESS] Docker cleanup completed successfully!
echo [INFO] Your Docker environment is now completely clean.

echo.
echo Usage examples:
echo   docker-cleanup.bat                    # Interactive cleanup with confirmation
echo   docker-cleanup.ps1 -Force            # PowerShell version with no confirmation
echo   ./docker-cleanup.sh -f               # Bash version with no confirmation

pause