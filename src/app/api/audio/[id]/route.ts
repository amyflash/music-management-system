import { NextRequest, NextResponse } from 'next/server';
import { getSongById } from '@/lib/musicData';

export const runtime = 'nodejs'; // 使用 Node.js runtime

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const songId = resolvedParams.id;

    console.log('[Audio API] Request for song ID:', songId);

    // 1. 获取歌曲信息
    const song = getSongById(songId);

    if (!song) {
      console.log('[Audio API] Song not found:', songId);
      return NextResponse.json({ error: '歌曲不存在' }, { status: 404 });
    }

    console.log('[Audio API] Fetching audio from:', song.audioUrl);

    // 2. 检查 Referer（防止直接访问）
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // 允许同源请求
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== host) {
          console.log('[Audio API] Hotlink blocked from:', refererUrl.host);
          return NextResponse.json(
            { error: '禁止盗链' },
            {
              status: 403,
              headers: {
                'Access-Control-Allow-Origin': `https://${host}`,
              },
            }
          );
        }
      } catch (error) {
        console.log('[Audio API] Invalid referer:', referer);
        return NextResponse.json({ error: '无效请求' }, { status: 400 });
      }
    }

    // 3. 获取音频文件
    const audioResponse = await fetch(song.audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!audioResponse.ok) {
      console.log('[Audio API] Audio fetch failed:', audioResponse.status);
      return NextResponse.json(
        { error: '音频文件获取失败' },
        { status: audioResponse.status }
      );
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    console.log('[Audio API] Audio fetched successfully, size:', audioBuffer.byteLength);

    // 4. 返回音频流，添加防盗链头
    const response = new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        // 添加缓存控制
        'Cache-Control': 'public, max-age=3600',
        // 防止在页面中直接嵌入
        'X-Content-Type-Options': 'nosniff',
        // 仅允许同源请求
        'Access-Control-Allow-Origin': `https://${host}`,
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Range',
      },
    });

    return response;
  } catch (error) {
    console.error('[Audio API] Error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
