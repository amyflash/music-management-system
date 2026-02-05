# 音乐管理系统

一个基于 Next.js 16 + SQLite 的单用户音乐管理网站，支持专辑管理、歌曲上传、在线播放和歌词同步显示。

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
  - 基于 Bearer Token 的登录系统
  - 登录状态持久化（localStorage）
  - 支持外部认证服务：https://auth.516768.xyz

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
- **数据库**: SQLite (通过 @libsql/client)
- **ORM**: Drizzle ORM
- **认证**: Bearer Token
- **认证服务**: https://auth.516768.xyz

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
│   │   ├── upload/         # 文件上传 API
│   │   ├── audio/          # 音频播放 API
│   │   └── files/          # 文件访问 API
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
│   ├── upload-song-dialog.tsx         # 上传歌曲对话框
│   ├── upload-music-dialog.tsx       # 上传音乐对话框
│   ├── edit-song-dialog.tsx          # 编辑歌曲对话框
│   └── edit-album-dialog.tsx         # 编辑专辑对话框
├── contexts/              # React Context
│   └── AuthContext.tsx    # 认证上下文
├── hooks/                 # 自定义 Hooks
│   └── use-mobile.ts      # 移动端检测 Hook
├── lib/                   # 工具函数库
│   ├── musicData.ts       # 音乐数据类型
│   ├── lrcParser.ts       # LRC 歌词解析器
│   ├── storageManager.ts  # 数据存储管理器
│   ├── auth.ts            # 认证工具
│   └── utils.ts           # 通用工具
├── storage/               # 数据存储
│   └── database/         # 数据库相关
│       ├── shared/
│       │   └── schema.ts # 数据库表定义
│       ├── db.ts          # SQLite 数据库连接
│       ├── albumManager.ts   # 专辑数据管理
│       ├── songManager.ts    # 歌曲数据管理
│       └── index.ts          # 导出
├── scripts/               # 部署和构建脚本
│   ├── build.sh           # 构建脚本
│   ├── dev.sh             # 开发启动脚本
│   ├── start.sh           # 生产启动脚本
│   ├── pre-deploy.sh      # 部署前准备脚本
│   └── init-db.ts         # 数据库初始化脚本
public/
├── favicon.ico            # 网站图标
└── uploads/               # 上传文件存储目录
data/
└── music.db               # SQLite 数据库文件
```

## 数据库结构

### albums 表（专辑表）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | TEXT | 专辑 ID（UUID） | PRIMARY KEY |
| title | TEXT | 专辑名称 | NOT NULL |
| artist | TEXT | 歌手 | NOT NULL |
| year | TEXT | 发行年份 | 可空 |
| cover_url | TEXT | 封面 URL | 可空 |
| created_at | INTEGER | 创建时间（时间戳） | NOT NULL |
| updated_at | INTEGER | 更新时间（时间戳） | 可空 |

### songs 表（歌曲表）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | TEXT | 歌曲 ID（UUID） | PRIMARY KEY |
| album_id | TEXT | 专辑 ID（外键） | NOT NULL, FOREIGN KEY |
| title | TEXT | 歌曲名称 | NOT NULL |
| duration | TEXT | 时长（如 3:30） | NOT NULL |
| audio_url | TEXT | 音频 URL | NOT NULL |
| lyrics_url | TEXT | 歌词 URL | 可空 |
| created_at | INTEGER | 创建时间（时间戳） | NOT NULL |
| updated_at | INTEGER | 更新时间（时间戳） | 可空 |

**外键约束**: 删除专辑时会自动级联删除关联的歌曲 (ON DELETE CASCADE)

### 索引

- `albums_title_idx`: 专辑名称索引
- `songs_album_id_idx`: 专辑 ID 索引

### 数据库文件位置

- 默认路径：`data/music.db`
- 可通过环境变量 `SQLITE_DB_PATH` 自定义

## API 文档

### 专辑 API

#### GET /api/albums
获取所有专辑（包含歌曲数量和歌曲列表）

**请求头:**
```
Authorization: Bearer {token}
```

**响应:**
```json
{
  "success": true,
  "albums": [
    {
      "id": "uuid",
      "title": "专辑名称",
      "artist": "歌手",
      "year": "2024",
      "coverUrl": "https://example.com/cover.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null,
      "songs": [...],
      "songCount": 10
    }
  ],
  "count": 1
}
```

#### POST /api/albums
创建专辑

**请求头:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

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
  "success": true,
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
  "success": true,
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

**响应:**
```json
{
  "success": true,
  "album": { /* 更新后的专辑对象 */ }
}
```

#### DELETE /api/albums/[id]
删除专辑（同时删除关联的歌曲）

**响应:**
```json
{
  "success": true,
  "message": "删除成功"
}
```

### 歌曲 API

#### GET /api/songs
获取所有歌曲

**Query 参数:**
- `albumId` (可选): 筛选指定专辑的歌曲

**响应:**
```json
{
  "success": true,
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
  "success": true,
  "song": { /* 创建的歌曲对象 */ }
}
```

#### GET /api/songs/[id]
获取歌曲详情

**响应:**
```json
{
  "success": true,
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
  "success": true,
  "song": { /* 更新后的歌曲对象 */ }
}
```

#### DELETE /api/songs/[id]
删除歌曲

**响应:**
```json
{
  "success": true,
  "message": "删除成功"
}
```

### 文件上传 API

#### POST /api/upload
上传文件（封面、音频、歌词）

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

### 音频播放 API

#### GET /api/audio/[id]
通过歌曲 ID 获取音频文件（支持流式传输）

**请求头:**
```
Authorization: Bearer {token}
```

**响应:**
- 音频流式响应 (audio/mpeg)

### 文件访问 API

#### GET /api/files/[filename]
访问上传的文件（封面、歌词等）

**响应:**
- 文件内容

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 包管理器

### 安装依赖

```bash
pnpm install
```

### 配置环境变量（可选）

创建 `.env` 文件（如需自定义配置）：

```env
# 数据库配置（可选，默认使用 data/music.db）
# SQLITE_DB_PATH=/path/to/custom/music.db

# 应用配置（可选）
NODE_ENV=development
PORT=5000
```

### 创建必要的目录

```bash
mkdir -p data public/uploads
```

### 启动开发服务器

```bash
pnpm dev
```

启动后，在浏览器中打开 [http://localhost:5000](http://localhost:5000) 查看应用。

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

---

## 🐳 Docker 部署

### 注意事项

⚠️ **重要**: 项目当前使用 SQLite 数据库，Docker 部署配置需要相应调整。

如果直接使用现有的 `docker-compose.yml`，需要修改为使用 SQLite 而非 PostgreSQL。建议使用以下简化的 Docker 部署方式。

### 前置要求

- Docker 20.10+
- Docker Compose 1.29+
- 512MB+ 内存
- 10GB+ 磁盘空间

### 快速部署（使用 SQLite）

创建 `docker-compose.simple.yml`：

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: music-app
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    volumes:
      - ./data:/app/data
      - ./public/uploads:/app/public/uploads
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

启动服务：

```bash
docker compose -f docker-compose.simple.yml up -d
```

### 常用命令

```bash
# 查看服务状态
docker compose -f docker-compose.simple.yml ps

# 查看日志
docker compose -f docker-compose.simple.yml logs -f

# 停止服务
docker compose -f docker-compose.simple.yml down

# 重启服务
docker compose -f docker-compose.simple.yml restart

# 备份数据
cp data/music.db backup/music.db.$(date +%Y%m%d)
```

### 数据持久化

- 数据库文件：`data/music.db`
- 上传文件：`public/uploads/`

建议将这两个目录通过 Docker volumes 挂载到容器中，确保数据不会丢失。

---

## 🚀 GitHub Actions CI/CD

使用 GitHub Actions 自动构建并推送到 Docker Hub。

### 当前配置

- 镜像名称：`harrietlq1984/music-management-system`
- 触发条件：推送代码到 `main` 分支或手动触发
- 支持平台：linux/amd64
- 支持标签：`latest`, `YYYYMMDD`, `commit-sha`

### 配置 Secrets

在 GitHub 仓库 → Settings → Secrets and variables → Actions 中添加：

- `DOCKER_USERNAME`: Docker Hub 用户名
- `DOCKER_PASSWORD`: Docker Hub Access Token

### 详细文档

- [GitHub Actions 配置指南](./GITHUB_ACTIONS_GUIDE.md)
- [Docker Hub 权限检查](./CHECK_DOCKER_SECRETS.md)

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
const response = await fetch('/api/albums', {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
const data = await response.json();
```

## 部署说明

### 直接部署

#### 1. 准备部署环境

确保目标环境已安装：
- Node.js 18+
- pnpm 包管理器

#### 2. 安装依赖

```bash
pnpm install
```

#### 3. 创建必要的目录

```bash
mkdir -p data public/uploads
```

#### 4. 构建应用

```bash
pnpm build
```

#### 5. 启动服务

```bash
pnpm start
```

服务将运行在 http://localhost:5000

#### 6. 使用进程管理器（推荐）

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

# 配置开机自启
pm2 startup
pm2 save
```

#### 7. 配置 Nginx 反向代理（可选）

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

#### 8. 配置 HTTPS（可选）

使用 Let's Encrypt 配置 HTTPS：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## Serverless 部署说明

### 限制

⚠️ **重要限制**：Serverless 环境（如 Vercel、Netlify、云函数等）**不支持文件系统持久化存储**。

如果你的部署环境是 Serverless，**不能使用本地 SQLite 数据库和本地文件存储**。

### 解决方案

必须使用：
1. **外部数据库服务**：如 Turso（libsql 云服务）、Supabase 等
2. **对象存储服务**：如阿里云 OSS、腾讯云 COS、AWS S3 等

### 推荐方案

**1. 数据库 - Turso（libsql 云服务）**
- 免费套餐：500 行、10,000 次读取/月
- 性价比高，与 libsql 完美兼容
- 配置简洁

**2. 对象存储 - 阿里云 OSS**
- 价格：¥0.12/GB/月
- 国内访问速度快
- 支持配置文档

### 详细配置

详见：[SERVERLESS_UPLOAD.md](./SERVERLESS_UPLOAD.md)

## 常见问题

### 1. 文件上传失败

检查：
- `public/uploads` 目录是否存在且有写权限
- 文件大小是否超过限制
- 文件类型是否支持
- Token 是否有效

**快速修复：**
```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### 2. 数据库连接失败

检查：
- `data` 目录是否存在且有写权限
- SQLite 数据库文件路径是否正确
- 磁盘空间是否充足

**快速修复：**
```bash
mkdir -p data
chmod 755 data
```

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

### 5. 认证失败

检查：
- Token 是否有效
- 认证服务是否正常运行： https://auth.516768.xyz
- 请求头是否包含 Authorization: Bearer {token}

### 6. Docker 部署问题

检查：
- Docker 版本是否符合要求
- 目录权限是否正确
- 日志查看错误信息：`docker compose logs -f`

```bash
# 确保目录存在
mkdir -p data public/uploads

# 设置正确权限
chmod 755 data public/uploads
```

## 备份和恢复

### 备份数据

```bash
# 备份数据库
cp data/music.db backup/music.db.$(date +%Y%m%d_%H%M%S)

# 备份上传文件
tar -czf backup/uploads_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/
```

### 恢复数据

```bash
# 恢复数据库
cp backup/music.db.YYYYMMDD_HHMMSS data/music.db

# 恢复上传文件
tar -xzf backup/uploads_YYYYMMDD_HHMMSS.tar.gz -C public/
```

### 自动备份脚本

创建 `backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="backup"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# 备份数据库
cp data/music.db "$BACKUP_DIR/music.db.$DATE"

# 备份上传文件
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" public/uploads/

# 清理 30 天前的备份
find "$BACKUP_DIR" -name "music.db.*" -mtime +30 -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +30 -delete

echo "备份完成: $BACKUP_DIR/music.db.$DATE"
```

设置定时任务（crontab）：

```bash
# 每天凌晨 2 点自动备份
0 2 * * * /path/to/project/backup.sh
```

## 许可证

MIT

## 联系方式

如有问题，请提交 Issue 或 Pull Request。
