# CHC Insight CRM - Primary Deployment Script
# Documentation: ../docs/README.md and ../docs/DEPLOYMENT-STRATEGY.md

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("deploy", "stop", "logs", "status", "build-check", "restart")]
    [string]$Action
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigsDir = Join-Path (Split-Path -Parent $ScriptDir) "configs"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Write-Host "=== CHC Insight CRM Minimal Deployment ===" -ForegroundColor Green
Write-Host "Action: $Action" -ForegroundColor Yellow

# Verify builds exist
$BackendDist = Join-Path $ProjectRoot "backend\dist\index.js"
$FrontendStandalone = Join-Path $ProjectRoot "frontend\.next\standalone\server.js"

if ($Action -eq "deploy") {
    Write-Host "`nCleaning Docker environment (preserving volumes)..." -ForegroundColor Cyan
    & "$ScriptDir\docker-cleanup.ps1" -Force -KeepVolumes
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker cleanup failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`nRebuilding applications with proper dependencies..." -ForegroundColor Cyan
    
    # Install dependencies and rebuild backend
    Push-Location "$ProjectRoot\backend"
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "Building backend..." -ForegroundColor Yellow
    npm run build
    Pop-Location
    
    # Rebuild frontend if needed
    Push-Location "$ProjectRoot\frontend"
    Write-Host "Building frontend..." -ForegroundColor Yellow
    npm run build
    Pop-Location
    
    Write-Host "`nBuild completed successfully!" -ForegroundColor Green
}

Push-Location $ConfigsDir

try {
    switch ($Action.ToLower()) {
        "deploy" {
            Write-Host "`nStarting minimal Docker deployment..." -ForegroundColor Cyan
            docker-compose -f docker-compose.simple.yml up -d --build
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`nDeployment successful!" -ForegroundColor Green
                Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
                Write-Host "Backend: http://localhost:3001" -ForegroundColor Yellow
                Write-Host "`nChecking service health..." -ForegroundColor Cyan
                Start-Sleep 10
                docker-compose -f docker-compose.simple.yml ps
            } else {
                Write-Host "Deployment failed!" -ForegroundColor Red
            }
        }
        "stop" {
            Write-Host "Stopping services..." -ForegroundColor Cyan
            docker-compose -f docker-compose.simple.yml down
        }
        "logs" {
            Write-Host "Showing logs..." -ForegroundColor Cyan
            docker-compose -f docker-compose.simple.yml logs -f
        }
        "status" {
            Write-Host "Checking status..." -ForegroundColor Cyan
            docker-compose -f docker-compose.simple.yml ps
        }
        "restart" {
            Write-Host "Restarting services..." -ForegroundColor Cyan
            docker-compose -f docker-compose.simple.yml restart
            Start-Sleep 5
            docker-compose -f docker-compose.simple.yml ps
        }
        "build-check" {
            Write-Host "Checking build sizes..." -ForegroundColor Cyan
            if (Test-Path $BackendDist) {
                $backendSize = (Get-ChildItem -Recurse (Join-Path $ProjectRoot "backend\dist") | Measure-Object -Property Length -Sum).Sum / 1MB
                Write-Host "Backend dist: $([math]::Round($backendSize, 2)) MB" -ForegroundColor Yellow
            }
            if (Test-Path $FrontendStandalone) {
                $frontendSize = (Get-ChildItem -Recurse (Join-Path $ProjectRoot "frontend\.next") | Measure-Object -Property Length -Sum).Sum / 1MB
                Write-Host "Frontend .next: $([math]::Round($frontendSize, 2)) MB" -ForegroundColor Yellow
            }
        }
        default {
            Write-Host "Usage: deploy-minimal.ps1 [deploy|stop|logs|status|restart|build-check]" -ForegroundColor Yellow
        }
    }
} finally {
    Pop-Location
}