#!/bin/bash

# 更新应用脚本
# 使用方法: bash update.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[INFO]${NC} 开始更新应用..."

# 拉取最新代码
echo -e "${BLUE}[INFO]${NC} 拉取最新代码..."
git pull origin main

# 重新构建
echo -e "${BLUE}[INFO]${NC} 重新构建镜像..."
docker-compose build

# 重启服务
echo -e "${BLUE}[INFO]${NC} 重启服务..."
docker-compose up -d

echo -e "${GREEN}[SUCCESS]${NC} 更新完成！"
echo ""
echo "查看日志: docker-compose logs -f"
