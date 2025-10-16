# Infrastructure Management Script
# Manages persistent infrastructure (PostgreSQL, Redis)

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "status", "logs", "reset", "backup")]
    [string]$Action
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigsDir = Join-Path (Split-Path -Parent $ScriptDir) "configs"
$InfraComposeFile = Join-Path $ConfigsDir "docker-compose.infrastructure.yml"
$EnvFile = Join-Path $ConfigsDir ".env.production"

Write-Host "=== CHC Insight CRM Infrastructure Management ===" -ForegroundColor Green
Write-Host "Action: $Action" -ForegroundColor Yellow

Push-Location $ConfigsDir

try {
    switch ($Action.ToLower()) {
        "start" {
            Write-Host "Starting infrastructure services..." -ForegroundColor Cyan
            docker-compose -f docker-compose.infrastructure.yml --env-file .env.production up -d
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Infrastructure started successfully!" -ForegroundColor Green
                Write-Host "PostgreSQL: localhost:5432" -ForegroundColor Yellow
                Write-Host "Redis: localhost:6379" -ForegroundColor Yellow
                
                Write-Host "`nWaiting for services to be healthy..." -ForegroundColor Cyan
                Start-Sleep 10
                docker-compose -f docker-compose.infrastructure.yml ps
            } else {
                Write-Host "Infrastructure startup failed!" -ForegroundColor Red
            }
        }
        "stop" {
            Write-Host "Stopping infrastructure services..." -ForegroundColor Cyan
            docker-compose -f docker-compose.infrastructure.yml down
            Write-Host "Infrastructure stopped (volumes preserved)" -ForegroundColor Green
        }
        "status" {
            Write-Host "Infrastructure status:" -ForegroundColor Cyan
            docker-compose -f docker-compose.infrastructure.yml ps
            
            Write-Host "`nVolume status:" -ForegroundColor Cyan
            docker volume ls | Select-String "chc-crm"
            
            Write-Host "`nNetwork status:" -ForegroundColor Cyan
            docker network ls | Select-String "chc-crm"
        }
        "logs" {
            Write-Host "Infrastructure logs:" -ForegroundColor Cyan
            docker-compose -f docker-compose.infrastructure.yml logs -f --tail=50
        }
        "reset" {
            Write-Host "WARNING: This will destroy all data!" -ForegroundColor Red
            $confirm = Read-Host "Type 'RESET' to confirm data destruction"
            
            if ($confirm -eq "RESET") {
                Write-Host "Stopping infrastructure..." -ForegroundColor Yellow
                docker-compose -f docker-compose.infrastructure.yml down -v
                
                Write-Host "Removing volumes..." -ForegroundColor Yellow
                docker volume rm chc-crm-postgres-data -f
                docker volume rm chc-crm-redis-data -f
                
                Write-Host "Infrastructure reset complete!" -ForegroundColor Green
            } else {
                Write-Host "Reset cancelled." -ForegroundColor Yellow
            }
        }
        "backup" {
            Write-Host "Creating infrastructure backup..." -ForegroundColor Cyan
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $backupDir = "../backups/infrastructure_$timestamp"
            
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
            
            # Backup PostgreSQL
            Write-Host "Backing up PostgreSQL..." -ForegroundColor Yellow
            docker exec chc-crm-postgres pg_dump -U postgres chc_insight_crm > "$backupDir/postgres.sql"
            
            # Backup Redis
            Write-Host "Backing up Redis..." -ForegroundColor Yellow
            docker exec chc-crm-redis redis-cli --rdb /data/dump.rdb
            docker cp chc-crm-redis:/data/dump.rdb "$backupDir/redis.rdb"
            
            Write-Host "Backup completed: $backupDir" -ForegroundColor Green
        }
        default {
            Write-Host "Usage: infrastructure.ps1 [start|stop|status|logs|reset|backup]" -ForegroundColor Yellow
        }
    }
} finally {
    Pop-Location
}

Write-Host "`nInfrastructure commands:" -ForegroundColor Cyan
Write-Host "  .\deployment\scripts\infrastructure.ps1 start    # Start PostgreSQL & Redis"
Write-Host "  .\deployment\scripts\infrastructure.ps1 stop     # Stop (preserve data)"
Write-Host "  .\deployment\scripts\infrastructure.ps1 status   # Check status"
Write-Host "  .\deployment\scripts\infrastructure.ps1 logs     # View logs"
Write-Host "  .\deployment\scripts\infrastructure.ps1 backup   # Backup data"
Write-Host "  .\deployment\scripts\infrastructure.ps1 reset    # DESTROY all data"