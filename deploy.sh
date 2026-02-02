#!/bin/bash

# 音乐管理系统 Docker 一键部署脚本
# 使用方法: bash deploy.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印信息函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${GREEN}=== $1 ===${NC}\n"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查系统要求
check_requirements() {
    print_step "检查系统要求"

    # 检查 Docker
    if command_exists docker; then
        print_success "Docker 已安装: $(docker --version)"
    else
        print_error "Docker 未安装，请先安装 Docker"
        echo "安装命令: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi

    # 检查 Docker Compose
    if command_exists docker-compose; then
        print_success "Docker Compose 已安装: $(docker-compose --version)"
    elif docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose (Plugin) 已安装: $(docker compose version)"
    else
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        echo "安装命令: pip install docker-compose 或 apt install docker-compose"
        exit 1
    fi

    # 检查端口占用
    if netstat -tuln 2>/dev/null | grep -q ':5000' || ss -tuln 2>/dev/null | grep -q ':5000'; then
        print_warning "端口 5000 已被占用，请检查是否有其他服务正在运行"
        read -p "是否继续部署？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 配置环境变量
configure_env() {
    print_step "配置环境变量"

    if [ ! -f .env ]; then
        print_info "创建 .env 文件..."
        cp .env.example .env

        # 提示用户修改数据库密码
        print_warning "建议修改默认数据库密码"
        read -p "是否修改数据库密码？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -sp "请输入数据库密码: " db_password
            echo
            sed -i "s/your_secure_password_here/$db_password/g" .env
            print_success "数据库密码已更新"
        fi

        print_success ".env 文件已创建"
    else
        print_info ".env 文件已存在，跳过创建"
    fi
}

# 创建必要目录
create_directories() {
    print_step "创建必要目录"

    mkdir -p public/uploads
    chmod 755 public/uploads
    print_success "public/uploads 目录已创建"
}

# 拉取镜像
pull_images() {
    print_step "拉取 Docker 镜像"

    print_info "拉取 PostgreSQL 镜像..."
    docker pull postgres:15-alpine

    print_info "拉取 Node.js 镜像..."
    docker pull node:20-alpine

    print_success "镜像拉取完成"
}

# 构建应用
build_app() {
    print_step "构建应用"

    print_info "构建 Docker 镜像..."
    docker-compose build

    print_success "应用构建完成"
}

# 启动服务
start_services() {
    print_step "启动服务"

    print_info "启动 Docker 容器..."
    docker-compose up -d

    print_success "服务已启动"
}

# 等待服务就绪
wait_for_services() {
    print_step "等待服务就绪"

    print_info "等待数据库初始化..."
    sleep 10

    # 检查数据库是否就绪
    max_attempts=30
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker-compose exec -T postgres pg_isready -U musicuser -d musicdb >/dev/null 2>&1; then
            print_success "数据库已就绪"
            break
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    if [ $attempt -eq $max_attempts ]; then
        print_error "数据库启动超时"
        exit 1
    fi

    # 等待应用启动
    print_info "等待应用启动..."
    sleep 10

    # 检查应用是否就绪
    max_attempts=30
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s http://localhost:5000 >/dev/null 2>&1; then
            print_success "应用已就绪"
            break
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    if [ $attempt -eq $max_attempts ]; then
        print_error "应用启动超时"
        print_info "请查看日志: docker-compose logs app"
        exit 1
    fi
}

# 显示服务状态
show_status() {
    print_step "服务状态"

    echo ""
    docker-compose ps
    echo ""
}

# 显示访问信息
show_access_info() {
    print_step "访问信息"

    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "访问地址:"
    echo "  本地: http://localhost:5000"
    echo "  外网: http://$(hostname -I | awk '{print $1}'):5000"
    echo ""
    echo "默认登录信息:"
    echo "  用户名: admin"
    echo "  密码: admin123"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
    echo "  查看状态: docker-compose ps"
    echo ""
    echo "数据备份:"
    echo "  备份数据库: docker-compose exec postgres pg_dump -U musicuser musicdb > backup.sql"
    echo "  恢复数据库: docker-compose exec -T postgres psql -U musicuser musicdb < backup.sql"
    echo ""
    echo "配置文件:"
    echo "  环境变量: .env"
    echo "  Docker Compose: docker-compose.yml"
    echo ""
}

# 主函数
main() {
    echo ""
    echo "========================================"
    echo "  音乐管理系统 Docker 一键部署脚本"
    echo "========================================"
    echo ""

    # 检查系统要求
    check_requirements

    # 配置环境变量
    configure_env

    # 创建必要目录
    create_directories

    # 拉取镜像
    pull_images

    # 构建应用
    build_app

    # 启动服务
    start_services

    # 等待服务就绪
    wait_for_services

    # 显示服务状态
    show_status

    # 显示访问信息
    show_access_info
}

# 运行主函数
main
