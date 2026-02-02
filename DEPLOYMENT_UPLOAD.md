# 部署上传文件功能常见问题

## 问题：部署后上传文件失败

### 原因分析

部署后上传文件失败通常是因为以下原因：

1. **`public/uploads` 目录不存在或没有写权限**
2. **服务器环境配置问题**
3. **云平台限制（如 Vercel）**

---

## 解决方案

### 方案一：本地服务器部署（推荐）

#### 1. 创建 uploads 目录

在项目根目录执行：

```bash
# 创建 uploads 目录
mkdir -p public/uploads

# 设置目录权限（Linux/macOS）
chmod 755 public/uploads
```

#### 2. 确保 uploads 目录在 .gitignore 中

**注意**：不要将 `public/uploads` 添加到 `.gitignore`，否则部署时不会创建该目录。

但可以只忽略上传的文件，保留目录结构：

```gitignore
# 上传的文件
public/uploads/*

# 但保留 uploads 目录
!public/uploads/.gitkeep
```

#### 3. 创建 .gitkeep 文件

确保 uploads 目录被 Git 追踪：

```bash
# 创建 .gitkeep 文件
touch public/uploads/.gitkeep

# 提交到 Git
git add public/uploads/.gitkeep
git commit -m "添加 uploads 目录"
```

#### 4. 部署时创建目录

在部署脚本中添加目录创建命令：

```bash
# 部署前执行
mkdir -p public/uploads
chmod 755 public/uploads

# 然后构建和启动
pnpm install
pnpm build
pnpm start
```

---

### 方案二：Vercel 部署（不推荐文件上传）

⚠️ **重要提示**：Vercel 等无服务器平台（Serverless）**不支持文件持久化存储**，上传的文件会在部署后丢失。

#### 推荐方案：使用对象存储

对于 Vercel 部署，建议使用对象存储服务：

1. **AWS S3**
2. **阿里云 OSS**
3. **腾讯云 COS**
4. **Cloudinary**（图片专用）

#### 修改上传逻辑

将文件上传到对象存储，而不是本地文件系统：

```typescript
// 示例：使用 AWS S3
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadToS3(file: File, fileName: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `uploads/${fileName}`,
    Body: await file.arrayBuffer(),
    ContentType: file.type,
  });

  await s3Client.send(command);
  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/uploads/${fileName}`;
}
```

---

### 方案三：Docker 部署

#### 1. 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 创建 uploads 目录并设置权限
RUN mkdir -p public/uploads && chmod 755 public/uploads

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["pnpm", "start"]
```

#### 2. 构建并运行

```bash
# 构建镜像
docker build -t music-management-system .

# 运行容器
docker run -p 5000:5000 -v $(pwd)/public/uploads:/app/public/uploads music-management-system
```

---

### 方案四：PM2 部署

#### 1. 部署脚本

```bash
#!/bin/bash

# 创建 uploads 目录
mkdir -p public/uploads
chmod 755 public/uploads

# 安装依赖
pnpm install

# 构建应用
pnpm build

# 使用 PM2 启动
pm2 start npm --name "music-app" -- start
```

#### 2. 设置环境变量

```bash
# 在生产环境
export NODE_ENV=production
```

---

## 验证上传功能

### 1. 检查目录权限

```bash
# 检查 uploads 目录
ls -la public/uploads

# 应该看到类似输出：
# drwxr-xr-x  2 user  group   4096 Jan 30 12:00 .
# drwxr-xr-x  3 user  group   4096 Jan 30 12:00 ..
# -rw-r--r--  1 user  group      0 Jan 30 12:00 .gitkeep
```

### 2. 测试上传

打开浏览器控制台，尝试上传文件，查看错误信息。

### 3. 查看服务器日志

```bash
# 如果使用 PM2
pm2 logs music-app

# 如果使用普通启动
# 查看应用日志输出
```

上传 API 已经添加了详细的日志输出，可以看到：

```
[Upload] 开始处理文件上传请求
[Upload] 鉴权检查: 有 token
[Upload] 收到文件: { name: 'test.mp3', size: 1234567, type: 'audio/mpeg' }
[Upload] 文件类型检查: audio/mpeg 通过
[Upload] 文件读取成功，大小: 1234567 bytes
[Upload] 上传目录: /app/public/uploads
[Upload] 目录已存在
[Upload] 目录权限检查通过
[Upload] 正在保存文件到: /app/public/uploads/1738233600000-test.mp3
[Upload] 文件保存成功
[Upload] 上传成功，URL: /uploads/1738233600000-test.mp3
```

---

## 常见错误及解决方案

### 错误 1: Cannot create directory

**原因**：目录没有创建权限

**解决方案**：
```bash
sudo chmod 755 public/uploads
```

### 错误 2: EACCES: permission denied

**原因**：目录没有写权限

**解决方案**：
```bash
sudo chown -R $USER:$USER public/uploads
sudo chmod -R 755 public/uploads
```

### 错误 3: ENOSPC: no space left on device

**原因**：磁盘空间不足

**解决方案**：
清理磁盘空间或使用对象存储

### 错误 4: 文件上传后无法访问

**原因**：Next.js 静态文件配置问题

**解决方案**：
确保文件确实保存到 `public/uploads` 目录，并重启服务

---

## 最佳实践

### 1. 使用环境变量配置上传目录

```typescript
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads');
```

### 2. 添加文件清理机制

定期清理过期的上传文件：

```bash
# 创建清理脚本
# scripts/cleanup-uploads.sh
find public/uploads -type f -mtime +30 -delete
```

### 3. 限制文件大小和类型

已在代码中实现：
- 最大文件大小：50MB
- 支持的类型：MP3、图片、LRC

### 4. 使用 CDN 加速

将上传的文件同步到 CDN，提高访问速度。

---

## 总结

**推荐部署方案：**

| 部署环境 | 推荐方案 | 说明 |
|---------|---------|------|
| 本地/VPS | 本地文件系统 | 需要确保目录权限 |
| Docker | 挂载卷 | 使用 Docker volume 持久化 |
| Vercel | 对象存储 | 必须使用 S3/OSS 等 |
| 传统服务器 | 本地文件系统 | 需要配置 Nginx |

**快速修复：**

```bash
# 1. 创建目录
mkdir -p public/uploads
chmod 755 public/uploads

# 2. 提交到 Git
touch public/uploads/.gitkeep
git add public/uploads/.gitkeep
git commit -m "添加 uploads 目录"

# 3. 推送到 GitHub
git push origin main

# 4. 部署时确保执行：
mkdir -p public/uploads
chmod 755 public/uploads
```

---

## 🚀 Docker 一键部署（推荐 VPS）

如果你想在 VPS 服务器上快速部署，推荐使用我们的 Docker 一键部署方案：

```bash
# 克隆项目
git clone <your-repo-url> music-system
cd music-system

# 一键部署
bash deploy.sh
```

**优势：**
- ✅ 自动创建 uploads 目录
- ✅ 自动配置文件权限
- ✅ 自动初始化数据库
- ✅ 一键备份和恢复
- ✅ 支持容器化部署

**详细文档：** [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

---

## 联系支持

如果问题仍然存在，请提供：
1. 部署环境（VPS/Docker/Vercel）
2. 错误日志（查看服务器日志）
3. 浏览器控制台错误信息
