# VPS 快速部署指南

## 前提条件

- 一台 VPS 服务器（推荐配置：2核2G，20GB 磁盘）
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

- 用户名: `admin`
- 密码: `admin123`

**重要**: 首次登录后立即修改密码！

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

### 磁盘空间不足

```bash
# 清理 Docker 缓存
docker system prune -a

# 清理旧备份
find backups/ -name "*.gz" -mtime +30 -delete
```

### 数据库连接失败

```bash
# 重启数据库
docker compose restart postgres

# 查看数据库日志
docker compose logs postgres
```

## 数据迁移

### 备份

```bash
# 在旧服务器
bash backup.sh
tar -czf uploads.tar.gz public/uploads/

# 下载到本地
scp root@old-server:/path/to/backups/* .
scp root@old-server:/path/to/uploads.tar.gz .
```

### 恢复

```bash
# 在新服务器
# 部署应用
bash deploy.sh

# 恢复数据库
gunzip backups/music_backup_*.sql.gz
docker compose exec -T postgres psql -U musicuser musicdb < backups/music_backup_*.sql

# 恢复上传文件
tar -xzf uploads.tar.gz
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
du -sh /var/lib/docker/volumes/
```

### 查看日志大小

```bash
# Docker 日志
docker system df

# 应用日志
docker compose logs --tail 100 app
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
          memory: 2G
```

### 配置 Nginx 反向代理

参考：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - 性能优化部分

## 技术支持

遇到问题？

1. 查看日志：`docker compose logs -f`
2. 检查文档：[README.md](./README.md)
3. 查看详细部署文档：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
4. 查看 V2 升级说明：[DOCKER_COMPOSE_V2.md](./DOCKER_COMPOSE_V2.md)
5. 提交 Issue：项目仓库

## 更新日志

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
