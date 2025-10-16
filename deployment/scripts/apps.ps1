# Application Deployment Script
# Manages application services (Backend, Frontend) that connect to persistent infrastructure

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("deploy", "stop", "restart", "logs", "status", "build")]
    [string]$Action,
    
    [string]$Service = ""
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigsDir = Join-Path (Split-Path -Parent $ScriptDir) "configs"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$AppsComposeFile = Join-Path $ConfigsDir "docker-compose.apps.yml"

Write-Host "=== CHC Insight CRM Application Deployment ===" -ForegroundColor Green
Write-Host "Action: $Action" -ForegroundColor Yellow

# Check if infrastructure is running
Write-Host "`nChecking infrastructure..." -ForegroundColor Cyan
$postgresRunning = docker ps --format "table {{.Names}}" | Select-String "chc-crm-postgres"
$redisRunning = docker ps --format "table {{.Names}}" | Select-String "chc-crm-redis"

if (-not $postgresRunning -or -not $redisRunning) {
    Write-Host "Infrastructure not running! Start it first:" -ForegroundColor Red
    Write-Host "  .\deployment\scripts\infrastructure.ps1 start" -ForegroundColor Yellow
    exit 1
}
Write-Host "Infrastructure is running ✓" -ForegroundColor Green

Push-Location $ConfigsDir

try {
    switch ($Action.ToLower()) {
        "deploy" {
            Write-Host "`nRebuilding applications..." -ForegroundColor Cyan
            
            # Rebuild backend
            Push-Location "$ProjectRoot\backend"
            Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
            npm install
            Write-Host "Building backend..." -ForegroundColor Yellow
            npm run build
            Pop-Location
            
            # Rebuild frontend
            Push-Location "$ProjectRoot\frontend"
            Write-Host "Building frontend..." -ForegroundColor Yellow
            npm run build
            Pop-Location
            
            Write-Host "`nDeploying applications..." -ForegroundColor Cyan
            docker-compose -f docker-compose.apps.yml --env-file .env.production up -d --build
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Applications deployed successfully!" -ForegroundColor Green
                Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
                Write-Host "Backend: http://localhost:3001" -ForegroundColor Yellow
                
                Write-Host "`nWaiting for applications to be healthy..." -ForegroundColor Cyan
                Start-Sleep 15
                docker-compose -f docker-compose.apps.yml ps
            } else {
                Write-Host "Application deployment failed!" -ForegroundColor Red
            }
        }
        "stop" {
            Write-Host "Stopping applications..." -ForegroundColor Cyan
            docker-compose -f docker-compose.apps.yml down
            Write-Host "Applications stopped (infrastructure preserved)" -ForegroundColor Green
        }
        "restart" {
            Write-Host "Restarting applications..." -ForegroundColor Cyan
            if ($Service) {
                docker-compose -f docker-compose.apps.yml restart $Service
            } else {
                docker-compose -f docker-compose.apps.yml restart
            }
            Start-Sleep 5
            docker-compose -f docker-compose.apps.yml ps
        }
        "logs" {
            Write-Host "Application logs:" -ForegroundColor Cyan
            if ($Service) {
                docker-compose -f docker-compose.apps.yml logs -f --tail=50 $Service
            } else {
                docker-compose -f docker-compose.apps.yml logs -f --tail=50
            }
        }
        "status" {
            Write-Host "Application status:" -ForegroundColor Cyan
            docker-compose -f docker-compose.apps.yml ps
            
            Write-Host "`nHealth check:" -ForegroundColor Cyan
            Write-Host "Backend health:" -ForegroundColor Yellow
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
                Write-Host "  Status: $($response.StatusCode) ✓" -ForegroundColor Green
            } catch {
                Write-Host "  Status: Failed ✗" -ForegroundColor Red
            }
            
            Write-Host "Frontend health:" -ForegroundColor Yellow
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
                Write-Host "  Status: $($response.StatusCode) ✓" -ForegroundColor Green
            } catch {
                Write-Host "  Status: Failed ✗" -ForegroundColor Red
            }
        }
        "build" {
            Write-Host "Building applications only..." -ForegroundColor Cyan
            docker-compose -f docker-compose.apps.yml build --no-cache
        }
        default {
            Write-Host "Usage: apps.ps1 [deploy|stop|restart|logs|status|build] [service]" -ForegroundColor Yellow
        }
    }
} finally {
    Pop-Location
}

Write-Host "`nApplication commands:" -ForegroundColor Cyan
Write-Host "  .\deployment\scripts\apps.ps1 deploy           # Deploy/update applications"
Write-Host "  .\deployment\scripts\apps.ps1 stop             # Stop applications"
Write-Host "  .\deployment\scripts\apps.ps1 restart          # Restart applications"
Write-Host "  .\deployment\scripts\apps.ps1 restart backend  # Restart specific service"
Write-Host "  .\deployment\scripts\apps.ps1 logs             # View all logs"
Write-Host "  .\deployment\scripts\apps.ps1 logs backend     # View service logs"
Write-Host "  .\deployment\scripts\apps.ps1 status           # Check status & health"