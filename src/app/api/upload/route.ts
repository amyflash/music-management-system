import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 简单的登录 token（单用户场景）
const LOGGED_IN_TOKEN = 'LOGGED_IN';

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload] 开始处理文件上传请求');

    // 1. 鉴权检查
    const authHeader = request.headers.get('authorization');
    console.log('[Upload] 鉴权检查:', authHeader ? '有 token' : '无 token');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Upload] 未授权访问：缺少或格式错误的 Authorization header');
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // 去掉 'Bearer ' 前缀
    if (token !== LOGGED_IN_TOKEN) {
      console.error('[Upload] Token 验证失败:', token);
      return NextResponse.json(
        { error: '未登录，请先登录' },
        { status: 401 }
      );
    }

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

    // 5. 生成文件名：时间戳-原文件名
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    console.log('[Upload] 生成文件名:', fileName);

    // 6. 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('[Upload] 文件读取成功，大小:', buffer.length, 'bytes');

    // 7. 确保目录存在
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    console.log('[Upload] 上传目录:', uploadsDir);

    // 检查并创建目录
    if (!fs.existsSync(uploadsDir)) {
      console.log('[Upload] 目录不存在，正在创建...');
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('[Upload] 目录创建成功');
      } catch (mkdirError) {
        console.error('[Upload] 目录创建失败:', mkdirError);
        return NextResponse.json(
          { error: '无法创建上传目录，请检查服务器权限' },
          { status: 500 }
        );
      }
    } else {
      console.log('[Upload] 目录已存在');

      // 检查目录权限
      try {
        fs.accessSync(uploadsDir, fs.constants.W_OK);
        console.log('[Upload] 目录权限检查通过');
      } catch (accessError) {
        console.error('[Upload] 目录没有写权限:', accessError);
        return NextResponse.json(
          { error: '上传目录没有写权限，请联系管理员' },
          { status: 500 }
        );
      }
    }

    // 8. 保存文件
    const filePath = path.join(uploadsDir, fileName);
    console.log('[Upload] 正在保存文件到:', filePath);

    try {
      fs.writeFileSync(filePath, buffer);
      console.log('[Upload] 文件保存成功');
    } catch (writeError) {
      console.error('[Upload] 文件保存失败:', writeError);
      return NextResponse.json(
        { error: '文件保存失败，请检查磁盘空间和权限' },
        { status: 500 }
      );
    }

    // 9. 返回访问 URL
    const fileUrl = `/uploads/${fileName}`;
    console.log('[Upload] 上传成功，URL:', fileUrl);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('[Upload] 文件上传失败（未捕获的错误）:', error);
    return NextResponse.json(
      { error: '文件上传失败：' + (error as Error).message },
      { status: 500 }
    );
  }
}
