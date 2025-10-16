# Docker Cleanup Script (PowerShell)
# Completely cleans Docker environment - containers, images, volumes, networks, and build cache

param(
    [switch]$Force,
    [switch]$KeepVolumes,
    [switch]$Verbose
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

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

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Status "Docker is running" $Green
}
catch {
    Write-Error "Docker is not running. Please start Docker first."
    exit 1
}

# Confirmation prompt unless -Force is used
if (-not $Force) {
    Write-Warning "This will completely clean your Docker environment:"
    Write-Host "  - Stop and remove all containers" -ForegroundColor Yellow
    Write-Host "  - Remove all images" -ForegroundColor Yellow
    Write-Host "  - Remove all networks" -ForegroundColor Yellow
    if (-not $KeepVolumes) {
        Write-Host "  - Remove all volumes (use -KeepVolumes to preserve)" -ForegroundColor Yellow
    }
    Write-Host "  - Clear all build cache" -ForegroundColor Yellow
    Write-Host ""
    
    $confirmation = Read-Host "Are you sure you want to continue? (y/N)"
    if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
        Write-Status "Operation cancelled by user"
        exit 0
    }
}

Write-Status "Starting Docker cleanup..." $Blue

# Step 1: Stop all running containers
Write-Status "Stopping all running containers..."
try {
    $runningContainers = docker ps -q
    if ($runningContainers) {
        docker stop $runningContainers
        Write-Success "Stopped $($runningContainers.Count) containers"
    } else {
        Write-Status "No running containers found"
    }
}
catch {
    Write-Warning "Error stopping containers: $($_.Exception.Message)"
}

# Step 2: Remove all containers
Write-Status "Removing all containers..."
try {
    $allContainers = docker ps -aq
    if ($allContainers) {
        docker rm $allContainers
        Write-Success "Removed $($allContainers.Count) containers"
    } else {
        Write-Status "No containers found"
    }
}
catch {
    Write-Warning "Error removing containers: $($_.Exception.Message)"
}

# Step 3: Remove all images
Write-Status "Removing all images..."
try {
    $allImages = docker images -q
    if ($allImages) {
        docker rmi $allImages -f
        Write-Success "Removed $($allImages.Count) images"
    } else {
        Write-Status "No images found"
    }
}
catch {
    Write-Warning "Error removing images: $($_.Exception.Message)"
}

# Step 4: Remove volumes (unless -KeepVolumes is specified)
if (-not $KeepVolumes) {
    Write-Status "Removing all volumes..."
    try {
        $volumeResult = docker volume prune -f
        if ($Verbose) {
            Write-Host $volumeResult
        }
        Write-Success "Removed unused volumes"
    }
    catch {
        Write-Warning "Error removing volumes: $($_.Exception.Message)"
    }
} else {
    Write-Status "Skipping volume removal (KeepVolumes flag set)"
}

# Step 5: Remove networks
Write-Status "Removing unused networks..."
try {
    $networkResult = docker network prune -f
    if ($Verbose) {
        Write-Host $networkResult
    }
    Write-Success "Removed unused networks"
}
catch {
    Write-Warning "Error removing networks: $($_.Exception.Message)"
}

# Step 6: Clear build cache
Write-Status "Clearing build cache..."
try {
    $builderResult = docker builder prune -a -f
    if ($Verbose) {
        Write-Host $builderResult
    }
    Write-Success "Cleared builder cache"
}
catch {
    Write-Warning "Error clearing builder cache: $($_.Exception.Message)"
}

# Step 7: Clear buildx cache
Write-Status "Clearing buildx cache..."
try {
    $buildxResult = docker buildx prune -a -f
    if ($Verbose) {
        Write-Host $buildxResult
    }
    Write-Success "Cleared buildx cache"
}
catch {
    Write-Warning "Error clearing buildx cache: $($_.Exception.Message)"
}

# Step 8: Clear build history and buildkit state
Write-Status "Clearing build history and buildkit state..."
try {
    # Stop and remove all buildkit containers
    $buildkitContainers = docker ps -a --filter "ancestor=moby/buildkit" --format "{{.ID}}"
    if ($buildkitContainers) {
        docker stop $buildkitContainers
        docker rm $buildkitContainers
        if ($Verbose) {
            Write-Host "Removed buildkit containers"
        }
    }
    
    # Remove all custom builders (this clears build history)
    $builders = docker buildx ls --format "{{.Name}}" | Where-Object { $_ -ne "default" }
    foreach ($builder in $builders) {
        docker buildx rm $builder -f
        if ($Verbose) {
            Write-Host "Removed builder: $builder"
        }
    }
    
    # Reset and recreate default builder
    docker buildx rm default --force 2>$null
    docker buildx create --use --name default --driver docker
    
    # Additional buildkit cleanup
    docker buildx prune --all --force
    docker builder prune --all --force
    
    Write-Success "Cleared build history and buildkit state"
}
catch {
    Write-Warning "Error clearing build history: $($_.Exception.Message)"
}

# Step 9: Final system cleanup
Write-Status "Running final system cleanup..."
try {
    $systemResult = docker system prune -a -f --volumes
    if ($Verbose) {
        Write-Host $systemResult
    }
    Write-Success "System cleanup completed"
}
catch {
    Write-Warning "Error in system cleanup: $($_.Exception.Message)"
}

# Display final status
Write-Status "Displaying final Docker status..." $Blue
try {
    Write-Host ""
    Write-Host "=== FINAL DOCKER STATUS ===" -ForegroundColor Cyan
    docker system df
    Write-Host ""
    Write-Success "Docker cleanup completed successfully!"
    Write-Status "Your Docker environment is now completely clean."
}
catch {
    Write-Warning "Error displaying final status: $($_.Exception.Message)"
}

Write-Host ""
Write-Host ""
Write-Host "Additional cleanup commands (if build history persists):" -ForegroundColor Yellow
Write-Host "  docker system prune -a -f --volumes     # Nuclear option - removes everything"
Write-Host "  docker buildx prune --all --force        # Force clear all buildx cache"
Write-Host "  docker builder prune --all --force       # Force clear all builder cache"
Write-Host ""
Write-Host "Usage examples:" -ForegroundColor Cyan
Write-Host "  .\docker-cleanup.ps1                    # Interactive cleanup with confirmation"
Write-Host "  .\docker-cleanup.ps1 -Force             # Skip confirmation prompt"
Write-Host "  .\docker-cleanup.ps1 -KeepVolumes       # Preserve Docker volumes"
Write-Host "  .\docker-cleanup.ps1 -Verbose           # Show detailed output"
Write-Host "  .\docker-cleanup.ps1 -Force -Verbose    # Force cleanup with detailed output"