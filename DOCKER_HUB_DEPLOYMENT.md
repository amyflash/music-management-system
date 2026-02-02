# Docker Hub 自动部署使用说明

## 快速开始

### 1. 配置 Docker Hub

在 GitHub 仓库中添加以下 Secrets：

| Secret 名称 | 说明 |
|------------|------|
| `DOCKER_USERNAME` | 你的 Docker Hub 用户名 |
| `DOCKER_PASSWORD` | Docker Hub Access Token |

### 2. 修改镜像名称

编辑 `.github/workflows/docker-build-simple.yml`:

```yaml
env:
  # 修改为你的 Docker Hub 用户名/仓库名
  DOCKER_IMAGE: your-username/music-management-system
```

### 3. 提交代码

```bash
git add .github/workflows/
git commit -m "feat: 添加 GitHub Actions"
git push origin main
```

## 在 VPS 上使用

### 修改 docker-compose.yml

```yaml
services:
  app:
    # 使用 Docker Hub 镜像
    image: your-username/music-management-system:latest

    # 注释掉本地构建
    # build:
    #   context: .
    #   dockerfile: Dockerfile

    container_name: music-app
    restart: always
    # ... 其他配置保持不变
```

### 拉取并启动

```bash
# 登录 Docker Hub
docker login

# 拉取最新镜像
docker compose pull app

# 启动服务
docker compose up -d
```

## 自动更新

### 方案 1：定时更新

```bash
# 创建更新脚本
cat > update.sh << 'EOF'
#!/bin/bash
cd /path/to/music-management-system
docker compose pull app
docker compose up -d
EOF

chmod +x update.sh

# 添加定时任务（每天凌晨 2 点）
crontab -e
# 添加：0 2 * * * /path/to/music-management-system/update.sh
```

### 方案 2：使用 Watchtower（推荐）

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
      - WATCHTOWER_POLL_INTERVAL=3600  # 每小时检查一次
    restart: always

  app:
    # ... 原有配置
    # 添加标签，让 watchtower 监控
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
```

## 镜像标签

构建后会生成以下标签：

- `latest`: 最新版本
- `YYYYMMDD`: 日期标签（如：20240202）
- `abc1234`: 短 SHA 标签（如：1a8d112）

使用示例：

```bash
# 拉取最新版本
docker pull your-username/music-management-system:latest

# 拉取特定日期版本
docker pull your-username/music-management-system:20240202

# 拉取特定提交版本
docker pull your-username/music-management-system:1a8d112
```

## 常见问题

### Q: 如何查看构建状态？

A: 访问 GitHub 仓库 → Actions 标签，查看 "Docker Build and Push" 工作流。

### Q: 如何手动触发构建？

A: 访问 GitHub 仓库 → Actions 标签 → 选择工作流 → 点击 "Run workflow"。

### Q: 构建失败怎么办？

A: 查看 Actions 日志，检查：
- Docker Hub Secrets 是否正确
- Docker Hub Access Token 是否有 Write 权限
- 网络连接是否正常

## 详细文档

完整配置和高级用法请查看：[GITHUB_ACTIONS_GUIDE.md](./GITHUB_ACTIONS_GUIDE.md)
