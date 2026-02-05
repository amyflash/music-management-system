# VPS 快速部署指南（SQLite 版本）

## 前提条件

- 一台 VPS 服务器（推荐配置：1核1G，10GB 磁盘）
- 服务器已安装 Docker 和 Docker Compose V2
- SSH 访问权限

**注意：** 本指南使用 Docker Compose V2 命令格式 `docker compose`。如果使用 V1，请替换为 `docker-compose`。

## 三步部署

### 1. 连接到服务器

```bash
ssh root@your-server-ip
```

### 2. 安装 Docker（如果未安装）

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 安装 Docker Compose V2 插件（推荐）
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 验证安装
docker compose version
```

### 3. 一键部署

```bash
# 克隆项目
git clone https://github.com/amyflash/music-management-system.git
cd music-management-system

# 运行部署脚本
bash deploy.sh
```

完成！访问 `http://your-server-ip:5000`

## 默认账号

使用外部认证服务登录：https://auth.516768.xyz

## 常用命令

**注意：** 以下命令使用 Docker Compose V2 格式。如果使用 V1，请将 `docker compose` 替换为 `docker-compose`。

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 备份数据
bash backup.sh

# 更新应用
bash update.sh
```

## 防火墙配置

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 5000/tcp  # 应用端口
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

## 配置 HTTPS（可选）

```bash
# 安装 Nginx
sudo apt-get install nginx

# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

详细配置请参考：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

## 故障排查

### 端口无法访问

```bash
# 检查服务状态
docker compose ps

# 检查端口监听
netstat -tuln | grep 5000

# 查看日志
docker compose logs -f
```

### 数据库问题

```bash
# 检查数据库文件
ls -la data/music.db

# 查看数据库日志
docker compose logs app

# 检查数据库完整性
docker compose exec app sh -c "sqlite3 data/music.db 'PRAGMA integrity_check;'"
```

### 磁盘空间不足

```bash
# 清理 Docker 缓存
docker system prune -a

# 清理旧备份
find backups/ -name "*.gz" -mtime +30 -delete
```

### 文件上传失败

```bash
# 检查目录权限
ls -la public/uploads

# 修复权限
chmod 755 public/uploads
```

## 数据迁移

### 备份

```bash
# 在旧服务器
bash backup.sh

# 下载到本地或直接传输
scp root@old-server:/path/to/music-system/backups/* ./backups/
```

### 恢复

```bash
# 在新服务器
# 部署应用
bash deploy.sh

# 停止服务
docker compose down

# 恢复数据库（解压如果需要）
gunzip backups/music.db.*.gz
cp backups/music.db.DATE data/music.db

# 恢复上传文件
tar -xzf backups/uploads_*.tar.gz

# 重启服务
docker compose up -d
```

## 监控和维护

### 设置自动备份

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每天凌晨 2 点备份）
0 2 * * * cd /path/to/music-system && bash backup.sh
```

### 检查磁盘使用

```bash
df -h

# 查看各目录占用
du -sh public/uploads/
du -sh data/
```

### 查看日志大小

```bash
# Docker 日志
docker system df

# 应用日志
docker compose logs --tail 100 app
```

### 数据库优化

```bash
# 运行 VACUUM 优化数据库
docker compose exec app sh -c "sqlite3 data/music.db 'VACUUM;'"

# 启用 WAL 模式提高性能
docker compose exec app sh -c "sqlite3 data/music.db 'PRAGMA journal_mode=WAL;'"
```

## 性能优化

### 增加内存限制

编辑 `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
```

### 使用内存限制版配置

对于内存较小的 VPS，使用 `docker-compose-with-memory-limit.yml`:

```bash
docker compose -f docker-compose-with-memory-limit.yml up -d
```

### 配置 Nginx 反向代理

参考：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - 性能优化部分

## 数据库说明

本项目使用 SQLite 数据库，相比 PostgreSQL 的优势：

### SQLite 优势
- ✅ 配置简单，无需额外数据库服务
- ✅ 资源占用少（内存 < 50MB）
- ✅ 文件数据库，备份恢复简单
- ✅ 适合单用户或低并发场景
- ✅ 无需担心数据库连接配置

### 使用场景
- 个人音乐管理
- 单用户应用
- 低并发访问（< 10 并发）
- 资源受限的 VPS

### 数据库位置
- 文件路径：`data/music.db`
- 数据会自动持久化到映射的卷
- 备份和恢复只需拷贝该文件

### 数据库操作

```bash
# 进入容器
docker compose exec app sh

# 连接数据库（需要安装 sqlite3）
apk add sqlite3
sqlite3 data/music.db

# 查看 SQL 命令
.tables
.schema albums
SELECT * FROM albums;
SELECT * FROM songs;

# 退出
.quit
```

## 技术支持

遇到问题？

1. 查看日志：`docker compose logs -f`
2. 检查文档：[README.md](./README.md)
3. 查看详细部署文档：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
4. 查看认证服务：https://auth.516768.xyz
5. 提交 Issue：项目仓库

## 更新日志

### 版本 2.0.0 (2025-02-05)

- ✅ 迁移到 SQLite 数据库
- ✅ 移除 PostgreSQL 依赖
- ✅ 简化部署流程
- ✅ 减少资源占用
- ✅ 优化备份恢复流程

### 版本 1.1.0 (2024-02-02)

- ✅ 支持 Docker Compose V2
- ✅ 自动检测并使用 V2/V1
- ✅ 优化 docker-compose.yml 配置
- ✅ 添加健康检查和自动重启

### 版本 1.0.0 (2024-01-30)

- ✅ Docker 一键部署
- ✅ 自动数据库初始化
- ✅ 支持 VPS 部署
- ✅ 支持文件上传
- ✅ 支持歌词同步显示
