# Docker Compose V2 升级说明

## 版本变更

### Docker Compose V1 (已废弃)
- 命令格式：`docker-compose`（连字符）
- 独立安装：需要单独安装 `docker-compose` 二进制文件
- 版本示例：`Docker Compose version v1.29.2`

### Docker Compose V2 (推荐)
- 命令格式：`docker compose`（空格）
- 内置插件：作为 Docker 插件安装
- 版本示例：`Docker Compose version v5.0.2`

## 检测当前版本

```bash
# 检测 V2
docker compose version
# 输出示例：Docker Compose version v5.0.2

# 检测 V1
docker-compose --version
# 输出示例：Docker Compose version v1.29.2
```

## 命令对照表

| 操作 | V2 (推荐) | V1 (已废弃) |
|------|-----------|-------------|
| 启动服务 | `docker compose up -d` | `docker-compose up -d` |
| 停止服务 | `docker compose down` | `docker-compose down` |
| 重启服务 | `docker compose restart` | `docker-compose restart` |
| 查看状态 | `docker compose ps` | `docker-compose ps` |
| 查看日志 | `docker compose logs -f` | `docker-compose logs -f` |
| 构建镜像 | `docker compose build` | `docker-compose build` |
| 进入容器 | `docker compose exec app sh` | `docker-compose exec app sh` |
| 查看配置 | `docker compose config` | `docker-compose config` |

## 安装 V2

### Ubuntu / Debian

```bash
# 方法 1：通过 apt 安装（推荐）
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 方法 2：手动安装
sudo curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 -o /usr/libexec/docker/cli-plugins/docker-compose
sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose
```

### CentOS / RHEL

```bash
# 通过 yum 安装
sudo yum install -y docker-compose-plugin
```

### 从 Docker Desktop

Docker Desktop 已内置 Docker Compose V2，无需单独安装。

## 迁移脚本

如果你的系统有 V1 和 V2 共存，脚本会自动检测并使用 V2：

```bash
# deploy.sh, backup.sh, update.sh 已更新为自动检测
# 优先使用 docker compose (V2)
# 回退到 docker-compose (V1)
```

## 兼容性说明

✅ **完全兼容**
- `docker-compose.yml` 配置文件格式兼容
- V2 可以运行 V1 的配置文件
- 部署脚本已自动适配

⚠️ **需要注意**
- 某些高级特性可能需要调整配置
- 环境变量引用方式可能不同
- 命令输出格式略有差异

## 更新部署文件

### 已更新的文件

1. ✅ `docker-compose.yml` - 移除 `version` 字段（V2 不需要）
2. ✅ `deploy.sh` - 自动检测并使用正确的命令
3. ✅ `backup.sh` - 自动检测并使用正确的命令
4. ✅ `update.sh` - 自动检测并使用正确的命令

### 配置文件优化

```yaml
# docker-compose.yml 已针对 V2 优化：
# - 移除 version 字段（V2 不需要）
# - 优化健康检查配置
# - 添加 start_period 参数
# - 添加应用健康检查
# - 优化挂载卷配置
```

## 测试部署

```bash
# 测试 V2 命令
docker compose version

# 测试构建
docker compose build

# 测试启动
docker compose up -d

# 查看状态
docker compose ps
```

## 回退方案

如果遇到问题，可以回退到 V1：

```bash
# 卸载 V2 插件
sudo apt-get remove docker-compose-plugin

# 安装 V1
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version
```

## 常见问题

### Q: V1 和 V2 可以共存吗？

A: 可以。部署脚本会优先使用 V2，如果 V2 不可用则回退到 V1。

### Q: 我的配置文件需要修改吗？

A: 大部分配置文件无需修改。`docker-compose.yml` 文件已优化，移除了 V2 不需要的 `version` 字段。

### Q: 如何切换到 V2？

A:
1. 安装 V2 插件：`apt install docker-compose-plugin`
2. 使用新命令：`docker compose`（空格而不是连字符）
3. 部署脚本会自动适配

### Q: V2 有什么新特性？

A:
- 更快的构建和部署速度
- 更好的错误提示
- 支持 Docker CLI 集成
- 更完善的日志输出
- 支持更多 Docker 特性

## 参考文档

- [Docker Compose V2 官方文档](https://docs.docker.com/compose/)
- [迁移指南](https://docs.docker.com/compose/migrate/)
- [发布说明](https://github.com/docker/compose/releases)

## 总结

- ✅ **推荐使用 V2**：`docker compose`
- ✅ **完全兼容 V1 配置**
- ✅ **部署脚本自动适配**
- ✅ **性能和功能更优**

如有问题，请查看：
- 部署文档：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- 快速指南：[VPS_QUICK_START.md](./VPS_QUICK_START.md)
