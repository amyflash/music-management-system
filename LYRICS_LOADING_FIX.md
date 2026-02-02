# 歌词加载问题修复指南

## 🐛 问题描述

**错误信息：**
```
从URL加载歌词失败: Error: 加载歌词失败
```

**原因：**
- Next.js 静态文件服务在 Docker 环境中无法提供 `/uploads/` 目录下的文件
- 浏览器访问 `/uploads/xxx.lrc` 时返回 404
- loadLyricsFromUrl 函数无法获取文件内容

## ✅ 解决方案

### 1. 创建文件 API 路由

**文件：** `src/app/api/files/[filename]/route.ts`

**功能：**
- 专门用于提供上传文件的访问
- 支持歌词、音频、图片等文件类型
- 自动设置正确的 Content-Type
- 添加安全检查防止路径遍历攻击

**使用方式：**
```bash
# 旧方式（不工作）
GET /uploads/1234567890-song.lrc

# 新方式（工作）
GET /api/files/1234567890-song.lrc
```

### 2. 修改歌词加载函数

**文件：** `src/lib/lrcParser.ts`

**改进内容：**
- 自动将 `/uploads/` 转换为 `/api/files/`
- 增强错误日志，显示详细的错误信息
- 兼容旧数据和新上传的文件

**代码示例：**
```typescript
export async function loadLyricsFromUrl(lyricsUrl: string): Promise<string> {
  console.log('[LRC] 开始加载歌词:', lyricsUrl);

  // 兼容旧数据：将 /uploads/ 转换为 /api/files/
  let actualUrl = lyricsUrl;
  if (actualUrl.startsWith('/uploads/')) {
    const fileName = actualUrl.replace('/uploads/', '');
    actualUrl = `/api/files/${fileName}`;
    console.log('[LRC] 转换歌词 URL:', lyricsUrl, '->', actualUrl);
  }

  const response = await fetch(actualUrl);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[LRC] 歌词加载失败:', {
      url: actualUrl,
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`加载歌词失败 (${response.status}: ${response.statusText})`);
  }

  const text = await response.text();
  console.log('[LRC] 歌词加载成功，长度:', text.length);
  return text;
}
```

### 3. 修改上传对话框

**文件：** `src/components/upload-music-dialog.tsx`

**改进内容：**
- 上传成功后，将 URL 从 `/uploads/xxx` 转换为 `/api/files/xxx`
- 确保新上传的文件能正确访问

**代码示例：**
```typescript
// 如果是本地环境，将 /uploads/ 转换为 /api/files/ 以确保能访问文件
let fileUrl = result.url || result.dataUrl || '';
if (fileUrl.startsWith('/uploads/')) {
  const fileName = fileUrl.replace('/uploads/', '');
  fileUrl = `/api/files/${fileName}`;
  console.log('[Upload] 转换文件 URL:', result.url, '->', fileUrl);
}
```

### 4. 修改音频 API

**文件：** `src/app/api/audio/[id]/route.ts`

**改进内容：**
- 从 `@/lib/storageManager` 获取歌曲数据（数据库）
- 而不是从 `@/lib/musicData`（静态数据）
- 确保能获取用户上传的音频文件

## 🚀 部署步骤

### 在 VPS 上更新

```bash
# 1. 进入项目目录
cd /path/to/music-management-system

# 2. 拉取最新代码
git pull origin main

# 3. 重启服务
docker compose up -d

# 4. 等待服务启动
sleep 10

# 5. 测试 API
curl http://localhost:5000/api/albums
```

## 📊 验证修复

### 1. 检查歌词文件是否存在

```bash
# 查看上传目录中的文件
ls -lh public/uploads/

# 应该能看到歌词文件（.lrc 文件）
```

### 2. 测试文件 API

```bash
# 假设有一个歌词文件：1234567890-song.lrc
curl http://localhost:5000/api/files/1234567890-song.lrc

# 应该返回歌词内容
```

### 3. 测试歌词加载

1. 在浏览器中打开播放页面
2. 打开浏览器控制台（F12）
3. 查看 Console 标签

**预期的日志：**
```
[LRC] 开始加载歌词: /uploads/1234567890-song.lrc
[LRC] 转换歌词 URL: /uploads/1234567890-song.lrc -> /api/files/1234567890-song.lrc
[LRC] 请求歌词 URL: /api/files/1234567890-song.lrc
[LRC] 歌词加载成功，长度: 1234
```

**不应该看到：**
```
[LRC] 歌词加载失败: 404 Not Found
从URL加载歌词失败: Error: 加载歌词失败
```

## 🔍 诊断步骤

如果歌词还是加载失败，按以下步骤诊断：

### 1. 检查应用日志

```bash
docker logs --tail=50 music-app
```

查看是否有相关的错误信息。

### 2. 检查文件 API 日志

```bash
docker logs --tail=50 music-app | grep "\[File API\]"
```

### 3. 手动测试文件 API

```bash
# 获取一个歌曲 ID
curl http://localhost:5000/api/songs

# 查看歌词 URL
# 假设歌词 URL 是：/uploads/1234567890-song.lrc

# 测试文件 API
curl http://localhost:5000/api/files/1234567890-song.lrc
```

### 4. 检查数据库中的歌词 URL

```bash
docker exec -it music-db psql -U musicuser -d musicdb -c "SELECT id, title, lyrics_url FROM songs;"
```

检查 `lyrics_url` 字段的值：
- 如果是 `/uploads/xxx.lrc` - 旧数据，需要转换
- 如果是 `/api/files/xxx.lrc` - 新数据，应该能正常工作

### 5. 更新旧数据（可选）

如果数据库中有很多旧数据（使用 `/uploads/` 格式），可以批量更新：

```sql
-- 在数据库中更新歌词 URL
UPDATE songs
SET lyrics_url = REPLACE(lyrics_url, '/uploads/', '/api/files/')
WHERE lyrics_url LIKE '/uploads/%';

-- 更新音频 URL（如果需要）
UPDATE songs
SET audio_url = REPLACE(audio_url, '/uploads/', '/api/files/')
WHERE audio_url LIKE '/uploads/%';

-- 更新专辑封面 URL（如果需要）
UPDATE albums
SET cover_url = REPLACE(cover_url, '/uploads/', '/api/files/')
WHERE cover_url LIKE '/uploads/%';
```

## 📋 支持的文件类型

文件 API 支持以下文件类型：

| 扩展名 | Content-Type | 用途 |
|--------|-------------|------|
| .mp3 | audio/mpeg | 音频文件 |
| .wav | audio/wav | 音频文件 |
| .ogg | audio/ogg | 音频文件 |
| .flac | audio/flac | 音频文件 |
| .jpg | image/jpeg | 图片文件 |
| .jpeg | image/jpeg | 图片文件 |
| .png | image/png | 图片文件 |
| .gif | image/gif | 图片文件 |
| .webp | image/webp | 图片文件 |
| .lrc | text/plain; charset=utf-8 | 歌词文件 |
| .txt | text/plain; charset=utf-8 | 文本文件 |

## 🎯 总结

### 问题
- Next.js 静态文件服务在 Docker 中无法提供 `/uploads/` 文件
- 导致歌词、音频、图片无法加载

### 解决方案
- 创建 `/api/files/[filename]` API 路由
- 自动转换 URL 格式：`/uploads/xxx` → `/api/files/xxx`
- 兼容旧数据和新数据

### 效果
- ✅ 歌词文件可以正常加载
- ✅ 音频文件可以正常播放
- ✅ 图片文件可以正常显示
- ✅ 提供更好的错误信息
- ✅ 向后兼容旧数据

部署后，歌词加载问题应该就能解决了！🚀
