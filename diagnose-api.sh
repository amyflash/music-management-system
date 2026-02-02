#!/bin/bash

# 音乐管理系统 API 诊断脚本

echo "========================================="
echo "音乐管理系统 API 诊断工具"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查容器状态
echo "1. 检查容器状态..."
if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ 容器正在运行${NC}"
    docker compose ps
else
    echo -e "${RED}❌ 容器未运行${NC}"
    docker compose ps
    exit 1
fi

echo ""

# 2. 检查 PostgreSQL 连接
echo "2. 检查 PostgreSQL 连接..."
docker compose exec -T postgres pg_isready -U musicuser
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PostgreSQL 连接正常${NC}"
else
    echo -e "${RED}❌ PostgreSQL 连接失败${NC}"
    exit 1
fi

echo ""

# 3. 检查数据库初始化
echo "3. 检查数据库初始化..."
DB_CHECK=$(docker compose exec -T postgres psql -U musicuser -d musicdb -c "\dt" 2>/dev/null)
if echo "$DB_CHECK" | grep -q "albums"; then
    echo -e "${GREEN}✅ 数据库已初始化${NC}"
    echo "表列表:"
    docker compose exec -T postgres psql -U musicuser -d musicdb -c "\dt" | tail -n +3 | head -n -2
else
    echo -e "${YELLOW}⚠️  数据库未初始化或表不存在${NC}"
fi

echo ""

# 4. 测试 albums API
echo "4. 测试 /api/albums..."
echo "发送请求: GET http://localhost:5000/api/albums"
echo ""

API_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:5000/api/albums)
HTTP_CODE=$(echo "$API_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_BODY=$(echo "$API_RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP 状态码: $HTTP_CODE"
echo "响应内容:"
echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"

echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ API 调用成功${NC}"
else
    echo -e "${RED}❌ API 调用失败 (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# 5. 查看应用日志（最后 20 行）
echo "5. 查看应用日志（最后 20 行）..."
echo -e "${YELLOW}=========================================${NC}"
docker compose logs --tail=20 app
echo -e "${YELLOW}=========================================${NC}"

echo ""

# 6. 查看数据库日志（最后 20 行）
echo "6. 查看数据库日志（最后 20 行）..."
echo -e "${YELLOW}=========================================${NC}"
docker compose logs --tail=20 postgres
echo -e "${YELLOW}=========================================${NC}"

echo ""

# 7. 检查环境变量
echo "7. 检查环境变量..."
echo "DATABASE_URL:"
docker compose exec -T app printenv | grep DATABASE_URL || echo "未找到 DATABASE_URL"

echo ""

# 8. 数据库连接测试
echo "8. 测试数据库连接..."
docker compose exec -T postgres psql -U musicuser -d musicdb -c "SELECT NOW();" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 数据库查询成功${NC}"
else
    echo -e "${RED}❌ 数据库查询失败${NC}"
fi

echo ""

# 9. 检查数据库表数据
echo "9. 检查数据库表数据..."
echo "专辑数量:"
docker compose exec -T postgres psql -U musicuser -d musicdb -c "SELECT COUNT(*) FROM albums;" 2>/dev/null || echo "查询失败"

echo ""
echo "歌曲数量:"
docker compose exec -T postgres psql -U musicuser -d musicdb -c "SELECT COUNT(*) FROM songs;" 2>/dev/null || echo "查询失败"

echo ""

echo "========================================="
echo "诊断完成"
echo "========================================="
echo ""
echo "如果发现问题，请检查："
echo "1. 容器是否正常运行"
echo "2. 数据库是否已初始化"
echo "3. 环境变量是否正确"
echo "4. 数据库连接是否正常"
echo ""
echo "查看完整日志:"
echo "docker compose logs -f app"
echo "docker compose logs -f postgres"
