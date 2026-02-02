# 音乐管理系统

一个基于 Next.js 16 + PostgreSQL 的单用户音乐管理网站，支持专辑管理、歌曲上传、在线播放和歌词同步显示。

## 功能特性

### 核心功能

- 📀 **专辑管理**
  - 创建、编辑、删除专辑
  - 支持上传专辑封面
  - 查看专辑列表和详情

- 🎵 **歌曲管理**
  - 添加歌曲到指定专辑
  - 编辑歌曲信息（名称、时长、音频文件、歌词）
  - 删除歌曲
  - 支持批量上传

- 🎧 **在线播放**
  - 流式播放音频文件
  - 播放进度控制
  - 音量调节（默认 50%）
  - 上一首/下一首切换

- 📝 **歌词同步**
  - 支持 LRC 格式歌词文件
  - 歌词时间轴同步滚动
  - 点击歌词跳转到对应时间
  - 支持从 URL 加载歌词

- 🔐 **用户认证**
  - 基于 Token 的登录系统
  - 登录状态持久化（localStorage）

- 📤 **文件上传**
  - 支持音频文件上传（MP3）
  - 支持图片文件上传（专辑封面）
  - 支持歌词文件上传（LRC）
  - 文件保存到 `public/uploads` 目录

## 技术栈

### 前端

- **框架**: Next.js 16 (App Router)
- **UI 库**: React 19 + shadcn/ui
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **状态管理**: React Hooks (useState, useEffect)
- **路由**: Next.js App Router

### 后端

- **API**: Next.js API Routes
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **认证**: Bearer Token

### 开发工具

- **包管理器**: pnpm
- **代码规范**: TypeScript ESLint
- **组件库**: shadcn/ui (基于 Radix UI)

## 项目结构

```
src/
├── app/                      # Next.js App Router 目录
│   ├── api/                  # API 路由
│   │   ├── albums/          # 专辑 API
│   │   │   ├── route.ts    # 专辑列表（GET, POST）
│   │   │   └── [id]/       # 专辑详情（GET, PUT, DELETE）
│   │   ├── songs/           # 歌曲 API
│   │   │   ├── route.ts    # 歌曲列表（GET, POST）
│   │   │   └── [id]/       # 歌曲详情（GET, PUT, DELETE）
│   │   └── upload/         # 文件上传 API
│   ├── album/              # 专辑详情页
│   │   └── [id]/page.tsx
│   ├── music/              # 音乐列表页
│   │   └── page.tsx
│   ├── play/               # 播放页面
│   │   └── [id]/page.tsx
│   ├── login/              # 登录页
│   │   └── page.tsx
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页
├── components/             # React 组件
│   ├── ui/                # shadcn/ui 基础组件
│   ├── upload-music-dialog.tsx      # 上传音乐对话框
│   ├── edit-album-dialog.tsx        # 编辑专辑对话框
│   └── edit-song-dialog.tsx         # 编辑歌曲对话框
├── contexts/              # React Context
│   └── AuthContext.tsx    # 认证上下文
├── lib/                   # 工具函数库
│   ├── musicData.ts       # 音乐数据类型
│   ├── lrcParser.ts       # LRC 歌词解析器
│   └── storageManager.ts  # 数据存储管理器
├── storage/               # 数据存储
│   └── database/         # 数据库相关
│       ├── shared/
│       │   └── schema.ts # 数据库表定义
│       ├── albumManager.ts   # 专辑数据管理
│       ├── songManager.ts    # 歌曲数据管理
│       └── index.ts          # 导出
└── public/
    └── uploads/           # 上传文件存储目录
```

## 数据库结构

### albums 表（专辑表）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | varchar(36) | 专辑 ID（UUID） | PRIMARY KEY |
| title | varchar(255) | 专辑名称 | NOT NULL |
| artist | varchar(255) | 歌手 | NOT NULL |
| year | varchar(10) | 发行年份 | NOT NULL |
| coverUrl | varchar(500) | 封面 URL | 可空 |
| createdAt | timestamp | 创建时间 | NOT NULL, DEFAULT NOW() |
| updatedAt | timestamp | 更新时间 | 可空 |

### songs 表（歌曲表）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | varchar(36) | 歌曲 ID（UUID） | PRIMARY KEY |
| albumId | varchar(36) | 专辑 ID（外键） | NOT NULL, FOREIGN KEY |
| title | varchar(255) | 歌曲名称 | NOT NULL |
| duration | varchar(10) | 时长（如 3:30） | NOT NULL |
| audioUrl | varchar(500) | 音频 URL | NOT NULL |
| lyricsUrl | varchar(500) | 歌词 URL | 可空 |
| createdAt | timestamp | 创建时间 | NOT NULL, DEFAULT NOW() |
| updatedAt | timestamp | 更新时间 | 可空 |

### 索引

- `albums_title_idx`: 专辑名称索引
- `songs_album_id_idx`: 专辑 ID 索引

## API 文档

### 专辑 API

#### GET /api/albums
获取所有专辑

**Query 参数:**
- `search` (可选): 搜索关键词
- `skip` (可选): 跳过记录数，默认 0
- `limit` (可选): 返回记录数，默认 100

**响应:**
```json
{
  "albums": [
    {
      "id": "uuid",
      "title": "专辑名称",
      "artist": "歌手",
      "year": "2024",
      "coverUrl": "https://example.com/cover.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  ]
}
```

#### POST /api/albums
创建专辑

**请求体:**
```json
{
  "title": "专辑名称",
  "artist": "歌手",
  "year": "2024",
  "coverUrl": "https://example.com/cover.jpg"
}
```

**响应:**
```json
{
  "album": {
    "id": "uuid",
    "title": "专辑名称",
    "artist": "歌手",
    "year": "2024",
    "coverUrl": "https://example.com/cover.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": null
  }
}
```

#### GET /api/albums/[id]
获取专辑详情（包含歌曲列表）

**响应:**
```json
{
  "album": {
    "id": "uuid",
    "title": "专辑名称",
    "artist": "歌手",
    "year": "2024",
    "coverUrl": "https://example.com/cover.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": null,
    "songs": [
      {
        "id": "uuid",
        "albumId": "uuid",
        "title": "歌曲名称",
        "duration": "3:30",
        "audioUrl": "https://example.com/audio.mp3",
        "lyricsUrl": "https://example.com/lyrics.lrc",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": null
      }
    ]
  }
}
```

#### PUT /api/albums/[id]
更新专辑

**请求体:**
```json
{
  "title": "新专辑名称",
  "artist": "新歌手",
  "year": "2025",
  "coverUrl": "https://example.com/new-cover.jpg"
}
```

**响应:**
```json
{
  "album": { /* 更新后的专辑对象 */ }
}
```

#### DELETE /api/albums/[id]
删除专辑（同时删除关联的歌曲）

**响应:**
```json
{
  "message": "删除成功"
}
```

### 歌曲 API

#### GET /api/songs
获取所有歌曲

**Query 参数:**
- `albumId` (可选): 筛选指定专辑的歌曲
- `search` (可选): 搜索关键词
- `skip` (可选): 跳过记录数，默认 0
- `limit` (可选): 返回记录数，默认 100

**响应:**
```json
{
  "songs": [
    {
      "id": "uuid",
      "albumId": "uuid",
      "title": "歌曲名称",
      "duration": "3:30",
      "audioUrl": "https://example.com/audio.mp3",
      "lyricsUrl": "https://example.com/lyrics.lrc",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  ]
}
```

#### POST /api/songs
创建歌曲

**请求体:**
```json
{
  "albumId": "uuid",
  "title": "歌曲名称",
  "duration": "3:30",
  "audioUrl": "https://example.com/audio.mp3",
  "lyricsUrl": "https://example.com/lyrics.lrc"
}
```

**响应:**
```json
{
  "song": { /* 创建的歌曲对象 */ }
}
```

#### GET /api/songs/[id]
获取歌曲详情

**响应:**
```json
{
  "song": { /* 歌曲对象 */ }
}
```

#### PUT /api/songs/[id]
更新歌曲

**请求体:**
```json
{
  "albumId": "uuid",
  "title": "新歌曲名称",
  "duration": "4:00",
  "audioUrl": "https://example.com/new-audio.mp3",
  "lyricsUrl": "https://example.com/new-lyrics.lrc"
}
```

**响应:**
```json
{
  "song": { /* 更新后的歌曲对象 */ }
}
```

#### DELETE /api/songs/[id]
删除歌曲

**响应:**
```json
{
  "message": "删除成功"
}
```

### 文件上传 API

#### POST /api/upload
上传文件

**请求头:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求体:**
```
file: <文件>
```

**响应:**
```json
{
  "url": "https://example.com/uploads/filename.ext"
}
```

**支持的文件类型:**
- 音频: `.mp3`, `audio/mpeg`
- 图片: `image/*`
- 歌词: `.lrc`

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库
- pnpm 包管理器

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

创建 `.env` 文件：

```env
# 数据库连接
DATABASE_URL=postgresql://user:password@localhost:5432/music_db
```

### 数据库初始化

```bash
# 同步数据库模型
coze-coding-ai db generate-models

# 创建数据表
coze-coding-ai db upgrade
```

### 启动开发服务器

```bash
coze dev
```

启动后，在浏览器中打开 [http://localhost:5000](http://localhost:5000) 查看应用。

### 构建生产版本

```bash
coze build
```

### 启动生产服务器

```bash
coze start
```

---

## 🚀 Docker 一键部署（推荐 VPS 部署）

如果你想在 VPS 服务器上部署，推荐使用 Docker 方式，更加简单和稳定。

### 前置要求

- Docker 20.10+
- Docker Compose 1.29+
- 1GB+ 内存
- 20GB+ 磁盘空间

### 快速部署

```bash
# 1. 克隆项目
git clone <your-repo-url> music-system
cd music-system

# 2. 运行一键部署脚本
chmod +x deploy.sh
bash deploy.sh

# 3. 访问应用
# 本地: http://localhost:5000
# 外网: http://your-server-ip:5000
```

**默认登录信息:**
- 用户名: `admin`
- 密码: `admin123`

### 常用命令

```bash
# 查看服务状态
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

### 详细文档

完整的 Docker 部署文档请查看：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

---

## 开发规范

### 组件开发

优先使用 shadcn/ui 基础组件：

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
```

### 样式开发

使用 Tailwind CSS v4：

```tsx
<div className="flex items-center gap-4 p-4">
  <Button>提交</Button>
</div>
```

### 类型定义

使用 TypeScript 进行类型检查：

```tsx
interface Song {
  id: string;
  title: string;
  duration: string;
  audioUrl: string;
  lyricsUrl?: string;
}
```

### API 调用

使用 fetch 调用 API：

```tsx
const response = await fetch('/api/albums');
const data = await response.json();
```

## 部署说明

### 1. 准备部署环境

确保目标环境已安装：
- Node.js 18+
- PostgreSQL 数据库

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

在部署环境中配置 `.env` 文件：

```env
DATABASE_URL=postgresql://user:password@your-host:5432/music_db
```

### 4. 数据库迁移

```bash
# 同步数据库模型
coze-coding-ai db generate-models

# 创建数据表
coze-coding-ai db upgrade
```

### 5. 配置文件上传目录

#### 本地部署 / VPS 部署

⚠️ **重要**：文件上传功能需要创建 `public/uploads` 目录并设置正确的权限。

```bash
# 创建上传目录
mkdir -p public/uploads

# 设置目录权限（Linux/macOS）
chmod 755 public/uploads

# 或使用部署脚本
bash scripts/pre-deploy.sh
```

**注意事项：**
- 确保 `public/uploads` 目录有写权限
- 上传的文件不会上传到 Git（已配置 .gitignore）

#### Serverless 部署（Vercel / Netlify / 云平台）

⚠️ **重要限制**：Serverless 环境**不支持文件系统持久化存储**。

如果你的部署环境是 Serverless（如 Vercel、Netlify、云函数等），**不能使用本地文件存储**。

**症状：**
- 上传返回 500 错误
- 文件上传后无法访问
- 每次部署后文件丢失

**解决方案：**
必须使用对象存储服务（OSS/S3/COS），详见 [SERVERLESS_UPLOAD.md](./SERVERLESS_UPLOAD.md)

**推荐方案：**

1. **阿里云 OSS**（国内访问快）
   - 价格：¥0.12/GB/月
   - 配置：见 [SERVERLESS_UPLOAD.md](./SERVERLESS_UPLOAD.md)

2. **腾讯云 COS**
   - 价格：类似阿里云 OSS
   - 配置：见 [SERVERLESS_UPLOAD.md](./SERVERLESS_UPLOAD.md)

3. **AWS S3**
   - 价格：$0.023/GB/月
   - 配置：见 [SERVERLESS_UPLOAD.md](./SERVERLESS_UPLOAD.md)

4. **免费方案（测试用）**
   - ImgBB（仅图片）：https://imgbb.com/
   - 限制：10MB，仅用于测试

**快速诊断：**

检查当前环境是否为 Serverless：
```bash
# 检查是否有 /tmp 目录
ls -la /tmp

# 尝试写入测试文件
echo "test" > /tmp/test.txt && echo "支持文件写入" || echo "不支持文件写入"
```

如果你看到"不支持文件写入"，说明是 Serverless 环境，**必须使用对象存储**。

```bash
# 创建上传目录
mkdir -p public/uploads

# 设置目录权限（Linux/macOS）
chmod 755 public/uploads

# 或使用部署脚本
bash scripts/pre-deploy.sh
```

**注意事项：**
- 确保 `public/uploads` 目录有写权限
- Vercel 等无服务器平台不支持文件持久化，建议使用对象存储（见 [DEPLOYMENT_UPLOAD.md](./DEPLOYMENT_UPLOAD.md)）
- 上传的文件不会上传到 Git（已配置 .gitignore）

### 6. 构建应用

```bash
coze build
```

### 7. 启动服务

```bash
coze start
```

服务将运行在 http://localhost:5000

### 8. 使用进程管理器（推荐）

使用 PM2 管理进程：

```bash
# 安装 PM2
pnpm add -g pm2

# 启动应用
pm2 start npm --name "music-app" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs music-app

# 重启应用
pm2 restart music-app

# 停止应用
pm2 stop music-app
```

### 9. 配置 Nginx 反向代理（可选）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存
    location /uploads/ {
        proxy_pass http://localhost:5000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 10. 配置 HTTPS（可选）

使用 Let's Encrypt 配置 HTTPS：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 常见问题

### 1. 文件上传失败

检查：
- 文件大小是否超过限制
- 文件类型是否支持
- Token 是否有效

### 2. 数据库连接失败

检查：
- DATABASE_URL 是否正确配置
- PostgreSQL 服务是否启动
- 数据库用户权限是否足够

### 3. 歌词无法显示

检查：
- 歌词文件格式是否为 LRC
- lyricsUrl 是否可访问
- 浏览器控制台是否有错误

### 4. 音频无法播放

检查：
- 音频文件格式是否为 MP3
- audioUrl 是否可访问
- 浏览器是否支持音频播放

### 5. 文件上传失败

检查：
- `public/uploads` 目录是否存在
- 目录是否有写权限（`chmod 755 public/uploads`）
- 查看服务器日志获取详细错误信息
- Vercel 部署需要使用对象存储（见 [DEPLOYMENT_UPLOAD.md](./DEPLOYMENT_UPLOAD.md)）

**快速修复：**
```bash
# 创建上传目录
mkdir -p public/uploads
chmod 755 public/uploads
```

## 许可证

MIT

## 联系方式

如有问题，请提交 Issue 或 Pull Request。
