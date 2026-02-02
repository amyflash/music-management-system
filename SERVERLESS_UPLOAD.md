# Serverless 环境文件上传解决方案

## 问题诊断

你的部署环境是 **Serverless 环境**（云平台），返回 500 错误是因为：

❌ **Serverless 环境不支持文件系统写入**
- 每次请求都是独立的容器实例
- 文件写入后会在请求结束时丢失
- 无法持久化存储上传的文件

## 当前状态

✅ **已修复为临时解决方案**
- 上传 API 现在可以在 Serverless 环境运行
- 图片会返回 base64 data URL（可以直接显示）
- 音频和歌词会提示需要配置对象存储

⚠️ **限制**
- 音频文件无法持久化（播放后会丢失）
- 每次部署后所有文件都会丢失
- 不适合生产环境

---

## 永久解决方案：配置对象存储

### 方案一：使用对象存储服务（推荐）

#### 1. 阿里云 OSS

**步骤：**
1. 注册阿里云账号：https://www.aliyun.com
2. 开通 OSS 服务
3. 创建 Bucket
4. 获取 AccessKey ID 和 AccessKey Secret

**配置环境变量：**
```env
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_BUCKET=your-bucket-name
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
```

**修改上传 API：**
```typescript
import OSS from 'ali-oss';

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  endpoint: process.env.OSS_ENDPOINT,
});

async function uploadToOSS(file: File, fileName: string) {
  const result = await client.put(`uploads/${fileName}`, file);
  return result.url;
}
```

#### 2. 腾讯云 COS

**步骤：**
1. 注册腾讯云账号：https://cloud.tencent.com
2. 开通 COS 服务
3. 创建存储桶
4. 获取 SecretId 和 SecretKey

**配置环境变量：**
```env
COS_REGION=ap-guangzhou
COS_SECRET_ID=your-secret-id
COS_SECRET_KEY=your-secret-key
COS_BUCKET=your-bucket-name
```

**修改上传 API：**
```typescript
import COS from 'cos-nodejs-sdk-v5';

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

async function uploadToCOS(file: File, fileName: string) {
  const result = await cos.putObject({
    Bucket: process.env.COS_BUCKET,
    Region: process.env.COS_REGION,
    Key: `uploads/${fileName}`,
    Body: file,
  });
  return `https://${result.Location}`;
}
```

#### 3. AWS S3

**步骤：**
1. 注册 AWS 账号：https://aws.amazon.com
2. 创建 S3 Bucket
3. 创建 IAM 用户并获取访问密钥

**配置环境变量：**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=your-bucket-name
```

**修改上传 API：**
```typescript
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

### 方案二：使用第三方图片/文件服务

#### Cloudinary（推荐用于图片）

```bash
pnpm add cloudinary
```

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file: File) {
  const result = await cloudinary.uploader.upload(
    await file.arrayBuffer().then(buffer => `data:${file.type};base64,${buffer.toString('base64')}`),
    { folder: 'music-uploads' }
  );
  return result.secure_url;
}
```

#### ImgBB（免费）

```typescript
async function uploadToImgBB(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_API_KEY', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.data.url;
}
```

---

## 快速测试（临时方案）

如果你想快速测试功能，可以使用免费的第三方服务：

### 1. 上传封面图片（临时）

使用 ImgBB（免费，10MB 限制）：

```typescript
async function uploadCoverImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  return result.data.url;
}
```

**获取 API Key：**
1. 访问 https://imgbb.com
2. 注册账号
3. 获取 API Key：https://api.imgbb.com/

### 2. 上传音频文件（临时方案）

由于音频文件较大，建议：

- **小文件（<5MB）**：使用临时 base64 存储
- **大文件**：必须使用对象存储

---

## 推荐方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 阿里云 OSS | 国内访问快，价格低 | 需要配置 | 国内生产环境 |
| 腾讯云 COS | 国内访问快，集成方便 | 需要配置 | 国内生产环境 |
| AWS S3 | 全球访问，稳定 | 价格较高 | 国际生产环境 |
| Cloudinary | 图片优化，CDN加速 | 主要用于图片 | 图片存储 |
| ImgBB | 免费，简单 | 10MB 限制 | 测试/小项目 |

---

## 实施步骤（以阿里云 OSS 为例）

### 1. 安装依赖

```bash
pnpm add ali-oss
```

### 2. 配置环境变量

在部署平台（如 Vercel）添加环境变量：

```
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_BUCKET=your-bucket-name
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
```

### 3. 修改上传 API

更新 `src/app/api/upload/route.ts`：

```typescript
import OSS from 'ali-oss';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const LOGGED_IN_TOKEN = 'LOGGED_IN';

// 初始化 OSS 客户端
const ossClient = process.env.OSS_ACCESS_KEY_ID
  ? new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
      endpoint: process.env.OSS_ENDPOINT,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    // ... 鉴权代码 ...

    const formData = await request.formData();
    const file = formData.get('file') as File;

    // ... 验证代码 ...

    // 生成文件名
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;

    // 上传到 OSS
    if (ossClient) {
      const result = await ossClient.put(`uploads/${fileName}`, file);
      return NextResponse.json({
        success: true,
        url: result.url,
        fileName: fileName,
        size: file.size,
        type: file.type
      });
    } else {
      // 降级方案：使用本地存储（仅在开发环境）
      return NextResponse.json({
        error: '未配置对象存储，请在环境变量中配置 OSS 凭证',
        status: 500
      });
    }
  } catch (error) {
    console.error('[Upload] 上传失败:', error);
    return NextResponse.json(
      { error: '上传失败：' + (error as Error).message },
      { status: 500 }
    );
  }
}
```

### 4. 部署

```bash
git add .
git commit -m "feat: 添加阿里云 OSS 文件上传"
git push origin main
```

---

## 费用估算（阿里云 OSS）

- **存储费用**：¥0.12/GB/月
- **流量费用**：
  - 外网流量：¥0.50/GB
  - CDN 加速：¥0.24/GB

**示例：**
- 10GB 存储：¥1.2/月
- 100GB 流量：¥50/月
- **总计约 ¥50-100/月**

---

## 下一步

### 立即行动：

1. **选择对象存储服务**（推荐阿里云 OSS）
2. **获取 API 凭证**
3. **配置环境变量**
4. **更新上传 API**
5. **测试上传功能**

### 联系支持

如果需要帮助配置对象存储，请提供：
- 你选择的存储服务（阿里云/腾讯云/AWS）
- 遇到的具体问题
- 错误日志
