# Backup Script (PowerShell)
# Creates backups of database and Docker volumes for CHC Insight CRM

param(
    [string]$BackupDir = "../backups",
    [string]$ComposeFile = "../configs/docker-compose.production.yml",
    [switch]$DatabaseOnly,
    [switch]$VolumesOnly,
    [string]$BackupName = "",
    [switch]$Compress
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-Status {
    param([string]$Message, [string]$Color = "Blue")
    Write-Host "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Status $Message $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Status $Message $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Status $Message $Red
}

# Generate backup name if not provided
if (-not $BackupName) {
    $BackupName = "backup_$((Get-Date).ToString('yyyyMMdd_HHmmss'))"
}

$BackupPath = Join-Path $BackupDir $BackupName

Write-Status "CHC Insight CRM Backup Script" $Cyan
Write-Status "=============================" $Cyan
Write-Status "Backup Name: $BackupName" $Blue
Write-Status "Backup Path: $BackupPath" $Blue

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Status "Created backup directory: $BackupDir"
}

if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    Write-Status "Created backup path: $BackupPath"
}

$allSuccess = $true

# Database backup
if (-not $VolumesOnly) {
    Write-Status "Creating database backup..." $Blue
    
    try {
        # Check if PostgreSQL container is running
        $postgresRunning = docker ps --format "table {{.Names}}" | Select-String "chc-postgres"
        
        if ($postgresRunning) {
            # Create database dump
            $dumpFile = Join-Path $BackupPath "database.sql"
            docker exec chc-postgres pg_dump -U postgres chc_insight_crm > $dumpFile
            
            if (Test-Path $dumpFile -and (Get-Item $dumpFile).Length -gt 0) {
                Write-Success "Database backup completed: database.sql"
                
                # Create database info file
                $infoFile = Join-Path $BackupPath "database_info.txt"
                $dbInfo = @"
Database Backup Information
===========================
Backup Date: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))
Database: chc_insight_crm
User: postgres
Container: chc-postgres
Dump File: database.sql
"@
                $dbInfo | Out-File -FilePath $infoFile -Encoding UTF8
                
            } else {
                Write-Error "Database backup failed - dump file is empty or missing"
                $allSuccess = $false
            }
        } else {
            Write-Warning "PostgreSQL container not running, skipping database backup"
        }
    }
    catch {
        Write-Error "Database backup failed: $($_.Exception.Message)"
        $allSuccess = $false
    }
}

# Volume backups
if (-not $DatabaseOnly) {
    Write-Status "Creating volume backups..." $Blue
    
    # PostgreSQL data volume
    try {
        $postgresVolume = docker volume ls --format "table {{.Name}}" | Select-String "postgres_data"
        if ($postgresVolume) {
            Write-Status "Backing up PostgreSQL volume..."
            $volumeBackup = Join-Path $BackupPath "postgres_data.tar.gz"
            docker run --rm -v "chc-insight-crm_postgres_data:/data" -v "${PWD}/${BackupPath}:/backup" alpine tar czf /backup/postgres_data.tar.gz -C /data .
            
            if (Test-Path $volumeBackup) {
                Write-Success "PostgreSQL volume backup completed: postgres_data.tar.gz"
            } else {
                Write-Error "PostgreSQL volume backup failed"
                $allSuccess = $false
            }
        }
    }
    catch {
        Write-Error "PostgreSQL volume backup failed: $($_.Exception.Message)"
        $allSuccess = $false
    }
    
    # Redis data volume
    try {
        $redisVolume = docker volume ls --format "table {{.Name}}" | Select-String "redis_data"
        if ($redisVolume) {
            Write-Status "Backing up Redis volume..."
            $volumeBackup = Join-Path $BackupPath "redis_data.tar.gz"
            docker run --rm -v "chc-insight-crm_redis_data:/data" -v "${PWD}/${BackupPath}:/backup" alpine tar czf /backup/redis_data.tar.gz -C /data .
            
            if (Test-Path $volumeBackup) {
                Write-Success "Redis volume backup completed: redis_data.tar.gz"
            } else {
                Write-Error "Redis volume backup failed"
                $allSuccess = $false
            }
        }
    }
    catch {
        Write-Error "Redis volume backup failed: $($_.Exception.Message)"
        $allSuccess = $false
    }
}

# Create backup manifest
$manifestFile = Join-Path $BackupPath "backup_manifest.json"
$manifest = @{
    backup_name = $BackupName
    backup_date = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    backup_type = if ($DatabaseOnly) { "database_only" } elseif ($VolumesOnly) { "volumes_only" } else { "full" }
    files = @()
}

# List all files in backup
Get-ChildItem -Path $BackupPath -File | ForEach-Object {
    $manifest.files += @{
        name = $_.Name
        size = $_.Length
        created = $_.CreationTime.ToString('yyyy-MM-dd HH:mm:ss')
    }
}

$manifest | ConvertTo-Json -Depth 3 | Out-File -FilePath $manifestFile -Encoding UTF8
Write-Status "Created backup manifest: backup_manifest.json"

# Compress backup if requested
if ($Compress) {
    Write-Status "Compressing backup..." $Blue
    
    try {
        $zipFile = "$BackupPath.zip"
        Compress-Archive -Path $BackupPath -DestinationPath $zipFile -Force
        
        if (Test-Path $zipFile) {
            Write-Success "Backup compressed: $BackupName.zip"
            
            # Remove uncompressed backup directory
            Remove-Item -Path $BackupPath -Recurse -Force
            Write-Status "Removed uncompressed backup directory"
        } else {
            Write-Error "Backup compression failed"
            $allSuccess = $false
        }
    }
    catch {
        Write-Error "Backup compression failed: $($_.Exception.Message)"
        $allSuccess = $false
    }
}

# Display backup summary
Write-Status "Backup Summary:" $Cyan
if ($Compress -and (Test-Path "$BackupPath.zip")) {
    $backupSize = (Get-Item "$BackupPath.zip").Length
    Write-Status "Compressed backup size: $([math]::Round($backupSize / 1MB, 2)) MB"
    Write-Status "Backup location: $BackupPath.zip"
} elseif (Test-Path $BackupPath) {
    $backupSize = (Get-ChildItem -Path $BackupPath -Recurse | Measure-Object -Property Length -Sum).Sum
    Write-Status "Backup size: $([math]::Round($backupSize / 1MB, 2)) MB"
    Write-Status "Backup location: $BackupPath"
}

# List backup contents
if (Test-Path $BackupPath) {
    Write-Status "Backup contents:"
    Get-ChildItem -Path $BackupPath -File | ForEach-Object {
        Write-Host "  - $($_.Name) ($([math]::Round($_.Length / 1KB, 2)) KB)" -ForegroundColor Gray
    }
}

# Final status
if ($allSuccess) {
    Write-Success "Backup completed successfully!"
    exit 0
} else {
    Write-Error "Backup completed with errors"
    exit 1
}

Write-Host ""
Write-Host "Usage examples:" -ForegroundColor Cyan
Write-Host "  .\backup.ps1                          # Full backup"
Write-Host "  .\backup.ps1 -DatabaseOnly            # Database only"
Write-Host "  .\backup.ps1 -VolumesOnly             # Volumes only"
Write-Host "  .\backup.ps1 -BackupName 'pre-update' # Custom backup name"
Write-Host "  .\backup.ps1 -Compress                # Compress backup"