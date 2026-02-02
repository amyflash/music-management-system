# Docker 部署指南

本指南帮助你使用 Docker 在 VPS 服务器上一键部署音乐管理系统。

## 版本说明

**推荐使用 Docker Compose V2**
- 命令格式：`docker compose`（空格而不是连字符）
- 检测命令：`docker compose version`
- 安装命令：`apt install docker-compose-plugin`

**兼容 Docker Compose V1**
- 命令格式：`docker-compose`（连字符）
- 检测命令：`docker-compose --version`
- 注意：V1 已被废弃，建议升级到 V2

**本指南中的命令默认使用 V2 格式 `docker compose`**
- 如果使用 V1，请将 `docker compose` 替换为 `docker-compose`

---

## 目录

- [系统要求](#系统要求)
- [快速部署](#快速部署)
- [手动部署](#手动部署)
- [配置说明](#配置说明)
- [常用命令](#常用命令)
- [数据备份](#数据备份)
- [故障排查](#故障排查)
- [升级更新](#升级更新)
- [性能优化](#性能优化)

---

## 系统要求

### 硬件要求

- **CPU**: 1 核心以上
- **内存**: 1GB 以上（推荐 2GB）
- **磁盘**: 20GB 以上（根据音乐文件数量调整）
- **网络**: 稳定的网络连接

### 软件要求

- **操作系统**: Linux (Ubuntu 20.04+, CentOS 7+, Debian 10+)
- **Docker**: 20.10 或更高版本
- **Docker Compose**: V2 插件（推荐）或 V1.29+

**检查 Docker Compose 版本：**
```bash
docker compose version  # V2 插件
# 或
docker-compose --version  # V1（已废弃）
```

---

## 快速部署

### 1. 安装 Docker 和 Docker Compose

#### Ubuntu / Debian

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose V2 插件（推荐）
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 或者安装 Docker Compose V1（已废弃）
# sudo apt-get install docker-compose

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 添加当前用户到 docker 组（可选，避免每次使用 sudo）
sudo usermod -aG docker $USER
# 需要重新登录或执行: newgrp docker
```

#### CentOS / RHEL

```bash
# 安装 Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 安装 Docker Compose V2 插件（推荐）
sudo yum install -y docker-compose-plugin

# 或者安装 Docker Compose V1（已废弃）
# sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
# sudo chmod +x /usr/local/bin/docker-compose

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker
```

**验证安装：**
```bash
docker --version
docker compose version  # V2
# 或
docker-compose --version  # V1
```

### 2. 克隆项目

```bash
# 克隆项目到服务器
git clone <your-repo-url> music-system
cd music-system

# 或者上传项目文件
# scp -r music-system user@your-server:/home/user/
```

### 3. 一键部署

```bash
# 赋予执行权限
chmod +x deploy.sh

# 运行部署脚本
bash deploy.sh
```

部署脚本会自动完成以下操作：
- ✅ 检查系统要求
- ✅ 配置环境变量
- ✅ 创建必要目录
- ✅ 拉取 Docker 镜像
- ✅ 构建应用
- ✅ 启动服务
- ✅ 等待服务就绪

### 4. 访问应用

部署完成后，访问：

- **本地**: http://localhost:5000
- **外网**: http://your-server-ip:5000

**默认登录信息**:
- 用户名: `admin`
- 密码: `admin123`

**重要**: 首次登录后请立即修改密码！

---

## 手动部署

如果你想手动控制部署过程，可以按照以下步骤操作：

### 1. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
nano .env
```

修改以下配置：

```env
# 数据库配置（建议修改默认密码）
DB_USER=musicuser
DB_PASSWORD=your_secure_password_here  # 修改为强密码
DB_NAME=musicdb
```

### 2. 创建上传目录

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### 3. 构建和启动

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 4. 初始化数据库

数据库会在首次启动时自动初始化，无需手动操作。

---

## 配置说明

### 环境变量 (.env)

```env
# 数据库配置
DB_USER=musicuser              # 数据库用户名
DB_PASSWORD=your_password      # 数据库密码（建议修改）
DB_NAME=musicdb               # 数据库名称

# 应用配置
NODE_ENV=production           # 运行环境
PORT=5000                     # 应用端口
```

### Docker Compose 配置 (docker-compose.yml)

#### 修改端口

如果端口 5000 被占用，可以修改为其他端口：

```yaml
services:
  app:
    ports:
      - "8080:5000"  # 容器端口保持 5000，映射到主机 8080
```

#### 修改数据库端口

如果需要从外部访问数据库：

```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # 映射到主机 5433 端口
```

#### 配置资源限制

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
  postgres:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

---

## 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看应用日志
docker-compose logs -f app

# 查看数据库日志
docker-compose logs -f postgres
```

### 进入容器

```bash
# 进入应用容器
docker-compose exec app sh

# 进入数据库容器
docker-compose exec postgres bash

# 连接数据库
docker-compose exec postgres psql -U musicuser -d musicdb
```

### 数据库操作

```bash
# 连接数据库
docker-compose exec postgres psql -U musicuser -d musicdb

# 查看所有表
\dt

# 查看专辑表
SELECT * FROM albums;

# 查看歌曲表
SELECT * FROM songs;

# 退出
\q
```

---

## 数据备份

### 自动备份（推荐）

使用备份脚本定时备份：

```bash
# 赋予执行权限
chmod +x backup.sh

# 手动备份
bash backup.sh

# 添加定时任务（每天凌晨 2 点备份）
crontab -e

# 添加以下行
0 2 * * * cd /path/to/music-system && bash backup.sh
```

### 手动备份

#### 备份数据库

```bash
# 创建备份目录
mkdir -p backups

# 备份数据库
docker-compose exec postgres pg_dump -U musicuser musicdb > backups/music_backup_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份文件
gzip backups/music_backup_*.sql
```

#### 备份上传文件

```bash
# 备份上传的文件
tar -czf backups/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/
```

#### 恢复数据库

```bash
# 解压备份文件（如果已压缩）
gunzip backups/music_backup_20240101_020000.sql.gz

# 恢复数据库
docker-compose exec -T postgres psql -U musicuser musicdb < backups/music_backup_20240101_020000.sql
```

#### 恢复上传文件

```bash
# 恢复上传文件
tar -xzf backups/uploads_backup_20240101_020000.tar.gz
```

---

## 故障排查

### 应用无法访问

#### 检查服务状态

```bash
docker-compose ps
```

如果服务未运行，检查日志：

```bash
docker-compose logs app
```

#### 检查端口是否开放

```bash
# 检查端口监听
netstat -tuln | grep 5000
# 或
ss -tuln | grep 5000

# 检查防火墙
sudo ufw status
sudo firewall-cmd --list-ports  # CentOS/RHEL
```

如果防火墙阻止了端口，添加规则：

```bash
# Ubuntu/Debian
sudo ufw allow 5000/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

### 数据库连接失败

#### 检查数据库状态

```bash
docker-compose ps postgres
docker-compose logs postgres
```

#### 测试数据库连接

```bash
docker-compose exec postgres pg_isready -U musicuser -d musicdb
```

#### 重启数据库

```bash
docker-compose restart postgres
```

### 文件上传失败

#### 检查目录权限

```bash
ls -la public/uploads

# 修复权限
chmod 755 public/uploads
chown -R $(id -u):$(id -g) public/uploads
```

#### 检查磁盘空间

```bash
df -h
```

如果磁盘空间不足，清理 Docker 缓存：

```bash
docker system prune -a
```

### 应用启动缓慢

#### 增加内存限制

修改 `docker-compose.yml`：

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
```

#### 优化数据库性能

在 `docker-compose.yml` 中添加：

```yaml
services:
  postgres:
    command:
      - postgres
      - -c
      - shared_buffers=256MB
      - -c
      - max_connections=100
      - -c
      - effective_cache_size=1GB
```

---

## 升级更新

### 使用更新脚本

```bash
# 赋予执行权限
chmod +x update.sh

# 运行更新脚本
bash update.sh
```

### 手动更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 备份数据（可选但推荐）
bash backup.sh

# 3. 重新构建
docker-compose build

# 4. 重启服务
docker-compose up -d

# 5. 查看日志
docker-compose logs -f
```

---

## 性能优化

### 1. 启用 Nginx 反向代理

安装 Nginx：

```bash
sudo apt-get install nginx
```

配置 Nginx：

```bash
sudo nano /etc/nginx/sites-available/music-system
```

添加以下配置：

```nginx
upstream music_backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名

    # 文件上传大小限制
    client_max_body_size 50M;

    # 静态文件缓存
    location /uploads/ {
        alias /path/to/music-system/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 反向代理到应用
    location / {
        proxy_pass http://music_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/music-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. 配置 HTTPS

使用 Certbot 免费证书：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 3. 配置 Redis 缓存（可选）

修改 `docker-compose.yml`：

```yaml
services:
  redis:
    image: redis:alpine
    container_name: music-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### 4. 数据库优化

在 `docker-compose.yml` 中添加 PostgreSQL 优化参数：

```yaml
services:
  postgres:
    command:
      - postgres
      - -c
      - shared_buffers=256MB
      - -c
      - work_mem=16MB
      - -c
      - effective_cache_size=1GB
      - -c
      - maintenance_work_mem=128MB
      - -c
      - checkpoint_completion_target=0.9
      - -c
      - wal_buffers=16MB
      - -c
      - default_statistics_target=100
      - -c
      - random_page_cost=1.1
      - -c
      - effective_io_concurrency=200
      - -c
      - work_mem=2621kB
      - -c
      - min_wal_size=1GB
      - -c
      - max_wal_size=4GB
```

---

## 安全建议

### 1. 修改默认密码

首次登录后立即修改管理员密码。

### 2. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. 定期备份

设置自动备份（见[数据备份](#数据备份)）。

### 4. 更新系统

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 5. 限制数据库访问

修改 `docker-compose.yml`，移除数据库端口映射：

```yaml
services:
  postgres:
    # ports:
    #   - "5432:5432"  # 注释掉此行
```

---

## 常见问题

### Q: 如何修改端口？

修改 `docker-compose.yml` 中的端口映射：

```yaml
services:
  app:
    ports:
      - "8080:5000"  # 修改左侧端口号
```

### Q: 如何增加磁盘空间？

编辑 Docker 配置，修改数据存储路径：

```yaml
services:
  postgres:
    volumes:
      - /mnt/data/postgres:/var/lib/postgresql/data
  app:
    volumes:
      - /mnt/data/uploads:/app/public/uploads
```

### Q: 如何迁移到其他服务器？

1. 在旧服务器备份数据：
   ```bash
   bash backup.sh
   tar -czf uploads.tar.gz public/uploads/
   ```

2. 在新服务器恢复：
   ```bash
   # 部署应用
   bash deploy.sh

   # 恢复数据库
   gunzip backups/music_backup_*.sql.gz
   docker-compose exec -T postgres psql -U musicuser musicdb < backups/music_backup_*.sql

   # 恢复上传文件
   tar -xzf uploads.tar.gz
   ```

### Q: 如何查看实时日志？

```bash
# 查看所有日志
docker-compose logs -f

# 只查看应用日志
docker-compose logs -f app

# 只查看错误日志
docker-compose logs -f | grep ERROR
```

---

## 技术支持

如果遇到问题：

1. 查看日志：`docker-compose logs -f`
2. 检查配置：`.env` 和 `docker-compose.yml`
3. 查看文档：README.md
4. 提交 Issue：项目仓库 Issues

---

## 许可证

MIT
