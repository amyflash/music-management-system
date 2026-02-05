# Docker 部署指南（SQLite 版本）

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
- **内存**: 512MB 以上（推荐 1GB）
- **磁盘**: 10GB 以上（根据音乐文件数量调整）
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
- ✅ 创建必要目录（data, public/uploads）
- ✅ 拉取 Docker 镜像（或本地构建）
- ✅ 启动服务
- ✅ 等待服务就绪

### 4. 访问应用

部署完成后，访问：

- **本地**: http://localhost:5000
- **外网**: http://your-server-ip:5000

---

## 手动部署

如果你想手动控制部署过程，可以按照以下步骤操作：

### 1. 创建必要目录

```bash
mkdir -p data public/uploads
chmod 755 data public/uploads
```

### 2. 构建和启动

#### 使用预构建镜像（推荐）

```bash
# 拉取镜像
docker-compose pull app

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

#### 本地构建

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 3. 初始化数据库

数据库会在首次启动时自动初始化，无需手动操作。SQLite 数据库文件将创建在 `data/music.db`。

---

## 配置说明

### Docker Compose 配置 (docker-compose.yml)

#### 修改端口

如果端口 5000 被占用，可以修改为其他端口：

```yaml
services:
  app:
    ports:
      - "8080:5000"  # 容器端口保持 5000，映射到主机 8080
```

#### 自定义数据库路径

```yaml
services:
  app:
    environment:
      - SQLITE_DB_PATH=/app/data/custom.db
```

#### 配置资源限制

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
```

#### 使用带内存限制的配置

对于内存较小的 VPS，可以使用 `docker-compose-with-memory-limit.yml`：

```bash
docker-compose -f docker-compose-with-memory-limit.yml up -d
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

# 只查看应用日志
docker-compose logs -f app
```

### 进入容器

```bash
# 进入应用容器
docker-compose exec app sh
```

### 数据查看

#### 查看 SQLite 数据库

```bash
# 进入容器
docker-compose exec app sh

# 安装 sqlite3（如果不包含）
apk add sqlite3

# 连接数据库
sqlite3 data/music.db

# 查看所有表
.tables

# 查看专辑表
SELECT * FROM albums;

# 查看歌曲表
SELECT * FROM songs;

# 退出
.quit
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
cp data/music.db backups/music.db.$(date +%Y%m%d_%H%M%S)

# 压缩备份文件
gzip backups/music.db.$(date +%Y%m%d_%H%M%S)
```

#### 备份上传文件

```bash
# 备份上传的文件
tar -czf backups/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/
```

#### 恢复数据库

```bash
# 停止服务
docker-compose down

# 解压备份文件（如果已压缩）
gunzip backups/music.db.20240101_020000.gz

# 恢复数据库
cp backups/music.db.20240101_020000 data/music.db

# 重启服务
docker-compose up -d
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

### 数据库问题

#### 检查数据库文件

```bash
ls -la data/music.db

# 检查数据库完整性
docker-compose exec app sqlite3 data/music.db "PRAGMA integrity_check;"
```

#### 重建数据库

如果数据库损坏，可以删除并重建：

```bash
# 停止服务
docker-compose down

# 备份现有数据库（如果有）
cp data/music.db data/music.db.bak

# 删除数据库
rm data/music.db

# 重启服务（会自动创建新数据库）
docker-compose up -d
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

如果磁盘空间不足，清理：

```bash
# 清理 Docker 缓存
docker system prune -a

# 清理旧备份
find backups/ -name "*.gz" -mtime +30 -delete
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
          memory: 1G
```

#### 检查数据库大小

```bash
ls -lh data/music.db
```

如果数据库过大，考虑清理旧数据或优化：

```bash
# 进入容器
docker-compose exec app sh

# 运行 SQLite 优化
sqlite3 data/music.db "VACUUM;"
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

# 3. 拉取最新镜像（或重新构建）
docker-compose pull app
# 或
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

### 3. 数据库优化

#### 运行 VACUUM

定期运行 VACUUM 命令优化数据库：

```bash
docker-compose exec app sh -c "sqlite3 data/music.db 'VACUUM;'"
```

#### 配置 WAL 模式

WAL（Write-Ahead Logging）模式可以提高并发性能：

```bash
docker-compose exec app sh -c "sqlite3 data/music.db 'PRAGMA journal_mode=WAL;'"
```

---

## 安全建议

### 1. 配置防火墙

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

### 2. 定期备份

设置自动备份（见[数据备份](#数据备份)）。

### 3. 更新系统

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 4. 保护数据文件

确保 `data` 目录和 `music.db` 文件只有容器可以访问：

```bash
chmod 700 data
chmod 600 data/music.db
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

### Q: 如何自定义数据库路径？

在 `docker-compose.yml` 中添加环境变量：

```yaml
services:
  app:
    environment:
      - SQLITE_DB_PATH=/app/data/custom.db
```

### Q: 如何迁移到其他服务器？

1. 在旧服务器备份数据：
   ```bash
   bash backup.sh
   ```

2. 拷贝备份文件到新服务器

3. 在新服务器部署并恢复：
   ```bash
   # 部署应用
   bash deploy.sh

   # 停止服务
   docker-compose down

   # 恢复数据库
   cp backups/music.db.YYYYMMDD_HHMMSS data/music.db

   # 恢复上传文件
   tar -xzf backups/uploads_YYYYMMDD_HHMMSS.tar.gz

   # 重启服务
   docker-compose up -d
   ```

### Q: SQLite vs PostgreSQL 有什么区别？

SQLite 更简单，适用于单用户应用：
- ✅ 无需额外数据库服务
- ✅ 配置简单
- ✅ 资源占用少
- ✅ 文件数据库，易于备份
- ⚠️ 并发写入性能较差

PostgreSQL 适用于多用户或高并发场景：
- ✅ 支持高并发
- ✅ 更强大的查询功能
- ⚠️ 配置复杂
- ⚠️ 资源占用较多

### Q: 数据库文件损坏怎么办？

1. 停止服务
2. 恢复最近的备份
3. 如果没有备份，尝试修复：

```bash
docker-compose exec app sh -c "sqlite3 data/music.db '.recover' | sqlite3 data/music_recovered.db'"
```

### Q: 如何查看实时日志？

```bash
# 查看所有日志
docker-compose logs -f

# 只查看应用日志
docker-compose logs -f app

# 只查看错误日志
docker-compose logs -f | grep -i error
```

---

## 技术支持

如果遇到问题：

1. 查看日志：`docker-compose logs -f`
2. 检查配置：`docker-compose.yml`
3. 查看文档：README.md
4. 提交 Issue：项目仓库 Issues

---

## 许可证

MIT
