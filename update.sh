#!/bin/bash

# 更新应用脚本（SQLite 版本）
# 使用方法: bash update.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检测 Docker Compose 命令
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo -e "${RED}[ERROR]${NC} 未找到 Docker Compose"
    exit 1
fi

echo -e "${BLUE}[INFO]${NC} 开始更新应用..."

# 备份当前数据
echo -e "${BLUE}[INFO]${NC} 备份当前数据..."
BACKUP_DIR="./backups"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p ${BACKUP_DIR}

if [ -f "data/music.db" ]; then
    cp data/music.db ${BACKUP_DIR}/music.db.${BACKUP_DATE}
    echo -e "${GREEN}[SUCCESS]${NC} 数据库已备份: ${BACKUP_DIR}/music.db.${BACKUP_DATE}"
fi

# 拉取最新代码
echo -e "${BLUE}[INFO]${NC} 拉取最新代码..."
git pull origin main

# 询问使用预构建镜像还是重新构建
read -p "是否使用预构建的 Docker Hub 镜像？(推荐，y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 使用预构建镜像
    echo -e "${BLUE}[INFO]${NC} 拉取最新镜像..."
    ${DOCKER_COMPOSE_CMD} pull app
else
    # 重新构建
    echo -e "${BLUE}[INFO]${NC} 重新构建镜像..."
    ${DOCKER_COMPOSE_CMD} build
fi

# 重启服务
echo -e "${BLUE}[INFO]${NC} 重启服务..."
${DOCKER_COMPOSE_CMD} up -d

# 等待服务就绪
echo -e "${BLUE}[INFO]${NC} 等待服务启动..."
sleep 5
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f -s http://localhost:5000 >/dev/null 2>&1; then
        echo -e "${GREEN}[SUCCESS]${NC} 服务已启动"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${YELLOW}[WARNING]${NC} 服务启动可能有问题，请检查日志"
fi

echo -e "${GREEN}[SUCCESS]${NC} 更新完成！"
echo ""
echo "查看日志: ${DOCKER_COMPOSE_CMD} logs -f"
echo "查看状态: ${DOCKER_COMPOSE_CMD} ps"
