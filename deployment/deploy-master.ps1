# CHC Insight CRM - Master Deployment Script (PowerShell)
# This script can be run from the project root and handles all deployment tasks
# Documentation: deployment/docs/README.md

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("deploy", "infrastructure", "apps", "backup", "health", "logs", "stop", "restart", "clean-docker", "status")]
    [string]$Action,
    
    [string]$Service = "",
    [string]$InfraAction = "",
    [switch]$Force,
    [switch]$Detailed
)

# Get the script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Set working directory to project root
Set-Location $ProjectRoot

Write-Host "CHC Insight CRM - Master Deployment Script" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Blue
Write-Host "Action: $Action" -ForegroundColor Blue
Write-Host ""

# Execute the appropriate script based on action
switch ($Action) {
    "deploy" {
        Write-Host "Full deployment: Infrastructure + Applications..." -ForegroundColor Yellow
        Write-Host "Step 1: Starting infrastructure..." -ForegroundColor Cyan
        & "$ScriptDir\scripts\infrastructure.ps1" start
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Step 2: Deploying applications..." -ForegroundColor Cyan
            & "$ScriptDir\scripts\apps.ps1" deploy
        } else {
            Write-Host "Infrastructure startup failed!" -ForegroundColor Red
            exit 1
        }
    }
    "infrastructure" {
        Write-Host "Managing infrastructure..." -ForegroundColor Yellow
        if ($InfraAction) {
            & "$ScriptDir\scripts\infrastructure.ps1" $InfraAction
        } else {
            & "$ScriptDir\scripts\infrastructure.ps1" status
        }
    }
    "apps" {
        Write-Host "Managing applications..." -ForegroundColor Yellow
        if ($Service) {
            & "$ScriptDir\scripts\apps.ps1" deploy $Service
        } else {
            & "$ScriptDir\scripts\apps.ps1" deploy
        }
    }
    "clean-docker" {
        Write-Host "Executing Docker cleanup..." -ForegroundColor Yellow
        if ($Force) {
            & "$ScriptDir\scripts\docker-cleanup.ps1" -Force
        } else {
            & "$ScriptDir\scripts\docker-cleanup.ps1"
        }
    }
    "health" {
        Write-Host "Checking system health..." -ForegroundColor Yellow
        & "$ScriptDir\scripts\infrastructure.ps1" status
        & "$ScriptDir\scripts\apps.ps1" status
    }
    "backup" {
        Write-Host "Creating backup..." -ForegroundColor Yellow
        & "$ScriptDir\scripts\infrastructure.ps1" backup
    }
    "logs" {
        Write-Host "Showing logs..." -ForegroundColor Yellow
        if ($Service) {
            & "$ScriptDir\scripts\apps.ps1" logs $Service
        } else {
            & "$ScriptDir\scripts\apps.ps1" logs
        }
    }
    "stop" {
        Write-Host "Stopping applications (preserving infrastructure)..." -ForegroundColor Yellow
        & "$ScriptDir\scripts\apps.ps1" stop
    }
    "restart" {
        Write-Host "Restarting applications..." -ForegroundColor Yellow
        if ($Service) {
            & "$ScriptDir\scripts\apps.ps1" restart $Service
        } else {
            & "$ScriptDir\scripts\apps.ps1" restart
        }
    }
    "status" {
        Write-Host "Checking full system status..." -ForegroundColor Yellow
        & "$ScriptDir\scripts\infrastructure.ps1" status
        & "$ScriptDir\scripts\apps.ps1" status
    }
}

Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Infrastructure (Persistent):" -ForegroundColor Green
Write-Host "  .\deployment\deploy-master.ps1 infrastructure -InfraAction start   # Start PostgreSQL & Redis"
Write-Host "  .\deployment\deploy-master.ps1 infrastructure -InfraAction stop    # Stop infrastructure"
Write-Host "  .\deployment\deploy-master.ps1 infrastructure -InfraAction backup  # Backup data"
Write-Host ""
Write-Host "Applications (Frequent Updates):" -ForegroundColor Green
Write-Host "  .\deployment\deploy-master.ps1 apps                   # Deploy/update applications"
Write-Host "  .\deployment\deploy-master.ps1 restart                # Restart applications"
Write-Host "  .\deployment\deploy-master.ps1 restart -Service backend # Restart specific service"
Write-Host "  .\deployment\deploy-master.ps1 stop                   # Stop applications only"
Write-Host ""
Write-Host "Full System:" -ForegroundColor Green
Write-Host "  .\deployment\deploy-master.ps1 deploy                 # Full deployment (infra + apps)"
Write-Host "  .\deployment\deploy-master.ps1 status                 # Check everything"
Write-Host "  .\deployment\deploy-master.ps1 health                 # Health check"
Write-Host "  .\deployment\deploy-master.ps1 logs                   # View logs"
Write-Host "  .\deployment\deploy-master.ps1 backup                 # Backup data"