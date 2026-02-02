#!/bin/bash

# 更新应用脚本
# 使用方法: bash update.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
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

# 拉取最新代码
echo -e "${BLUE}[INFO]${NC} 拉取最新代码..."
git pull origin main

# 重新构建
echo -e "${BLUE}[INFO]${NC} 重新构建镜像..."
${DOCKER_COMPOSE_CMD} build

# 重启服务
echo -e "${BLUE}[INFO]${NC} 重启服务..."
${DOCKER_COMPOSE_CMD} up -d

echo -e "${GREEN}[SUCCESS]${NC} 更新完成！"
echo ""
echo "查看日志: ${DOCKER_COMPOSE_CMD} logs -f"
