# CHC Insight CRM - Production Deployment Script (PowerShell)
# Requirements: 13.1, 13.3

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("deploy", "backup", "health", "logs", "cleanup", "stop", "restart")]
    [string]$Action,
    
    [string]$Service = "",
    [switch]$WithMonitoring
)

# Configuration
$ComposeFile = "docker-compose.production.yml"
$EnvFile = ".env.production"
$BackupDir = "./backups"
$LogFile = "./logs/deploy.log"

# Ensure log directory exists
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force | Out-Null
}

# Functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
        default { Write-Host $logMessage -ForegroundColor Blue }
    }
    
    Add-Content -Path $LogFile -Value $logMessage
}

function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    try {
        $dockerVersion = docker --version
        Write-Log "Docker found: $dockerVersion"
    }
    catch {
        Write-Log "Docker is not installed or not in PATH" "ERROR"
        exit 1
    }
    
    try {
        docker info | Out-Null
        Write-Log "Docker is running"
    }
    catch {
        Write-Log "Docker is not running. Please start Docker first." "ERROR"
        exit 1
    }
    
    # Check if Docker Compose is available
    try {
        $composeVersion = docker-compose --version
        Write-Log "Docker Compose found: $composeVersion"
    }
    catch {
        try {
            $composeVersion = docker compose version
            Write-Log "Docker Compose (plugin) found: $composeVersion"
        }
        catch {
            Write-Log "Docker Compose is not installed" "ERROR"
            exit 1
        }
    }
    
    # Check if environment file exists
    if (!(Test-Path $EnvFile)) {
        Write-Log "Environment file $EnvFile not found. Please copy .env.production.example to $EnvFile and configure it." "ERROR"
        exit 1
    }
    
    # Create required directories
    $directories = @("logs", "backups", "nginx/ssl", "monitoring/grafana/dashboards", "monitoring/grafana/datasources")
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Log "Created directory: $dir"
        }
    }
    
    Write-Log "Prerequisites check completed" "SUCCESS"
}

function Backup-Data {
    Write-Log "Creating backup..."
    
    $backupTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = "$BackupDir/backup_$backupTimestamp"
    
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    
    # Backup database if container is running
    $postgresRunning = docker ps --format "table {{.Names}}" | Select-String "chc-postgres"
    if ($postgresRunning) {
        Write-Log "Backing up database..."
        docker exec chc-postgres pg_dump -U postgres chc_insight_crm > "$backupPath/database.sql"
        Write-Log "Database backup completed" "SUCCESS"
    }
    else {
        Write-Log "Database container not running, skipping database backup" "WARNING"
    }
    
    # Backup volumes
    $postgresVolume = docker volume ls --format "table {{.Name}}" | Select-String "postgres_data"
    if ($postgresVolume) {
        Write-Log "Backing up PostgreSQL volume..."
        docker run --rm -v "chc-insight-crm_postgres_data:/data" -v "${PWD}/${backupPath}:/backup" alpine tar czf /backup/postgres_data.tar.gz -C /data .
    }
    
    $redisVolume = docker volume ls --format "table {{.Name}}" | Select-String "redis_data"
    if ($redisVolume) {
        Write-Log "Backing up Redis volume..."
        docker run --rm -v "chc-insight-crm_redis_data:/data" -v "${PWD}/${backupPath}:/backup" alpine tar czf /backup/redis_data.tar.gz -C /data .
    }
    
    Write-Log "Backup completed: $backupPath" "SUCCESS"
}

function Deploy-Application {
    Write-Log "Starting deployment..."
    
    # Pull latest images
    Write-Log "Pulling latest base images..."
    docker-compose -f $ComposeFile pull postgres redis nginx prometheus grafana
    
    # Build application images
    Write-Log "Building application images..."
    docker-compose -f $ComposeFile build --no-cache backend frontend
    
    # Stop existing containers
    Write-Log "Stopping existing containers..."
    docker-compose -f $ComposeFile down
    
    # Start services in order
    Write-Log "Starting database services..."
    docker-compose -f $ComposeFile up -d postgres redis
    
    # Wait for database to be ready
    Write-Log "Waiting for database to be ready..."
    $timeout = 60
    do {
        Start-Sleep -Seconds 2
        $timeout -= 2
        $dbReady = docker exec chc-postgres pg_isready -U postgres -d chc_insight_crm 2>$null
        if ($timeout -le 0) {
            Write-Log "Database failed to start within 60 seconds" "ERROR"
            exit 1
        }
    } while (!$dbReady)
    
    # Run database migrations
    Write-Log "Running database migrations..."
    docker-compose -f $ComposeFile run --rm backend npm run migrate:latest
    
    # Start application services
    Write-Log "Starting application services..."
    docker-compose -f $ComposeFile up -d backend frontend
    
    # Wait for backend to be ready
    Write-Log "Waiting for backend to be ready..."
    $timeout = 60
    do {
        Start-Sleep -Seconds 2
        $timeout -= 2
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
            $backendReady = $response.StatusCode -eq 200
        }
        catch {
            $backendReady = $false
        }
        if ($timeout -le 0) {
            Write-Log "Backend failed to start within 60 seconds" "ERROR"
            exit 1
        }
    } while (!$backendReady)
    
    # Start reverse proxy
    Write-Log "Starting reverse proxy..."
    docker-compose -f $ComposeFile up -d nginx
    
    # Start monitoring if requested
    if ($WithMonitoring) {
        Write-Log "Starting monitoring services..."
        docker-compose -f $ComposeFile up -d prometheus grafana
    }
    
    Write-Log "Deployment completed successfully" "SUCCESS"
}

function Test-Health {
    Write-Log "Performing health checks..."
    
    # Check if all required services are running
    $services = @("chc-postgres", "chc-redis", "chc-backend", "chc-frontend", "chc-nginx")
    
    foreach ($service in $services) {
        $running = docker ps --format "table {{.Names}}" | Select-String $service
        if ($running) {
            Write-Log "$service is running" "SUCCESS"
        }
        else {
            Write-Log "$service is not running" "ERROR"
            exit 1
        }
    }
    
    # Check service health
    Write-Log "Checking service health..."
    
    # Database health
    try {
        docker exec chc-postgres pg_isready -U postgres -d chc_insight_crm | Out-Null
        Write-Log "Database is healthy" "SUCCESS"
    }
    catch {
        Write-Log "Database health check failed" "ERROR"
        exit 1
    }
    
    # Redis health
    try {
        $redisPing = docker exec chc-redis redis-cli ping
        if ($redisPing -eq "PONG") {
            Write-Log "Redis is healthy" "SUCCESS"
        }
        else {
            throw "Redis ping failed"
        }
    }
    catch {
        Write-Log "Redis health check failed" "ERROR"
        exit 1
    }
    
    # Backend health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Log "Backend is healthy" "SUCCESS"
        }
        else {
            throw "Backend health check returned status $($response.StatusCode)"
        }
    }
    catch {
        Write-Log "Backend health check failed: $($_.Exception.Message)" "ERROR"
        exit 1
    }
    
    # Frontend health (through nginx)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Log "Frontend is healthy" "SUCCESS"
        }
        else {
            throw "Frontend health check returned status $($response.StatusCode)"
        }
    }
    catch {
        Write-Log "Frontend health check failed: $($_.Exception.Message)" "ERROR"
        exit 1
    }
    
    Write-Log "All health checks passed" "SUCCESS"
}

function Invoke-Cleanup {
    Write-Log "Cleaning up old Docker images and volumes..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old backups (keep last 7 days)
    if (Test-Path $BackupDir) {
        Get-ChildItem -Path $BackupDir -Directory | Where-Object { 
            $_.Name -match "backup_\d{8}_\d{6}" -and $_.CreationTime -lt (Get-Date).AddDays(-7) 
        } | Remove-Item -Recurse -Force
    }
    
    Write-Log "Cleanup completed" "SUCCESS"
}

function Show-Logs {
    param([string]$ServiceName)
    
    Write-Log "Showing recent logs..."
    if ($ServiceName) {
        docker-compose -f $ComposeFile logs --tail=50 $ServiceName
    }
    else {
        docker-compose -f $ComposeFile logs --tail=50
    }
}

# Main script execution
switch ($Action) {
    "deploy" {
        Test-Prerequisites
        Backup-Data
        Deploy-Application
        Test-Health
        Invoke-Cleanup
    }
    "backup" {
        Backup-Data
    }
    "health" {
        Test-Health
    }
    "logs" {
        Show-Logs -ServiceName $Service
    }
    "cleanup" {
        Invoke-Cleanup
    }
    "stop" {
        Write-Log "Stopping all services..."
        docker-compose -f $ComposeFile down
        Write-Log "All services stopped" "SUCCESS"
    }
    "restart" {
        Write-Log "Restarting services..."
        docker-compose -f $ComposeFile restart
        Test-Health
    }
}

Write-Log "Script execution completed"