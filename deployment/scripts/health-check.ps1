# Health Check Script (PowerShell)
# Monitors the health of all CHC Insight CRM services

param(
    [string]$ComposeFile = "../configs/docker-compose.production.yml",
    [switch]$Detailed,
    [switch]$Continuous,
    [int]$Interval = 30
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

function Test-ServiceHealth {
    param([string]$ServiceName, [string]$HealthUrl, [int]$ExpectedStatus = 200)
    
    try {
        $response = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Success "$ServiceName is healthy (HTTP $($response.StatusCode))"
            return $true
        } else {
            Write-Warning "$ServiceName returned HTTP $($response.StatusCode)"
            return $false
        }
    }
    catch {
        Write-Error "$ServiceName health check failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-ContainerHealth {
    param([string]$ContainerName)
    
    try {
        $container = docker ps --filter "name=$ContainerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        if ($container -and $container -notmatch "NAMES") {
            $status = ($container -split '\s+')[1..2] -join ' '
            if ($status -match "Up") {
                Write-Success "$ContainerName container is running ($status)"
                return $true
            } else {
                Write-Warning "$ContainerName container status: $status"
                return $false
            }
        } else {
            Write-Error "$ContainerName container not found"
            return $false
        }
    }
    catch {
        Write-Error "Failed to check $ContainerName container: $($_.Exception.Message)"
        return $false
    }
}

function Get-ServiceLogs {
    param([string]$ServiceName, [int]$Lines = 10)
    
    Write-Status "Recent logs for $ServiceName:" $Cyan
    try {
        docker-compose -f $ComposeFile logs --tail=$Lines $ServiceName
    }
    catch {
        Write-Warning "Could not retrieve logs for $ServiceName"
    }
}

function Invoke-HealthCheck {
    Write-Status "CHC Insight CRM Health Check" $Cyan
    Write-Status "=============================" $Cyan
    
    $allHealthy = $true
    
    # Check Docker containers
    Write-Status "Checking Docker containers..." $Blue
    $containers = @("chc-postgres", "chc-redis", "chc-backend", "chc-frontend", "chc-nginx")
    
    foreach ($container in $containers) {
        $healthy = Test-ContainerHealth $container
        if (-not $healthy) { $allHealthy = $false }
    }
    
    Write-Host ""
    
    # Check service endpoints
    Write-Status "Checking service endpoints..." $Blue
    
    $services = @{
        "Database" = @{ url = ""; container = "chc-postgres" }
        "Redis" = @{ url = ""; container = "chc-redis" }
        "Backend API" = @{ url = "http://localhost:3001/health"; container = "chc-backend" }
        "Frontend" = @{ url = "http://localhost:3000/health"; container = "chc-frontend" }
        "Nginx Proxy" = @{ url = "http://localhost/health"; container = "chc-nginx" }
    }
    
    foreach ($serviceName in $services.Keys) {
        $service = $services[$serviceName]
        
        if ($service.url) {
            $healthy = Test-ServiceHealth $serviceName $service.url
            if (-not $healthy) { $allHealthy = $false }
        } else {
            # For database services, check if container is responding
            try {
                if ($serviceName -eq "Database") {
                    $result = docker exec chc-postgres pg_isready -U postgres -d chc_insight_crm
                    if ($result -match "accepting connections") {
                        Write-Success "$serviceName is accepting connections"
                    } else {
                        Write-Warning "$serviceName connection check: $result"
                        $allHealthy = $false
                    }
                } elseif ($serviceName -eq "Redis") {
                    $result = docker exec chc-redis redis-cli ping
                    if ($result -eq "PONG") {
                        Write-Success "$serviceName is responding to ping"
                    } else {
                        Write-Warning "$serviceName ping failed: $result"
                        $allHealthy = $false
                    }
                }
            }
            catch {
                Write-Error "$serviceName check failed: $($_.Exception.Message)"
                $allHealthy = $false
            }
        }
    }
    
    Write-Host ""
    
    # Show detailed information if requested
    if ($Detailed) {
        Write-Status "Detailed System Information:" $Cyan
        
        # Docker system info
        Write-Status "Docker System Status:" $Blue
        docker system df
        
        Write-Host ""
        
        # Container resource usage
        Write-Status "Container Resource Usage:" $Blue
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
        
        Write-Host ""
        
        # Show recent logs for failed services
        if (-not $allHealthy) {
            Write-Status "Recent logs for services:" $Blue
            foreach ($container in $containers) {
                Get-ServiceLogs $container.Replace("chc-", "") 5
                Write-Host ""
            }
        }
    }
    
    # Overall status
    Write-Status "Overall Health Status:" $Cyan
    if ($allHealthy) {
        Write-Success "All services are healthy and running properly"
        return 0
    } else {
        Write-Error "One or more services are not healthy"
        Write-Status "Run with -Detailed flag for more information"
        return 1
    }
}

# Main execution
if ($Continuous) {
    Write-Status "Starting continuous health monitoring (interval: $Interval seconds)" $Cyan
    Write-Status "Press Ctrl+C to stop" $Yellow
    
    while ($true) {
        Clear-Host
        $result = Invoke-HealthCheck
        
        if ($result -eq 0) {
            Write-Host ""
            Write-Status "Next check in $Interval seconds..." $Blue
        } else {
            Write-Host ""
            Write-Status "Issues detected. Next check in $Interval seconds..." $Yellow
        }
        
        Start-Sleep -Seconds $Interval
    }
} else {
    $exitCode = Invoke-HealthCheck
    exit $exitCode
}

Write-Host ""
Write-Host "Usage examples:" -ForegroundColor Cyan
Write-Host "  .\health-check.ps1                    # Basic health check"
Write-Host "  .\health-check.ps1 -Detailed         # Detailed health check with logs"
Write-Host "  .\health-check.ps1 -Continuous       # Continuous monitoring"
Write-Host "  .\health-check.ps1 -Continuous -Interval 60  # Monitor every 60 seconds"