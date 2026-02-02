import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

/**
 * API 路由：提供文件下载（歌词、音频等）
 * 用途：提供上传文件的访问接口
 * 路径：/api/files/[filename]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // 安全检查：防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: '非法文件名' },
        { status: 400 }
      );
    }

    // 构建文件路径
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, filename);

    console.log('[File API] 请求文件:', filename);
    console.log('[File API] 文件路径:', filePath);

    // 检查文件是否存在
    if (!existsSync(filePath)) {
      console.error('[File API] 文件不存在:', filePath);
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    // 读取文件内容
    const fileBuffer = await readFile(filePath);
    console.log('[File API] 文件读取成功，大小:', fileBuffer.length, 'bytes');

    // 根据 URL 扩展名确定文件类型
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.lrc': 'text/plain; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8',
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // 缓存一年
      },
    });
  } catch (error) {
    console.error('[File API] 文件读取失败:', error);
    return NextResponse.json(
      { error: '文件读取失败：' + (error as Error).message },
      { status: 500 }
    );
  }
}
