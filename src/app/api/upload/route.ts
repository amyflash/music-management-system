import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 写死的用户信息
const USER = {
  username: 'harrietlq',
  password: '1q2w3e4r',
  name: '音乐管理员'
};

// 验证 token
function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [username] = decoded.split('-');
    return username === USER.username;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. 鉴权检查
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // 去掉 'Bearer ' 前缀
    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: '无效的 token' },
        { status: 401 }
      );
    }

    // 2. 处理文件上传
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
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

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.lrc')) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 4. 文件大小验证（50MB 限制）
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超过限制（最大 50MB）' },
        { status: 400 }
      );
    }

    // 5. 生成文件名：时间戳-原文件名
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;

    // 6. 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 7. 确保目录存在
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 8. 保存文件
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // 9. 返回访问 URL
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
}
