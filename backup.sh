#!/bin/bash

# 数据备份脚本
# 使用方法: bash backup.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检测 Docker Compose 命令
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo -e "${YELLOW}[WARNING]${NC} 未找到 Docker Compose"
    exit 1
fi

# 配置
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/music_backup_${DATE}.sql"

echo -e "${BLUE}[INFO]${NC} 开始备份数据..."

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 备份数据库
echo -e "${BLUE}[INFO]${NC} 备份数据库..."
${DOCKER_COMPOSE_CMD} exec -T postgres pg_dump -U musicuser musicdb > ${BACKUP_FILE}

# 压缩备份文件
gzip ${BACKUP_FILE}
BACKUP_FILE="${BACKUP_FILE}.gz"

# 清理 30 天前的备份
echo -e "${BLUE}[INFO]${NC} 清理旧备份..."
find ${BACKUP_DIR} -name "*.gz" -mtime +30 -delete

echo -e "${GREEN}[SUCCESS]${NC} 备份完成！"
echo "备份文件: ${BACKUP_FILE}"
echo ""
echo "恢复命令:"
echo "  gunzip ${BACKUP_FILE}"
echo "  ${DOCKER_COMPOSE_CMD} exec -T postgres psql -U musicuser musicdb < ${BACKUP_FILE%.gz}"
