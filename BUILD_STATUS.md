# GitHub Actions 构建状态检查

## 🚀 已触发构建

代码已成功推送，GitHub Actions 正在自动构建 Docker 镜像。

### 构建信息

- **提交 ID**: `78d33fe`
- **提交信息**: "chore: 更新 Docker Hub 镜像名称为 amyflash/music-management-system"
- **镜像名称**: `amyflash/music-management-system`
- **镜像标签**: `latest`, `20240202`, `78d33fe`

## 📊 查看构建状态

### 1. GitHub Actions 页面

访问：https://github.com/amyflash/music-management-system/actions

你应该能看到 "Docker Build and Push (Simple)" 工作流正在运行或已完成。

### 2. 构建时间

- **预计时间**: 3-8 分钟
- **内存使用**: GitHub Actions 提供充足的资源
- **缓存**: 第二次构建会更快（约 3 分钟）

### 3. 构建步骤

构建过程包含以下步骤：

1. ✅ Checkout code - 检出代码
2. ✅ Set up Docker Buildx - 设置 Docker 构建环境
3. ✅ Log in to Docker Hub - 登录 Docker Hub
4. ✅ Get current date - 获取当前日期
5. ✅ Get short SHA - 获取提交 SHA
6. ⏳ Build and push - 构建并推送镜像（最耗时）
7. ⏳ Image digest - 输出镜像摘要

## 📦 构建成功后

### 镜像标签

构建成功后，Docker Hub 上会有以下标签：

- `amyflash/music-management-system:latest` - 最新版本
- `amyflash/music-management-system:20240202` - 日期标签
- `amyflash/music-management-system:78d33fe` - 短 SHA 标签

### 查看镜像

访问 Docker Hub：https://hub.docker.com/r/amyflash/music-management-system

### 在 VPS 上拉取

```bash
# 登录 Docker Hub
docker login

# 拉取最新镜像
docker compose pull app

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f
```

## 🔍 检查构建日志

### 方法 1: GitHub Actions 页面

1. 访问：https://github.com/amyflash/music-management-system/actions
2. 点击最新的工作流运行
3. 点击 "Build and push" 步骤
4. 查看详细日志

### 方法 2: 查看摘要

在 GitHub Actions 页面可以看到：

- ✅ Success - 构建成功
- ❌ Failed - 构建失败
- ⏳ In progress - 正在构建

## ❌ 如果构建失败

### 常见问题

1. **登录失败**
   - 检查 `DOCKER_USERNAME` 和 `DOCKER_PASSWORD` 是否正确
   - 确认 Docker Hub Access Token 有 Write 权限

2. **构建失败**
   - 查看 "Build and push" 步骤的日志
   - 检查 Dockerfile 是否有语法错误
   - 确认依赖是否正确安装

3. **推送失败**
   - 确认 Docker Hub 仓库名称正确
   - 检查网络连接
   - 确认 Token 权限

### 解决方案

如果构建失败：

1. 查看错误日志
2. 修复问题
3. 提交修复
4. 重新触发构建

```bash
# 手动触发构建
# 访问 https://github.com/amyflash/music-management-system/actions
# 点击 "Run workflow"
```

## ⏱️ 构建时间估算

| 阶段 | 时间 | 累计 |
|------|------|------|
| 环境准备 | 30秒 | 30秒 |
| 依赖安装 | 1-2分钟 | 2.5分钟 |
| 构建项目 | 3-5分钟 | 7.5分钟 |
| 推送镜像 | 30秒-1分钟 | 8.5分钟 |
| **总计** | **5-8分钟** | - |

**注意：** 有缓存时，构建时间会减少到 3-5 分钟。

## 🎉 构建成功后的操作

### 1. 验证镜像

```bash
# 拉取镜像
docker pull amyflash/music-management-system:latest

# 查看镜像信息
docker images | grep music-management-system
```

### 2. 更新 VPS

修改 `docker-compose.yml`：

```yaml
services:
  app:
    image: amyflash/music-management-system:latest
```

然后：

```bash
docker compose pull app
docker compose up -d
```

### 3. 验证服务

```bash
# 查看日志
docker compose logs -f

# 访问应用
curl http://localhost:5000
```

## 🔄 自动化部署

### 设置自动更新

```bash
# 创建自动更新脚本
cat > /path/to/music-management-system/update.sh << 'EOF'
#!/bin/bash
cd $(dirname "$0")
echo "拉取最新镜像..."
docker compose pull app
echo "重启服务..."
docker compose up -d
echo "更新完成！"
EOF

chmod +x /path/to/music-management-system/update.sh
```

### 定时更新

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每天凌晨 2 点更新）
0 2 * * * /path/to/music-management-system/update.sh >> /var/log/music-update.log 2>&1
```

### 使用 Watchtower

在 `docker-compose.yml` 中添加：

```yaml
services:
  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=3600
    restart: always

  app:
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
```

## 📚 相关链接

- **GitHub Actions**: https://github.com/amyflash/music-management-system/actions
- **Docker Hub**: https://hub.docker.com/r/amyflash/music-management-system
- **提交记录**: https://github.com/amyflash/music-management-system/commit/78d33fe
- **配置指南**: [GITHUB_ACTIONS_GUIDE.md](./GITHUB_ACTIONS_GUIDE.md)

## ✅ 构建检查清单

- [x] 代码已推送
- [x] Secrets 已配置
- [x] 镜像名称已更新
- [x] 构建已触发
- [ ] 构建成功
- [ ] 镜像已推送到 Docker Hub
- [ ] VPS 已拉取镜像
- [ ] 服务已更新
- [ ] 应用正常运行

构建完成后，VPS 可以直接使用 `docker compose pull` 获取最新镜像！🚀
