# Docker Hub 授权问题排查指南

## 🐛 错误信息

```
ERROR: failed to build: failed to solve: failed to push amyflash/music-management-system:latest
push access denied, repository does not exist or may require authorization
server message: insufficient_scope: authorization failed
```

## 🔍 问题原因

**根本原因：Docker Hub Access Token 权限不足**

可能的原因：
1. ❌ Access Token 没有 Write 权限
2. ❌ GitHub Secrets 配置不正确
3. ❌ Token 已过期或被撤销
4. ❌ 用户名不匹配

## 🔧 解决方案

### 步骤 1：重新创建 Access Token

1. **登录 Docker Hub**
   - 访问：https://hub.docker.com
   - 登录你的账号

2. **进入 Security 设置**
   - 点击右上角头像
   - 选择 "Account Settings"
   - 左侧菜单选择 "Security"

3. **删除旧 Token（如果有）**
   - 找到之前创建的 Token
   - 点击 "Delete" 删除

4. **创建新 Token**
   - 点击 "New Access Token"
   - **Description**: 输入 "GitHub Actions" 或任何描述
   - **Access permissions**: 勾选以下权限
     - ✅ **Read** - 读取镜像
     - ✅ **Write** - 写入/推送镜像
     - ✅ **Delete** - 删除镜像（可选，但建议勾选）
   - 点击 "Generate"

5. **保存 Token**
   - ⚠️ **立即复制 Token**（只显示一次！）
   - 保存到安全的地方

### 步骤 2：更新 GitHub Secrets

1. **访问 GitHub Secrets**
   - 访问：https://github.com/amyflash/music-management-system/settings/secrets/actions

2. **更新 DOCKER_USERNAME**
   - 找到 `DOCKER_USERNAME`
   - 点击 "Update"
   - 确认用户名是 `amyflash`
   - 点击 "Update secret"

3. **更新 DOCKER_PASSWORD**
   - 找到 `DOCKER_PASSWORD`
   - 点击 "Update"
   - 粘贴刚才生成的 Access Token
   - 点击 "Update secret"

### 步骤 3：验证配置

1. **测试本地登录**
   ```bash
   docker login
   # 输入用户名：amyflash
   # 输入密码：刚才生成的 Access Token
   ```

2. **测试推送**
   ```bash
   # 创建测试镜像
   echo "FROM alpine" | docker build -t amyflash/test:latest -

   # 推送测试镜像
   docker push amyflash/test:latest

   # 删除本地测试镜像
   docker rmi amyflash/test:latest

   # 删除远程测试镜像
   # 在 Docker Hub 网页上删除 test 仓库
   ```

### 步骤 4：重新触发构建

配置完成后，重新触发构建：

**方法 1：推送代码**
```bash
git commit --allow-empty -m "chore: 重新触发构建"
git push origin main
```

**方法 2：手动触发**
1. 访问：https://github.com/amyflash/music-management-system/actions
2. 选择 "Docker Build and Push" 工作流
3. 点击 "Run workflow"
4. 选择分支，点击 "Run workflow"

## ✅ 验证成功的标志

构建成功后，你会看到：

### GitHub Actions 页面
- ✅ 绿色勾号（Success）
- ✅ 所有步骤都显示绿色
- ✅ "Build and push" 步骤显示 "Digest: sha256:..."

### Docker Hub 页面
- ✅ 访问：https://hub.docker.com/r/amyflash/music-management-system
- ✅ 可以看到 Tags 标签页
- ✅ 有 3 个标签：latest, 日期, SHA

### 命令行验证
```bash
# 拉取镜像
docker pull amyflash/music-management-system:latest

# 查看镜像
docker images | grep music-management-system

# 输出示例：
# amyflash/music-management-system   latest   abc123   10 minutes ago   500MB
```

## 🔍 常见问题

### Q1: 为什么会有 "insufficient_scope" 错误？

A: Access Token 的权限不够。必须勾选 Write 权限。

### Q2: 如何确认 Token 权限？

A: 在 Docker Hub → Security 页面查看 Token 的权限列表。

### Q3: Token 可以用于多个仓库吗？

A: 可以。一个 Token 可以用于该用户下的所有仓库。

### Q4: Token 有有效期吗？

A: Access Token 没有过期时间，但建议定期更换以增强安全性。

### Q5: 如何查看 GitHub Secrets 是否正确？

A: 你无法直接查看 Secrets 的值（出于安全考虑），但可以更新它们来测试。

## 🛠️ 调试技巧

### 1. 查看 GitHub Actions 日志

访问：https://github.com/amyflash/music-management-system/actions

点击失败的构建，查看 "Log in to Docker Hub" 步骤的日志：

**成功的日志示例：**
```
Login Succeeded
```

**失败的日志示例：**
```
Error: incorrect username or password
```

### 2. 本地测试 Docker Hub 连接

```bash
# 测试登录
docker login -u amyflash

# 输入 Token
# 如果成功，输出：Login Succeeded
# 如果失败，输出：Error: incorrect username or password
```

### 3. 查看 Docker Hub 仓库

访问：https://hub.docker.com/u/amyflash

确认：
- ✅ 仓库列表中有 `music-management-system`
- ✅ 或者在推送后会自动创建

## 📊 权限对照表

| 权限 | 用途 | 是否必需 |
|------|------|---------|
| Read | 拉取镜像 | ✅ 必需 |
| Write | 推送镜像 | ✅ 必需 |
| Delete | 删除镜像 | ⚠️ 建议 |

**注意：必须同时勾选 Read 和 Write 权限！**

## 🎯 完整检查清单

### Docker Hub 配置
- [ ] 已登录 Docker Hub
- [ ] Access Token 已创建
- [ ] Token 权限包含 Read
- [ ] Token 权限包含 Write
- [ ] Token 权限包含 Delete（可选）
- [ ] Token 已保存到安全地方

### GitHub Secrets 配置
- [ ] DOCKER_USERNAME 已设置为 amyflash
- [ ] DOCKER_PASSWORD 已设置为 Access Token
- [ ] 两个 Secrets 都已更新

### 测试验证
- [ ] 本地 docker login 成功
- [ ] 本地 docker push 测试成功
- [ ] GitHub Actions 构建成功
- [ ] 镜像已推送到 Docker Hub
- [ ] 可以在 Docker Hub 看到镜像

## 🚀 下一步

1. **立即操作**：重新创建 Access Token（5分钟）
2. **更新 Secrets**：更新 GitHub Secrets（2分钟）
3. **触发构建**：重新触发构建（1分钟）
4. **等待完成**：等待构建完成（5-8分钟）
5. **验证成功**：确认镜像已推送（1分钟）

**总计时间：约 15 分钟**

## 📞 需要帮助？

如果按照以上步骤操作后仍然失败：

1. **确认用户名**
   - Docker Hub 用户名是 `amyflash`（注意拼写）
   - GitHub Secrets 中 `DOCKER_USERNAME` 是 `amyflash`

2. **确认 Token 权限**
   - 必须同时勾选 Read 和 Write
   - 建议同时勾选 Delete

3. **查看完整日志**
   - GitHub Actions 页面 → 失败的构建
   - 点击展开所有步骤
   - 查看 "Log in to Docker Hub" 的详细日志

4. **尝试新 Token**
   - 删除所有旧 Token
   - 创建全新的 Token
   - 更新 GitHub Secrets

## 📚 相关文档

- [Docker Hub Access Tokens](https://docs.docker.com/security/for-developers/access-tokens/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Docker Login](https://docs.docker.com/engine/reference/commandline/login/)

## ✅ 预期结果

配置完成后：

```
✅ GitHub Actions 构建成功
✅ 镜像已推送到 Docker Hub
✅ 可以拉取镜像
✅ 可以在 VPS 上使用
```

按照以上步骤操作，问题应该可以解决！🚀
