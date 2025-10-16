#!/bin/bash

# CHC Insight CRM - Production Deployment Script
# Requirements: 13.1, 13.3

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker first."
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        error "Environment file $ENV_FILE not found. Please copy .env.production.example to $ENV_FILE and configure it."
    fi
    
    # Check if required directories exist
    mkdir -p logs backups nginx/ssl monitoring/grafana/dashboards monitoring/grafana/datasources
    
    success "Prerequisites check completed"
}

# Backup existing data
backup_data() {
    log "Creating backup..."
    
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/backup_$BACKUP_TIMESTAMP"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup database if container is running
    if docker ps | grep -q chc-postgres; then
        log "Backing up database..."
        docker exec chc-postgres pg_dump -U postgres chc_insight_crm > "$BACKUP_PATH/database.sql"
        success "Database backup completed"
    else
        warning "Database container not running, skipping database backup"
    fi
    
    # Backup volumes
    if docker volume ls | grep -q chc-insight-crm_postgres_data; then
        log "Backing up PostgreSQL volume..."
        docker run --rm -v chc-insight-crm_postgres_data:/data -v "$PWD/$BACKUP_PATH":/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
    fi
    
    if docker volume ls | grep -q chc-insight-crm_redis_data; then
        log "Backing up Redis volume..."
        docker run --rm -v chc-insight-crm_redis_data:/data -v "$PWD/$BACKUP_PATH":/backup alpine tar czf /backup/redis_data.tar.gz -C /data .
    fi
    
    success "Backup completed: $BACKUP_PATH"
}

# Build and deploy
deploy() {
    log "Starting deployment..."
    
    # Pull latest images
    log "Pulling latest base images..."
    docker-compose -f "$COMPOSE_FILE" pull postgres redis nginx prometheus grafana
    
    # Build application images
    log "Building application images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache backend frontend
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down
    
    # Start services in order
    log "Starting database services..."
    docker-compose -f "$COMPOSE_FILE" up -d postgres redis
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    timeout=60
    while ! docker exec chc-postgres pg_isready -U postgres -d chc_insight_crm &> /dev/null; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            error "Database failed to start within 60 seconds"
        fi
    done
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose -f "$COMPOSE_FILE" run --rm backend npm run migrate:latest
    
    # Start application services
    log "Starting application services..."
    docker-compose -f "$COMPOSE_FILE" up -d backend frontend
    
    # Wait for backend to be ready
    log "Waiting for backend to be ready..."
    timeout=60
    while ! curl -f http://localhost:3001/health &> /dev/null; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            error "Backend failed to start within 60 seconds"
        fi
    done
    
    # Start reverse proxy
    log "Starting reverse proxy..."
    docker-compose -f "$COMPOSE_FILE" up -d nginx
    
    # Start monitoring (optional)
    if [ "$1" = "--with-monitoring" ]; then
        log "Starting monitoring services..."
        docker-compose -f "$COMPOSE_FILE" up -d prometheus grafana
    fi
    
    success "Deployment completed successfully"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Check if all required services are running
    services=("chc-postgres" "chc-redis" "chc-backend" "chc-frontend" "chc-nginx")
    
    for service in "${services[@]}"; do
        if docker ps | grep -q "$service"; then
            success "$service is running"
        else
            error "$service is not running"
        fi
    done
    
    # Check service health
    log "Checking service health..."
    
    # Database health
    if docker exec chc-postgres pg_isready -U postgres -d chc_insight_crm &> /dev/null; then
        success "Database is healthy"
    else
        error "Database health check failed"
    fi
    
    # Redis health
    if docker exec chc-redis redis-cli ping | grep -q PONG; then
        success "Redis is healthy"
    else
        error "Redis health check failed"
    fi
    
    # Backend health
    if curl -f http://localhost:3001/health &> /dev/null; then
        success "Backend is healthy"
    else
        error "Backend health check failed"
    fi
    
    # Frontend health (through nginx)
    if curl -f http://localhost/health &> /dev/null; then
        success "Frontend is healthy"
    else
        error "Frontend health check failed"
    fi
    
    success "All health checks passed"
}

# Cleanup old images and volumes
cleanup() {
    log "Cleaning up old Docker images and volumes..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old backups (keep last 7 days)
    find "$BACKUP_DIR" -type d -name "backup_*" -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
    
    success "Cleanup completed"
}

# Show logs
show_logs() {
    log "Showing recent logs..."
    docker-compose -f "$COMPOSE_FILE" logs --tail=50 "$1"
}

# Main script
main() {
    case "$1" in
        "deploy")
            check_prerequisites
            backup_data
            deploy "$2"
            health_check
            cleanup
            ;;
        "backup")
            backup_data
            ;;
        "health")
            health_check
            ;;
        "logs")
            show_logs "$2"
            ;;
        "cleanup")
            cleanup
            ;;
        "stop")
            log "Stopping all services..."
            docker-compose -f "$COMPOSE_FILE" down
            success "All services stopped"
            ;;
        "restart")
            log "Restarting services..."
            docker-compose -f "$COMPOSE_FILE" restart
            health_check
            ;;
        *)
            echo "Usage: $0 {deploy|backup|health|logs|cleanup|stop|restart}"
            echo ""
            echo "Commands:"
            echo "  deploy [--with-monitoring]  - Deploy the application"
            echo "  backup                      - Create a backup of data"
            echo "  health                      - Check service health"
            echo "  logs [service]              - Show logs for all services or specific service"
            echo "  cleanup                     - Clean up old images and backups"
            echo "  stop                        - Stop all services"
            echo "  restart                     - Restart all services"
            echo ""
            echo "Examples:"
            echo "  $0 deploy                   - Deploy without monitoring"
            echo "  $0 deploy --with-monitoring - Deploy with monitoring services"
            echo "  $0 logs backend             - Show backend logs"
            exit 1
            ;;
    esac
}

# Create log directory
mkdir -p logs

# Run main function
main "$@"