# Docker 部署功能清单

## 已创建的文件

### Docker 配置文件

1. **Dockerfile** - Docker 镜像构建文件
   - 基于 Node.js 20 Alpine
   - 自动创建 uploads 目录
   - 构建优化

2. **docker-compose.yml** - Docker Compose 编排文件
   - PostgreSQL 数据库服务
   - Next.js 应用服务
   - 自动健康检查
   - 数据卷持久化

3. **.dockerignore** - Docker 构建忽略文件
   - 排除不必要的文件
   - 减小镜像体积

4. **.env.example** - 环境变量示例
   - 数据库配置模板
   - 应用配置模板

### 部署脚本

5. **deploy.sh** - 一键部署脚本
   - 自动检查系统要求
   - 自动配置环境变量
   - 自动创建必要目录
   - 自动构建和启动服务
   - 显示访问信息

6. **update.sh** - 应用更新脚本
   - 拉取最新代码
   - 重新构建镜像
   - 重启服务

7. **backup.sh** - 数据备份脚本
   - 备份数据库
   - 压缩备份文件
   - 自动清理旧备份（30 天）

### 数据库初始化

8. **init-db.sql** - 数据库初始化脚本
   - 创建 albums 表
   - 创建 songs 表
   - 创建索引
   - 添加外键约束

### 文档

9. **DOCKER_DEPLOYMENT.md** - Docker 部署完整文档
   - 系统要求
   - 快速部署
   - 手动部署
   - 配置说明
   - 常用命令
   - 数据备份
   - 故障排查
   - 性能优化
   - 安全建议

10. **VPS_QUICK_START.md** - VPS 快速部署指南
    - 三步部署流程
    - 常用命令
    - 防火墙配置
    - HTTPS 配置
    - 故障排查
    - 监控和维护

11. **README.md** - 已更新
    - 添加 Docker 部署章节
    - 添加快速部署命令
    - 添加文档链接

12. **DEPLOYMENT_UPLOAD.md** - 已更新
    - 添加 Docker 部署引用
    - 添加链接到详细文档

### 其他文件

13. **public/uploads/.gitkeep** - 确保目录被 Git 追踪

14. **.gitignore** - 已更新
    - 忽略上传的文件
    - 保留目录结构

## 功能特性

### ✅ 一键部署

```bash
bash deploy.sh
```

自动完成：
- 系统检查
- 环境配置
- 目录创建
- 镜像构建
- 服务启动

### ✅ 数据持久化

- PostgreSQL 数据卷持久化
- 上传文件持久化
- 容器重启数据不丢失

### ✅ 健康检查

- 数据库健康检查
- 应用健康检查
- 自动重启失败的服务

### ✅ 自动备份

```bash
bash backup.sh
```

支持：
- 数据库备份
- 上传文件备份
- 自动清理旧备份

### ✅ 自动更新

```bash
bash update.sh
```

支持：
- 拉取最新代码
- 重新构建
- 无缝重启

### ✅ 环境隔离

- 容器化部署
- 环境变量配置
- 依赖隔离

### ✅ 易于迁移

- Docker 镜像一致性
- 数据备份和恢复
- 配置文件管理

## 使用方法

### 1. 准备服务器

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo apt-get install docker-compose
```

### 2. 克隆项目

```bash
git clone <your-repo-url> music-system
cd music-system
```

### 3. 一键部署

```bash
bash deploy.sh
```

### 4. 访问应用

- 本地: http://localhost:5000
- 外网: http://your-server-ip:5000

### 5. 管理服务

```bash
# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 备份数据
bash backup.sh

# 更新应用
bash update.sh
```

## 配置选项

### 修改端口

编辑 `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "8080:5000"
```

### 修改数据库密码

编辑 `.env`:

```env
DB_PASSWORD=your_secure_password
```

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

## 数据备份

### 手动备份

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U musicuser musicdb > backup.sql

# 备份上传文件
tar -czf uploads.tar.gz public/uploads/
```

### 自动备份

```bash
# 添加定时任务
crontab -e

# 每天凌晨 2 点备份
0 2 * * * cd /path/to/music-system && bash backup.sh
```

### 恢复数据

```bash
# 恢复数据库
docker-compose exec -T postgres psql -U musicuser musicdb < backup.sql

# 恢复上传文件
tar -xzf uploads.tar.gz
```

## 故障排查

### 查看日志

```bash
# 查看所有日志
docker-compose logs -f

# 查看应用日志
docker-compose logs -f app

# 查看数据库日志
docker-compose logs -f postgres
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启应用
docker-compose restart app

# 重启数据库
docker-compose restart postgres
```

### 检查磁盘空间

```bash
df -h

# 清理 Docker 缓存
docker system prune -a
```

## 性能优化

### 启用 Nginx 反向代理

参考：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - 性能优化部分

### 配置 Redis 缓存

参考：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - 性能优化部分

### 数据库优化

参考：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - 性能优化部分

## 安全建议

1. ✅ 修改默认密码
2. ✅ 配置防火墙
3. ✅ 定期备份
4. ✅ 更新系统
5. ✅ 限制数据库访问

## 技术支持

- 详细文档：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- 快速指南：[VPS_QUICK_START.md](./VPS_QUICK_START.md)
- 上传配置：[DEPLOYMENT_UPLOAD.md](./DEPLOYMENT_UPLOAD.md)
- 项目文档：[README.md](./README.md)

## 版本历史

### v1.0.0 (2024-02-02)

- ✅ Docker 一键部署
- ✅ 自动数据库初始化
- ✅ 自动备份脚本
- ✅ 支持 VPS 部署
- ✅ 完整文档
- ✅ 健康检查
- ✅ 数据持久化
