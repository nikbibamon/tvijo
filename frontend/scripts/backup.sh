#!/bin/bash

# Tvijo Frontend Backup Script
# Создает полный бэкап фронтенда

set -e

# Настройки
BACKUP_DIR="/home/biba/sites/tvijo.com/bibamoney-frontend/backups"
TIMESTAMP=$(date +%Y-%m-%d-%H-%M-%S)
PROJECT_DIR="/home/biba/sites/tvijo.com/bibamoney-frontend"

# Создание директории для бэкапов
mkdir -p "$BACKUP_DIR"

echo "=== Starting Tvijo Frontend Backup ==="
echo "Timestamp: $TIMESTAMP"

# 1. Бэкап .env.local файла
echo "Backing up .env.local file..."
if [ -f "$PROJECT_DIR/.env.local" ]; then
    cp "$PROJECT_DIR/.env.local" "$BACKUP_DIR/env-local-$TIMESTAMP.backup"
    echo "Environment backup created: $BACKUP_DIR/env-local-$TIMESTAMP.backup"
fi

# 2. Бэкап исходного кода и файлов
echo "Backing up source code and files..."
SOURCE_BACKUP="$BACKUP_DIR/bibamoney-frontend-$TIMESTAMP.tar.gz"
tar -czf "$SOURCE_BACKUP" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='out' \
    --exclude='test-results' \
    --exclude='playwright-report' \
    --exclude='.playwright-artifacts-*' \
    --exclude='backups' \
    -C "$PROJECT_DIR" .
echo "Source backup created: $SOURCE_BACKUP"

# 3. Очистка старых бэкапов (оставляем последние 7)
echo "Cleaning old backups (keeping last 7)..."
ls -t "$BACKUP_DIR"/bibamoney-frontend-*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm --
ls -t "$BACKUP_DIR"/env-local-*.backup 2>/dev/null | tail -n +8 | xargs -r rm --

echo "=== Backup completed successfully ==="
echo "Backup location: $BACKUP_DIR"
echo "Files created:"
ls -lh "$BACKUP_DIR"/*$TIMESTAMP* 2>/dev/null || true
