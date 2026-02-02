#!/bin/bash

# Docker Hub 仓库创建和验证脚本

echo "========================================="
echo "Docker Hub 仓库验证脚本"
echo "========================================="
echo ""

# 检查是否已登录
echo "1. 检查 Docker Hub 登录状态..."
if docker info | grep -q "Username"; then
    echo "✅ 已登录 Docker Hub"
    docker info | grep "Username"
else
    echo "❌ 未登录 Docker Hub"
    echo "请先运行: docker login"
    exit 1
fi

echo ""

# 检查目标仓库是否存在
echo "2. 检查目标仓库是否存在..."
echo "目标仓库: amyflash/music-management-system"

if docker manifest inspect amyflash/music-management-system:latest >/dev/null 2>&1; then
    echo "✅ 仓库已存在"
    docker manifest inspect amyflash/music-management-system:latest | grep -A 5 "mediaType"
else
    echo "❌ 仓库不存在"
    echo ""
    echo "⚠️  需要先在 Docker Hub 上创建仓库："
    echo ""
    echo "步骤："
    echo "1. 访问：https://hub.docker.com"
    echo "2. 点击右上角 'Create Repository'"
    echo "3. Name: music-management-system"
    echo "4. Visibility: Public 或 Private"
    echo "5. 点击 'Create'"
    echo ""
    echo "或者运行以下命令创建："
    echo "   curl -X POST https://hub.docker.com/v2/repositories/amyflash/ \\"
    echo "     -H 'Authorization: Bearer \$DOCKER_TOKEN' \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"name\":\"music-management-system\",\"is_private\":false}'"
    echo ""
    exit 1
fi

echo ""

# 测试推送权限
echo "3. 测试推送权限..."
echo "创建测试镜像..."
echo "FROM alpine" | docker build -t amyflash/music-management-system:test-$(date +%s) -

echo "推送测试镜像..."
TAG="test-$(date +%s)"
docker push amyflash/music-management-system:$TAG

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！权限正常"

    echo ""
    echo "清理测试镜像..."
    docker rmi amyflash/music-management-system:$TAG

    echo ""
    echo "========================================="
    echo "✅ 所有检查通过！可以正常构建和推送"
    echo "========================================="
else
    echo "❌ 推送失败！权限不足"
    exit 1
fi
