import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSync } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload] 开始处理文件上传请求');

    // 1. 鉴权检查
    const authError = requireAuthSync(request);
    if (authError) {
      console.error('[Upload] 未授权访问');
      return authError;
    }

    console.log('[Upload] 鉴权通过');

    // 2. 处理文件上传
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('[Upload] 收到文件:', {
      name: file?.name,
      size: file?.size,
      type: file?.type
    });

    if (!file) {
      console.error('[Upload] 没有文件');
      return NextResponse.json(
        { error: '没有文件' },
        { status: 400 }
      );
    }

    // 3. 文件类型验证
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain', // 用于 LRC 文件
    ];

    const isAllowedType = allowedTypes.includes(file.type) || file.name.endsWith('.lrc');
    console.log('[Upload] 文件类型检查:', file.type, isAllowedType ? '通过' : '不通过');

    if (!isAllowedType) {
      console.error('[Upload] 不支持的文件类型:', file.type);
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 4. 文件大小验证（50MB 限制）
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.error('[Upload] 文件大小超过限制:', file.size, 'bytes');
      return NextResponse.json(
        { error: '文件大小超过限制（最大 50MB）' },
        { status: 400 }
      );
    }

    // 5. 检测是否为 Serverless 环境
    const fs = require('fs');
    const path = require('path');

    // 尝试使用临时目录（Serverless 兼容）
    let uploadsDir: string;

    // 优先尝试 public/uploads
    try {
      uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        console.log('[Upload] public/uploads 不存在，尝试创建...');
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      console.log('[Upload] 使用 public/uploads 目录');
    } catch (error) {
      console.warn('[Upload] public/uploads 创建失败，尝试使用临时目录:', error);
      // Serverless 环境使用临时目录
      uploadsDir = path.join(require('os').tmpdir(), 'music-uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      console.log('[Upload] 使用临时目录:', uploadsDir);
    }

    // 6. 生成文件名：时间戳-原文件名
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    console.log('[Upload] 生成文件名:', fileName);

    // 7. 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('[Upload] 文件读取成功，大小:', buffer.length, 'bytes');

    // 8. 保存文件
    const filePath = path.join(uploadsDir, fileName);
    console.log('[Upload] 正在保存文件到:', filePath);

    try {
      fs.writeFileSync(filePath, buffer);
      console.log('[Upload] 文件保存成功');

      // 检查是否使用临时目录
      const isTempDir = !uploadsDir.includes('public');
      if (isTempDir) {
        console.warn('[Upload] ⚠️ 使用临时目录保存文件，Serverless 环境无法持久化存储！');
        console.warn('[Upload] 文件将在下次请求后失效');
      }
    } catch (writeError) {
      console.error('[Upload] 文件保存失败:', writeError);
      return NextResponse.json(
        { error: '文件保存失败：' + (writeError as Error).message },
        { status: 500 }
      );
    }

    // 9. 返回访问 URL
    // Serverless 环境返回 base64 数据（临时解决方案）
    if (!uploadsDir.includes('public')) {
      console.log('[Upload] Serverless 环境，返回 base64 数据');
      const base64 = buffer.toString('base64');

      return NextResponse.json({
        success: true,
        isTemporary: true,
        fileName: fileName,
        size: file.size,
        type: file.type,
        // 对于图片，返回 data URL
        dataUrl: file.type.startsWith('image/')
          ? `data:${file.type};base64,${base64}`
          : undefined,
        // 对于音频和歌词，提示需要对象存储
        warning: 'Serverless 环境不支持文件持久化，请配置对象存储'
      });
    } else {
      // 本地环境返回 URL
      const fileUrl = `/uploads/${fileName}`;
      console.log('[Upload] 上传成功，URL:', fileUrl);

      return NextResponse.json({
        success: true,
        url: fileUrl,
        fileName: fileName,
        size: file.size,
        type: file.type
      });
    }
  } catch (error) {
    console.error('[Upload] 文件上传失败（未捕获的错误）:', error);
    return NextResponse.json(
      { error: '文件上传失败：' + (error as Error).message },
      { status: 500 }
    );
  }
}
