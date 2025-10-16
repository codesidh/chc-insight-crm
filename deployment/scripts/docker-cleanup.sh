#!/bin/bash

# Docker Cleanup Script (Bash)
# Completely cleans Docker environment - containers, images, volumes, networks, and build cache

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default options
FORCE=false
KEEP_VOLUMES=false
VERBOSE=false

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
    echo "Docker Cleanup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -f, --force         Skip confirmation prompt"
    echo "  -k, --keep-volumes  Preserve Docker volumes"
    echo "  -v, --verbose       Show detailed output"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Interactive cleanup with confirmation"
    echo "  $0 -f                 # Skip confirmation prompt"
    echo "  $0 -k                 # Preserve Docker volumes"
    echo "  $0 -v                 # Show detailed output"
    echo "  $0 -f -v              # Force cleanup with detailed output"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--force)
            FORCE=true
            shift
            ;;
        -k|--keep-volumes)
            KEEP_VOLUMES=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
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

# Check if Docker is running
if ! docker info &> /dev/null; then
    error "Docker is not running. Please start Docker first."
    exit 1
fi

success "Docker is running"

# Confirmation prompt unless --force is used
if [ "$FORCE" = false ]; then
    warning "This will completely clean your Docker environment:"
    echo -e "  ${YELLOW}- Stop and remove all containers${NC}"
    echo -e "  ${YELLOW}- Remove all images${NC}"
    echo -e "  ${YELLOW}- Remove all networks${NC}"
    if [ "$KEEP_VOLUMES" = false ]; then
        echo -e "  ${YELLOW}- Remove all volumes (use -k/--keep-volumes to preserve)${NC}"
    fi
    echo -e "  ${YELLOW}- Clear all build cache${NC}"
    echo ""
    
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Operation cancelled by user"
        exit 0
    fi
fi

log "Starting Docker cleanup..."

# Step 1: Stop all running containers
log "Stopping all running containers..."
RUNNING_CONTAINERS=$(docker ps -q)
if [ -n "$RUNNING_CONTAINERS" ]; then
    docker stop $RUNNING_CONTAINERS
    CONTAINER_COUNT=$(echo "$RUNNING_CONTAINERS" | wc -l)
    success "Stopped $CONTAINER_COUNT containers"
else
    log "No running containers found"
fi

# Step 2: Remove all containers
log "Removing all containers..."
ALL_CONTAINERS=$(docker ps -aq)
if [ -n "$ALL_CONTAINERS" ]; then
    docker rm $ALL_CONTAINERS
    CONTAINER_COUNT=$(echo "$ALL_CONTAINERS" | wc -l)
    success "Removed $CONTAINER_COUNT containers"
else
    log "No containers found"
fi

# Step 3: Remove all images
log "Removing all images..."
ALL_IMAGES=$(docker images -q)
if [ -n "$ALL_IMAGES" ]; then
    docker rmi $ALL_IMAGES -f
    IMAGE_COUNT=$(echo "$ALL_IMAGES" | wc -l)
    success "Removed $IMAGE_COUNT images"
else
    log "No images found"
fi

# Step 4: Remove volumes (unless --keep-volumes is specified)
if [ "$KEEP_VOLUMES" = false ]; then
    log "Removing all volumes..."
    VOLUME_RESULT=$(docker volume prune -f)
    if [ "$VERBOSE" = true ]; then
        echo "$VOLUME_RESULT"
    fi
    success "Removed unused volumes"
else
    log "Skipping volume removal (keep-volumes flag set)"
fi

# Step 5: Remove networks
log "Removing unused networks..."
NETWORK_RESULT=$(docker network prune -f)
if [ "$VERBOSE" = true ]; then
    echo "$NETWORK_RESULT"
fi
success "Removed unused networks"

# Step 6: Clear build cache
log "Clearing build cache..."
BUILDER_RESULT=$(docker builder prune -a -f)
if [ "$VERBOSE" = true ]; then
    echo "$BUILDER_RESULT"
fi
success "Cleared builder cache"

# Step 7: Clear buildx cache
log "Clearing buildx cache..."
if command -v docker buildx &> /dev/null; then
    BUILDX_RESULT=$(docker buildx prune -a -f)
    if [ "$VERBOSE" = true ]; then
        echo "$BUILDX_RESULT"
    fi
    success "Cleared buildx cache"
else
    warning "Docker buildx not available, skipping buildx cache cleanup"
fi

# Step 8: Final system cleanup
log "Running final system cleanup..."
SYSTEM_RESULT=$(docker system prune -a -f)
if [ "$VERBOSE" = true ]; then
    echo "$SYSTEM_RESULT"
fi
success "System cleanup completed"

# Display final status
log "Displaying final Docker status..."
echo ""
echo -e "${CYAN}=== FINAL DOCKER STATUS ===${NC}"
docker system df
echo ""
success "Docker cleanup completed successfully!"
log "Your Docker environment is now completely clean."

echo ""
echo -e "${CYAN}Usage examples:${NC}"
echo "  $0                    # Interactive cleanup with confirmation"
echo "  $0 -f                 # Skip confirmation prompt"
echo "  $0 -k                 # Preserve Docker volumes"
echo "  $0 -v                 # Show detailed output"
echo "  $0 -f -v              # Force cleanup with detailed output"