#!/bin/bash
# Haven Institute - Database Backup Script
# Usage: ./scripts/backup.sh
# Recommended: Add to cron for daily backups

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Load environment variables
source "$PROJECT_DIR/.env"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🗄️ Haven Institute Database Backup"
echo "Date: $DATE"
echo "=================================="

# Backup MariaDB
echo "Backing up MariaDB database..."
docker compose exec -T mariadb mysqldump \
    -u"$DB_USER" \
    -p"$DB_PASSWORD" \
    "$DB_NAME" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    > "$BACKUP_DIR/db_backup_$DATE.sql"

# Compress the backup
gzip "$BACKUP_DIR/db_backup_$DATE.sql"

echo "✅ Database backup created: $BACKUP_DIR/db_backup_$DATE.sql.gz"

# Backup Redis (optional)
echo "Backing up Redis data..."
docker compose exec -T redis redis-cli -a "$REDIS_PASSWORD" BGSAVE
sleep 2
docker cp haven-redis:/data/dump.rdb "$BACKUP_DIR/redis_backup_$DATE.rdb" 2>/dev/null || echo "Redis backup skipped"

# Clean up old backups (keep last 30 days)
echo "Cleaning up old backups (keeping last 30 days)..."
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "redis_backup_*.rdb" -mtime +30 -delete

# List current backups
echo ""
echo "Current backups:"
ls -lah "$BACKUP_DIR"

echo ""
echo "=================================="
echo "✅ Backup complete!"
echo ""
