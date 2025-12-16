#!/bin/bash

# Production Deployment Script for Telegram Mini App Calls
# Usage: ./deploy.sh [init|build|start|stop|restart|logs|backup]

set -e

PROJECT_NAME="telegram-mini-app-calls"
COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        log_error ".env file not found!"
        log_info "Please copy .env.prod to .env and configure it:"
        log_info "  cp .env.prod .env"
        log_info "  nano .env"
        exit 1
    fi
}

# Initialize (first time setup)
init() {
    log_info "Initializing production environment..."

    # Check if .env exists
    if [ -f .env ]; then
        log_warn ".env already exists. Skipping creation."
    else
        log_info "Creating .env from .env.prod..."
        cp .env.prod .env
        log_info "Please edit .env file with your production values:"
        log_info "  nano .env"
        exit 0
    fi

    # Create acme.json for Let's Encrypt
    if [ ! -f docker/traefik/acme.json ]; then
        log_info "Creating acme.json for SSL certificates..."
        touch docker/traefik/acme.json
        chmod 600 docker/traefik/acme.json
    fi

    # Create external network for Traefik
    if ! docker network inspect web >/dev/null 2>&1; then
        log_info "Creating external network 'web'..."
        docker network create web
    else
        log_info "Network 'web' already exists."
    fi

    log_info "Initialization complete!"
    log_info "Next steps:"
    log_info "  1. Edit .env file: nano .env"
    log_info "  2. Build and start: ./deploy.sh build"
}

# Build Docker images
build() {
    check_env
    log_info "Building Docker images..."

    # Load environment variables
    export $(cat .env | grep -v '^#' | xargs)

    docker-compose -f $COMPOSE_FILE build --no-cache

    log_info "Build completed successfully!"
}

# Start services
start() {
    check_env
    log_info "Starting services..."

    # Load environment variables
    export $(cat .env | grep -v '^#' | xargs)

    docker-compose -f $COMPOSE_FILE up -d

    log_info "Services started successfully!"
    log_info "Checking service status..."
    docker-compose -f $COMPOSE_FILE ps

    log_info ""
    log_info "Your application should be available at:"
    log_info "  Frontend:  https://app.notfully.ru"
    log_info "  Backend:   https://backend.notfully.ru"
    log_info "  API Docs:  https://backend.notfully.ru/docs"
    log_info "  Traefik:   https://traefik.notfully.ru"
    log_info ""
    log_info "To view logs: ./deploy.sh logs"
}

# Stop services
stop() {
    log_info "Stopping services..."
    docker-compose -f $COMPOSE_FILE down
    log_info "Services stopped."
}

# Restart services
restart() {
    log_info "Restarting services..."
    docker-compose -f $COMPOSE_FILE restart
    log_info "Services restarted."
}

# View logs
logs() {
    SERVICE=${1:-}
    if [ -z "$SERVICE" ]; then
        docker-compose -f $COMPOSE_FILE logs -f
    else
        docker-compose -f $COMPOSE_FILE logs -f $SERVICE
    fi
}

# Backup database
backup() {
    log_info "Creating database backup..."

    BACKUP_DIR="./backups"
    mkdir -p $BACKUP_DIR

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/postgres_backup_$TIMESTAMP.sql"

    docker exec telegram_calls_postgres pg_dump -U telegram_calls telegram_calls > $BACKUP_FILE

    if [ $? -eq 0 ]; then
        log_info "Backup created successfully: $BACKUP_FILE"

        # Compress backup
        gzip $BACKUP_FILE
        log_info "Backup compressed: ${BACKUP_FILE}.gz"

        # Keep only last 7 backups
        log_info "Cleaning old backups (keeping last 7)..."
        ls -t $BACKUP_DIR/postgres_backup_*.sql.gz | tail -n +8 | xargs -r rm
    else
        log_error "Backup failed!"
        exit 1
    fi
}

# Update application (pull and rebuild)
update() {
    log_info "Updating application..."

    # Pull latest code
    log_info "Pulling latest code from git..."
    git pull origin master

    # Rebuild and restart
    log_info "Rebuilding services..."
    export $(cat .env | grep -v '^#' | xargs)
    docker-compose -f $COMPOSE_FILE up -d --build

    log_info "Update completed!"
}

# Show status
status() {
    log_info "Service status:"
    docker-compose -f $COMPOSE_FILE ps

    log_info ""
    log_info "Network status:"
    docker network inspect web --format='{{.Name}}: {{.Driver}}' 2>/dev/null || log_warn "Network 'web' not found"

    log_info ""
    log_info "SSL Certificates:"
    if [ -f docker/traefik/acme.json ]; then
        CERT_COUNT=$(cat docker/traefik/acme.json | jq '.Certificates | length' 2>/dev/null || echo "0")
        log_info "Number of certificates: $CERT_COUNT"
    else
        log_warn "acme.json not found"
    fi
}

# Main script
case "${1:-}" in
    init)
        init
        ;;
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "${2:-}"
        ;;
    backup)
        backup
        ;;
    update)
        update
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {init|build|start|stop|restart|logs|backup|update|status}"
        echo ""
        echo "Commands:"
        echo "  init     - Initialize production environment (first time setup)"
        echo "  build    - Build Docker images"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - View logs (optional: specify service name)"
        echo "  backup   - Create database backup"
        echo "  update   - Pull latest code and rebuild"
        echo "  status   - Show service status"
        echo ""
        echo "Examples:"
        echo "  $0 init                  # First time setup"
        echo "  $0 build                 # Build images"
        echo "  $0 start                 # Start services"
        echo "  $0 logs backend          # View backend logs"
        echo "  $0 backup                # Backup database"
        exit 1
        ;;
esac

exit 0
