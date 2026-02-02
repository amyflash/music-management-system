# GitHub Actions Docker 自动部署指南

## 📋 前置要求

1. **Docker Hub 账号**
   - 访问 https://hub.docker.com 注册账号
   - 创建 Access Token（不是密码）

2. **GitHub 仓库**
   - 确保仓库是公开的或你有权限配置 Secrets

## 🔐 配置步骤

### 1. 创建 Docker Hub Access Token

1. 登录 Docker Hub: https://hub.docker.com
2. 点击右上角头像 → Account Settings
3. 左侧菜单选择 "Security"
4. 点击 "New Access Token"
5. 输入描述（如：GitHub Actions）
6. 选择权限：Read, Write, Delete
7. 点击 "Generate"
8. **复制并保存 Access Token**（只显示一次！）

### 2. 配置 GitHub Secrets

在你的 GitHub 仓库中：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret"

添加以下两个 Secrets：

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `DOCKER_USERNAME` | Docker Hub 用户名 | `your-username` |
| `DOCKER_PASSWORD` | Docker Hub Access Token | `dckr_pat_xxxxx` |

### 3. 修改工作流配置

编辑 `.github/workflows/docker-build.yml` 或 `.github/workflows/docker-build-simple.yml`：

```yaml
env:
  # 修改为你的 Docker Hub 用户名/仓库名
  DOCKER_IMAGE: your-username/music-management-system
```

例如，如果你的 Docker Hub 用户名是 `amyflash`：

```yaml
env:
  DOCKER_IMAGE: amyflash/music-management-system
```

### 4. 提交代码

```bash
git add .github/workflows/
git commit -m "feat: 添加 GitHub Actions Docker 自动构建"
git push origin main
```

## 🚀 触发构建

### 自动触发

- **推送到 main 分支**: 自动构建并推送
- **创建 Pull Request**: 构建但不推送
- **手动触发**: 在 GitHub Actions 页面点击 "Run workflow"

### 手动触发

1. 进入仓库 → Actions 标签
2. 选择 "Docker Build and Push" 工作流
3. 点击 "Run workflow"
4. 选择分支，点击 "Run workflow"

## 📦 镜像标签

### 简化版 (docker-build-simple.yml)

构建后会生成以下标签：

- `latest`: 最新版本（main 分支）
- `YYYYMMDD`: 日期标签（如：20240202）
- `abc1234`: 短 SHA 标签（如：1a8d112）

### 完整版 (docker-build.yml)

构建后会生成多种标签：

- `main`: 分支名称
- `latest`: 最新版本（仅 main 分支）
- `1.2.3`: 语义化版本（如果设置了 tag）
- `main-abc1234`: 分支-SHA 组合

## 🔍 查看构建状态

### GitHub Actions

1. 进入仓库 → Actions 标签
2. 查看工作流运行状态
3. 点击具体的运行查看日志

### Docker Hub

1. 访问 https://hub.docker.com
2. 进入你的仓库
3. 查看 "Tags" 标签页
4. 查看镜像信息和构建历史

## 📥 在 VPS 上拉取镜像

配置完成后，在 VPS 上使用拉取的镜像：

### 1. 修改 docker-compose.yml

```yaml
services:
  app:
    # 修改为你的 Docker Hub 镜像
    image: your-username/music-management-system:latest

    # 注释掉或删除 build 部分
    # build:
    #   context: .
    #   dockerfile: Dockerfile

    container_name: music-app
    restart: always
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://${DB_USER:-musicuser}:${DB_PASSWORD:-musicpass}@postgres:5432/${DB_NAME:-musicdb}
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./public/uploads:/app/public/uploads
      - app_node_modules:/app/node_modules
    networks:
      - music-network
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 2. 登录 Docker Hub

```bash
docker login
# 输入 Docker Hub 用户名和密码
```

### 3. 拉取镜像并启动

```bash
# 拉取最新镜像
docker compose pull app

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f
```

### 4. 设置自动更新（可选）

```bash
# 创建自动更新脚本
cat > auto-update.sh << 'EOF'
#!/bin/bash
cd /path/to/music-management-system
docker compose pull app
docker compose up -d
EOF

chmod +x auto-update.sh

# 添加定时任务（每天凌晨 2 点更新）
crontab -e
# 添加：0 2 * * * /path/to/music-management-system/auto-update.sh
```

## 🛠️ 高级配置

### 1. 多平台构建

在 `docker-build.yml` 中已经配置了多平台构建：

```yaml
platforms: linux/amd64,linux/arm64
```

如果你的 VPS 是 ARM 架构（如 Apple Silicon），这会自动构建 ARM 镜像。

### 2. 构建缓存

工作流已启用 GitHub Actions 缓存：

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

这会显著加快后续构建速度（从 10 分钟降到 3 分钟）。

### 3. 构建参数

如果需要自定义构建参数，可以添加：

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    build-args: |
      NODE_ENV=production
      NEXT_PUBLIC_API_URL=https://api.example.com
```

然后在 Dockerfile 中使用：

```dockerfile
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
```

## 📊 性能对比

### 本地构建 vs GitHub Actions

| 方式 | 内存需求 | 构建时间 | 成本 | 优势 |
|------|---------|---------|------|------|
| **本地构建** | 需要 2-4GB | 5-10 分钟 | 免费 | 快速迭代 |
| **GitHub Actions** | 无限制 | 3-8 分钟 | 免费 | 稳定可靠 |
| **VPS 构建** | 需要 2-4GB | 5-10 分钟 | 付费 | 统一环境 |

### GitHub Actions 优势

- ✅ 不消耗本地资源
- ✅ 不消耗 VPS 资源
- ✅ 自动构建和推送
- ✅ 构建历史记录
- ✅ 免费使用（公开仓库）
- ✅ 多平台支持

## 🔒 安全建议

### 1. 保护 Secrets

- ✅ 不要在代码中硬编码密码
- ✅ 使用 GitHub Secrets 存储敏感信息
- ✅ 定期轮换 Docker Hub Access Token
- ✅ 限制 Token 权限（只给需要的权限）

### 2. 镜像扫描

Docker Hub 会自动扫描镜像中的安全漏洞。你可以在 Docker Hub 查看扫描结果。

### 3. 签名镜像（可选）

```yaml
- name: Sign image
  uses: docker/sign-action@v2
  with:
    image: ${{ env.DOCKER_IMAGE }}:${{ github.sha }}
```

## 🐛 故障排查

### 1. 构建失败

**问题：** 构建失败，提示权限错误

**解决方案：**
- 检查 Docker Hub Access Token 是否正确
- 确认 Token 有 Read, Write 权限
- 检查 GitHub Secrets 是否正确配置

### 2. 镜像推送失败

**问题：** 镜像构建成功但推送失败

**解决方案：**
- 确认 Docker Hub 仓库名称正确
- 检查是否已登录 Docker Hub
- 确认 Token 权限包含 Write

### 3. 缓存问题

**问题：** 构建速度慢，缓存未生效

**解决方案：**
- 确认缓存配置正确
- 检查 GitHub Actions 缓存空间
- 清理旧缓存（在 Actions 设置中）

### 4. 拉取失败

**问题：** VPS 上拉取镜像失败

**解决方案：**
- 确认已登录 Docker Hub：`docker login`
- 检查网络连接
- 确认镜像名称和标签正确

## 📚 参考文档

- [Docker Login Action](https://github.com/docker/login-action)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Metadata Action](https://github.com/docker/metadata-action)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

## 🎯 快速开始

### 1. 配置 Secrets（5 分钟）

```
GitHub 仓库 → Settings → Secrets → Actions
添加 DOCKER_USERNAME 和 DOCKER_PASSWORD
```

### 2. 修改镜像名称（1 分钟）

```yaml
env:
  DOCKER_IMAGE: your-username/music-management-system
```

### 3. 提交代码（2 分钟）

```bash
git add .github/workflows/
git commit -m "feat: 添加 GitHub Actions"
git push origin main
```

### 4. 查看构建（3 分钟）

访问 GitHub Actions 页面查看构建状态

### 5. 拉取镜像（2 分钟）

```bash
docker compose pull app
docker compose up -d
```

**总计时间：约 15 分钟**

## ✅ 检查清单

- [ ] Docker Hub 账号已创建
- [ ] Access Token 已生成
- [ ] GitHub Secrets 已配置
- [ ] 工作流文件已修改
- [ ] 代码已提交
- [ ] 构建成功
- [ ] 镜像已推送到 Docker Hub
- [ ] VPS 已拉取镜像
- [ ] 服务已启动
- [ ] 应用正常运行

配置完成后，每次推送到 main 分支都会自动构建并推送镜像！🚀
