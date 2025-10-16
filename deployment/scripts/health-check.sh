#!/bin/bash

# Health Check Script (Bash)
# Monitors the health of all CHC Insight CRM services

set -e

# Default values
COMPOSE_FILE="../configs/docker-compose.production.yml"
DETAILED=false
CONTINUOUS=false
INTERVAL=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

show_help() {
    echo "CHC Insight CRM Health Check Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --detailed      Show detailed system information and logs"
    echo "  -c, --continuous    Run continuous health monitoring"
    echo "  -i, --interval N    Set monitoring interval in seconds (default: 30)"
    echo "  -f, --file FILE     Specify Docker Compose file path"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Basic health check"
    echo "  $0 -d                 # Detailed health check with logs"
    echo "  $0 -c                 # Continuous monitoring"
    echo "  $0 -c -i 60           # Monitor every 60 seconds"
    echo ""
}

test_service_health() {
    local service_name="$1"
    local health_url="$2"
    local expected_status="${3:-200}"
    
    if curl -f -s --max-time 5 "$health_url" > /dev/null 2>&1; then
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$health_url")
        if [ "$status_code" = "$expected_status" ]; then
            success "$service_name is healthy (HTTP $status_code)"
            return 0
        else
            warning "$service_name returned HTTP $status_code"
            return 1
        fi
    else
        error "$service_name health check failed"
        return 1
    fi
}

test_container_health() {
    local container_name="$1"
    
    if docker ps --filter "name=$container_name" --format "{{.Names}}" | grep -q "$container_name"; then
        local status=$(docker ps --filter "name=$container_name" --format "{{.Status}}")
        if echo "$status" | grep -q "Up"; then
            success "$container_name container is running ($status)"
            return 0
        else
            warning "$container_name container status: $status"
            return 1
        fi
    else
        error "$container_name container not found"
        return 1
    fi
}

get_service_logs() {
    local service_name="$1"
    local lines="${2:-10}"
    
    log "Recent logs for $service_name:"
    if docker-compose -f "$COMPOSE_FILE" logs --tail="$lines" "$service_name" 2>/dev/null; then
        return 0
    else
        warning "Could not retrieve logs for $service_name"
        return 1
    fi
}

run_health_check() {
    echo -e "${CYAN}CHC Insight CRM Health Check${NC}"
    echo -e "${CYAN}=============================${NC}"
    
    local all_healthy=true
    
    # Check Docker containers
    log "Checking Docker containers..."
    local containers=("chc-postgres" "chc-redis" "chc-backend" "chc-frontend" "chc-nginx")
    
    for container in "${containers[@]}"; do
        if ! test_container_health "$container"; then
            all_healthy=false
        fi
    done
    
    echo ""
    
    # Check service endpoints
    log "Checking service endpoints..."
    
    # Backend API
    if ! test_service_health "Backend API" "http://localhost:3001/health"; then
        all_healthy=false
    fi
    
    # Frontend
    if ! test_service_health "Frontend" "http://localhost:3000/health"; then
        all_healthy=false
    fi
    
    # Nginx Proxy
    if ! test_service_health "Nginx Proxy" "http://localhost/health"; then
        all_healthy=false
    fi
    
    # Database connection check
    if docker exec chc-postgres pg_isready -U postgres -d chc_insight_crm > /dev/null 2>&1; then
        success "Database is accepting connections"
    else
        error "Database connection check failed"
        all_healthy=false
    fi
    
    # Redis ping check
    if [ "$(docker exec chc-redis redis-cli ping 2>/dev/null)" = "PONG" ]; then
        success "Redis is responding to ping"
    else
        error "Redis ping failed"
        all_healthy=false
    fi
    
    echo ""
    
    # Show detailed information if requested
    if [ "$DETAILED" = true ]; then
        echo -e "${CYAN}Detailed System Information:${NC}"
        
        # Docker system info
        log "Docker System Status:"
        docker system df
        
        echo ""
        
        # Container resource usage
        log "Container Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
        
        echo ""
        
        # Show recent logs for failed services
        if [ "$all_healthy" = false ]; then
            log "Recent logs for services:"
            for container in "${containers[@]}"; do
                service_name="${container#chc-}"
                get_service_logs "$service_name" 5
                echo ""
            done
        fi
    fi
    
    # Overall status
    echo -e "${CYAN}Overall Health Status:${NC}"
    if [ "$all_healthy" = true ]; then
        success "All services are healthy and running properly"
        return 0
    else
        error "One or more services are not healthy"
        log "Run with -d/--detailed flag for more information"
        return 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--detailed)
            DETAILED=true
            shift
            ;;
        -c|--continuous)
            CONTINUOUS=true
            shift
            ;;
        -i|--interval)
            INTERVAL="$2"
            shift 2
            ;;
        -f|--file)
            COMPOSE_FILE="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
if [ "$CONTINUOUS" = true ]; then
    log "Starting continuous health monitoring (interval: $INTERVAL seconds)"
    warning "Press Ctrl+C to stop"
    
    while true; do
        clear
        if run_health_check; then
            echo ""
            log "Next check in $INTERVAL seconds..."
        else
            echo ""
            warning "Issues detected. Next check in $INTERVAL seconds..."
        fi
        
        sleep "$INTERVAL"
    done
else
    run_health_check
    exit $?
fi