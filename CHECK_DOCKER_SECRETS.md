# 如何检查 Docker Hub Secrets 权限

## 🎯 目标

验证 GitHub Secrets (`DOCKER_USERNAME` 和 `DOCKER_PASSWORD`) 是否有推送到 Docker Hub 的权限。

## 📋 方法 1：使用 GitHub Actions 测试（推荐）

### 步骤 1：运行测试工作流

我已经创建了一个测试工作流：`.github/workflows/test-docker-credentials.yml`

**手动触发：**
1. 访问：https://github.com/amyflash/music-management-system/actions
2. 左侧选择 "Test Docker Hub Credentials"
3. 点击 "Run workflow" → 选择 main → "Run workflow"

### 步骤 2：查看测试结果

工作流会测试以下权限：

| 步骤 | 测试内容 | 成功标志 |
|------|---------|---------|
| Docker Login Test | 登录验证 | ✅ Login succeeded |
| Verify Login Status | 确认用户名 | ✅ 显示 username |
| Test Pull Permission | 读取权限 | ✅ Pull successful |
| Test Push Permission | 写入权限 | ✅ Push successful |

### 步骤 3：分析结果

#### ✅ 所有步骤都成功

```
✅ Docker Login Test: Login succeeded
✅ Verify Login Status: Username: amyflash
✅ Test Pull Permission: Pull successful
✅ Test Push Permission: Push successful
```

**结论：** Secrets 配置正确，有完整权限！

#### ❌ Push 步骤失败

```
❌ Test Push Permission:
Error: insufficient_scope: authorization failed
```

**结论：** Access Token 没有 Write 权限，需要重新创建。

#### ❌ Login 步骤失败

```
❌ Docker Login Test:
Error: incorrect username or password
```

**结论：** Secrets 配置错误，需要检查用户名或 Token。

## 📋 方法 2：本地测试（更直接）

### 步骤 1：获取 Secrets 值

⚠️ **注意：** 你需要在 GitHub 页面查看 Secrets 的值，然后复制下来。

1. 访问：https://github.com/amyflash/music-management-system/settings/secrets/actions
2. 点击 `DOCKER_USERNAME` 的 "Update" → 复制用户名
3. 点击 `DOCKER_PASSWORD` 的 "Update" → 复制 Access Token

### 步骤 2：本地登录测试

```bash
# 测试登录
docker login

# 输入用户名（从 GitHub Secrets 复制）
Username: amyflash

# 输入密码（从 GitHub Secrets 复制的 Access Token）
Password:

# 成功输出：
# Login Succeeded

# 失败输出：
# Error: incorrect username or password
```

### 步骤 3：测试推送权限

```bash
# 创建测试镜像
echo "FROM alpine" | docker build -t amyflash/local-test:latest -

# 推送测试镜像
docker push amyflash/local-test:latest

# 成功输出：
# The push refers to repository [docker.io/amyflash/local-test]
# latest: digest: sha256:abc123... size: 528

# 失败输出：
# Error: insufficient_scope: authorization failed
```

### 步骤 4：清理

```bash
# 删除本地镜像
docker rmi amyflash/local-test:latest

# 在 Docker Hub 网页上删除测试仓库
# 访问：https://hub.docker.com/u/amyflash
# 找到 local-test 仓库 → Settings → Delete
```

## 📋 方法 3：检查 Docker Hub Token 设置

### 步骤 1：登录 Docker Hub

访问：https://hub.docker.com

### 步骤 2：查看 Token 权限

1. 点击右上角头像 → **Account Settings**
2. 左侧菜单选择 **Security**
3. 找到对应的 Access Token
4. 查看 **Access permissions** 列表

### 权限对照表

| 权限 | 说明 | 对应操作 | 是否必需 |
|------|------|---------|---------|
| Read | 读取镜像 | `docker pull` | ✅ 必需 |
| Write | 写入镜像 | `docker push` | ✅ 必需 |
| Delete | 删除镜像 | `docker rmi` (远程) | ⚠️ 建议 |

### 正确的配置

```
✅ Read: 已勾选
✅ Write: 已勾选
✅ Delete: 已勾选（可选但建议）
```

### 错误的配置

```
❌ Read: 已勾选
❌ Write: 未勾选  <-- 这是问题所在！
❌ Delete: 未勾选
```

## 🔍 诊断流程图

```
开始
  ↓
运行 GitHub Actions 测试
  ↓
检查结果
  ├─→ Login 失败 → Secrets 配置错误 → 更新 Secrets
  ├─→ Pull 失败 → Token 没有 Read 权限 → 重新创建 Token
  ├─→ Push 失败 → Token 没有 Write 权限 → 重新创建 Token
  └─→ 全部成功 → ✅ 配置正确
```

## 🛠️ 快速修复步骤

如果测试失败，按照以下步骤修复：

### 1. 重新创建 Access Token（3分钟）

```bash
# 1. 访问 https://hub.docker.com
# 2. Account Settings → Security
# 3. 删除旧 Token
# 4. 创建新 Token
#    - Description: GitHub Actions
#    - Permissions: ✅ Read + ✅ Write + ✅ Delete
# 5. 复制 Token（只显示一次！）
```

### 2. 更新 GitHub Secrets（2分钟）

```bash
# 1. 访问 https://github.com/amyflash/music-management-system/settings/secrets/actions
# 2. 更新 DOCKER_USERNAME = amyflash
# 3. 更新 DOCKER_PASSWORD = 刚才的 Token
```

### 3. 重新测试（1分钟）

```bash
# 1. 访问 https://github.com/amyflash/music-management-system/actions
# 2. 运行 "Test Docker Hub Credentials"
# 3. 等待 2-3 分钟
# 4. 查看结果
```

### 4. 触发构建（5-8分钟）

```bash
# 如果测试成功，触发主构建
git commit --allow-empty -m "chore: 重新触发构建"
git push origin main
```

## ✅ 验证成功的标志

### GitHub Actions 测试

所有步骤显示绿色勾号：

```
✅ Test Docker Hub Credentials
  ├─ ✅ Test Docker Hub Login
  ├─ ✅ Docker Login Test
  ├─ ✅ Verify Login Status
  ├─ ✅ Test Pull Permission
  └─ ✅ Test Push Permission
```

### Docker Hub 页面

访问：https://hub.docker.com/r/amyflash/gha-test

可以看到测试镜像。

### 本地命令

```bash
# 登录成功
docker login
# 输出：Login Succeeded

# 推送成功
docker push amyflash/test:latest
# 输出：The push refers to repository [docker.io/amyflash/test]
```

## 📊 常见问题排查

### Q1: 为什么不能直接查看 Secrets 的值？

A: 出于安全考虑，GitHub Secrets 是加密存储的，无法直接查看。你只能更新它们的值。

### Q2: 如何确认 Secrets 是否已正确设置？

A: 运行测试工作流，查看 "Test Docker Hub Credentials" 步骤的输出。

### Q3: 测试工作流会创建真实镜像吗？

A: 是的，会创建 `amyflash/gha-test:latest` 镜像并推送到 Docker Hub。测试完成后可以删除。

### Q4: 为什么需要 Delete 权限？

A: 虽然推送镜像不需要 Delete 权限，但建议勾选以避免未来的问题（比如清理旧标签）。

### Q5: 如果所有测试都通过，但主构建还是失败怎么办？

A: 这种情况下，问题可能不在 Secrets 权限，而在其他地方（比如 Dockerfile）。需要查看完整的构建日志。

## 🎯 推荐检查流程

1. **首先运行测试工作流**（快速，2-3 分钟）
2. **如果失败，本地测试**（更直接，5 分钟）
3. **如果还是失败，检查 Docker Hub Token 设置**（确认权限）
4. **修复后重新测试**

## 📞 需要帮助？

如果按照以上步骤操作后仍然不确定：

1. **查看测试工作流日志**
   - 访问：https://github.com/amyflash/music-management-system/actions
   - 点击失败的 "Test Docker Hub Credentials"
   - 查看每个步骤的详细日志

2. **检查错误信息**
   - `Login Succeeded` → Secrets 配置正确
   - `incorrect username or password` → Secrets 值错误
   - `insufficient_scope` → Token 权限不足

3. **联系 Docker Hub 支持**
   - 如果 Token 设置正确但仍然失败
   - 访问：https://www.docker.com/company/contact

## ✅ 总结

**最快速的方法：**

1. 运行测试工作流（2-3 分钟）
2. 查看结果
3. 如果失败，重新创建 Token + 更新 Secrets（5 分钟）
4. 再次测试（2-3 分钟）

**总计时间：10-15 分钟**

按照以上步骤，你就能确认 Docker Hub Secrets 是否有 push 权限了！🚀
