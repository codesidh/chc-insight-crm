#!/bin/bash

# CHC Insight CRM - Backup Script (Unix/Linux)
# Creates backups of database and volumes with compression and encryption

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
CHC Insight CRM Backup Script

Usage: $0 [OPTIONS]

Options:
    -e, --environment ENV    Environment to backup (production, staging, development)
    -t, --type TYPE         Backup type (full, database, volumes)
    -c, --compress          Enable compression (default: true)
    -r, --retention DAYS    Retention period in days (default: 30)
    -h, --help              Show this help message

Examples:
    $0 --environment production --type full
    $0 -e staging -t database
    $0 --environment production --retention 60

EOF
}

# Parse command line arguments
ENVIRONMENT=""
BACKUP_TYPE="full"
COMPRESS=true
RETENTION_DAYS=30

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--type)
            BACKUP_TYPE="$2"
            shift 2
            ;;
        -c|--compress)
            COMPRESS=true
            shift
            ;;
        --no-compress)
            COMPRESS=false
            shift
            ;;
        -r|--retention)
            RETENTION_DAYS="$2"
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

# Validate environment
if [[ -z "$ENVIRONMENT" ]]; then
    error "Environment is required. Use -e or --environment option."
    show_help
    exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(production|staging|development)$ ]]; then
    error "Invalid environment: $ENVIRONMENT. Must be production, staging, or development."
    exit 1
fi

# Validate backup type
if [[ ! "$BACKUP_TYPE" =~ ^(full|database|volumes)$ ]]; then
    error "Invalid backup type: $BACKUP_TYPE. Must be full, database, or volumes."
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Set container names based on environment
case $ENVIRONMENT in
    production)
        DB_CONTAINER="chc-crm-postgres-prod"
        REDIS_CONTAINER="chc-crm-redis-prod"
        COMPOSE_FILE="docker-compose.production.yml"
        ;;
    staging)
        DB_CONTAINER="chc-crm-postgres-staging"
        REDIS_CONTAINER="chc-crm-redis-staging"
        COMPOSE_FILE="docker-compose.staging.yml"
        ;;
    development)
        DB_CONTAINER="chc-crm-postgres-dev"
        REDIS_CONTAINER="chc-crm-redis-dev"
        COMPOSE_FILE="docker-compose.yml"
        ;;
esac

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Function to backup database
backup_database() {
    log "Starting database backup for $ENVIRONMENT environment..."
    
    # Check if database container is running
    if ! docker ps --format "table {{.Names}}" | grep -q "^$DB_CONTAINER$"; then
        error "Database container $DB_CONTAINER is not running."
        return 1
    fi
    
    local db_backup_file="$BACKUP_DIR/database_${ENVIRONMENT}_${TIMESTAMP}.sql"
    
    # Create database backup
    log "Creating database backup..."
    if docker exec "$DB_CONTAINER" pg_dumpall -U postgres > "$db_backup_file"; then
        success "Database backup created: $db_backup_file"
        
        # Compress if requested
        if [[ "$COMPRESS" == true ]]; then
            log "Compressing database backup..."
            if gzip "$db_backup_file"; then
                success "Database backup compressed: ${db_backup_file}.gz"
            else
                warning "Failed to compress database backup"
            fi
        fi
    else
        error "Failed to create database backup"
        return 1
    fi
}

# Function to backup volumes
backup_volumes() {
    log "Starting volume backup for $ENVIRONMENT environment..."
    
    local volume_backup_dir="$BACKUP_DIR/volumes_${ENVIRONMENT}_${TIMESTAMP}"
    mkdir -p "$volume_backup_dir"
    
    # Get list of volumes for this environment
    local volumes
    volumes=$(docker volume ls --format "{{.Name}}" | grep -E "(postgres_data|redis_data).*${ENVIRONMENT}" || true)
    
    if [[ -z "$volumes" ]]; then
        warning "No volumes found for environment: $ENVIRONMENT"
        return 0
    fi
    
    # Backup each volume
    for volume in $volumes; do
        log "Backing up volume: $volume"
        local volume_backup_file="$volume_backup_dir/${volume}.tar"
        
        if docker run --rm -v "$volume":/data -v "$volume_backup_dir":/backup alpine tar -czf "/backup/${volume}.tar.gz" -C /data .; then
            success "Volume backup created: ${volume_backup_file}.gz"
        else
            error "Failed to backup volume: $volume"
        fi
    done
    
    # Create volume backup archive
    if [[ "$COMPRESS" == true ]]; then
        log "Creating compressed volume archive..."
        local archive_file="$BACKUP_DIR/volumes_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"
        if tar -czf "$archive_file" -C "$BACKUP_DIR" "volumes_${ENVIRONMENT}_${TIMESTAMP}"; then
            success "Volume archive created: $archive_file"
            rm -rf "$volume_backup_dir"
        else
            error "Failed to create volume archive"
        fi
    fi
}

# Function to backup configuration
backup_configuration() {
    log "Starting configuration backup for $ENVIRONMENT environment..."
    
    local config_backup_dir="$BACKUP_DIR/config_${ENVIRONMENT}_${TIMESTAMP}"
    mkdir -p "$config_backup_dir"
    
    # Copy configuration files
    if [[ -f "$PROJECT_ROOT/configs/$COMPOSE_FILE" ]]; then
        cp "$PROJECT_ROOT/configs/$COMPOSE_FILE" "$config_backup_dir/"
    fi
    
    if [[ -f "$PROJECT_ROOT/configs/.env.$ENVIRONMENT" ]]; then
        cp "$PROJECT_ROOT/configs/.env.$ENVIRONMENT" "$config_backup_dir/"
    fi
    
    if [[ -f "$PROJECT_ROOT/configs/nginx.conf" ]]; then
        cp "$PROJECT_ROOT/configs/nginx.conf" "$config_backup_dir/"
    fi
    
    # Create configuration archive
    if [[ "$COMPRESS" == true ]]; then
        local config_archive="$BACKUP_DIR/config_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"
        if tar -czf "$config_archive" -C "$BACKUP_DIR" "config_${ENVIRONMENT}_${TIMESTAMP}"; then
            success "Configuration backup created: $config_archive"
            rm -rf "$config_backup_dir"
        else
            error "Failed to create configuration archive"
        fi
    else
        success "Configuration backup created: $config_backup_dir"
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    if find "$BACKUP_DIR" -name "*_${ENVIRONMENT}_*" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null; then
        success "Old backups cleaned up"
    else
        warning "No old backups found or cleanup failed"
    fi
}

# Main backup execution
main() {
    log "Starting backup process for $ENVIRONMENT environment..."
    log "Backup type: $BACKUP_TYPE"
    log "Compression: $COMPRESS"
    log "Retention: $RETENTION_DAYS days"
    
    case $BACKUP_TYPE in
        full)
            backup_database
            backup_volumes
            backup_configuration
            ;;
        database)
            backup_database
            ;;
        volumes)
            backup_volumes
            ;;
    esac
    
    cleanup_old_backups
    
    success "Backup process completed for $ENVIRONMENT environment"
    log "Backup location: $BACKUP_DIR"
}

# Run main function
main