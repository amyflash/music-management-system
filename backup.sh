#!/bin/bash

# 数据备份脚本（SQLite 版本）
# 使用方法: bash backup.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}[INFO]${NC} 开始备份数据..."

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 备份数据库文件
echo -e "${BLUE}[INFO]${NC} 备份数据库..."
DB_BACKUP="${BACKUP_DIR}/music.db.${DATE}"
if [ -f "data/music.db" ]; then
    cp data/music.db ${DB_BACKUP}
    gzip ${DB_BACKUP}
    echo -e "${GREEN}[SUCCESS]${NC} 数据库备份完成: ${DB_BACKUP}.gz"
else
    echo -e "${YELLOW}[WARNING]${NC} 数据库文件不存在，跳过数据库备份"
fi

# 备份上传文件
echo -e "${BLUE}[INFO]${NC} 备份上传文件..."
UPLOADS_BACKUP="${BACKUP_DIR}/uploads_${DATE}.tar.gz"
if [ -d "public/uploads" ] && [ "$(ls -A public/uploads 2>/dev/null)" ]; then
    tar -czf ${UPLOADS_BACKUP} public/uploads/
    echo -e "${GREEN}[SUCCESS]${NC} 上传文件备份完成: ${UPLOADS_BACKUP}"
else
    echo -e "${YELLOW}[WARNING]${NC} 上传目录为空，跳过上传文件备份"
fi

# 清理 30 天前的备份
echo -e "${BLUE}[INFO]${NC} 清理旧备份..."
find ${BACKUP_DIR} -name "music.db.*.gz" -mtime +30 -delete 2>/dev/null || true
find ${BACKUP_DIR} -name "uploads_*.tar.gz" -mtime +30 -delete 2>/dev/null || true

echo -e "${GREEN}[SUCCESS]${NC} 备份完成！"
echo ""
echo "恢复数据库命令:"
if [ -f "${DB_BACKUP}.gz" ]; then
    echo "  gunzip ${DB_BACKUP}.gz"
    echo "  cp ${DB_BACKUP} data/music.db"
fi
echo ""
echo "恢复上传文件命令:"
if [ -f "${UPLOADS_BACKUP}" ]; then
    echo "  tar -xzf ${UPLOADS_BACKUP} -C public/"
fi
