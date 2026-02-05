import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { SongManager } from '@/storage/database/songManager';
import { AlbumManager } from '@/storage/database/albumManager';

// GET /api/songs - 获取所有歌曲（可选按专辑ID过滤）
export async function GET(request: NextRequest) {
  // 检查认证
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    const songManager = new SongManager();

    let options: any = {};
    if (albumId) {
      options.albumId = albumId;
    }

    const songs = await songManager.getSongs(options);
    const count = songs.length;

    return NextResponse.json({
      success: true,
      songs,
      count,
    });
  } catch (error) {
    console.error('获取歌曲列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取歌曲列表失败',
      },
      { status: 500 }
    );
  }
}

// POST /api/songs - 创建歌曲
export async function POST(request: NextRequest) {
  // 检查认证
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { albumId, title, duration, audioUrl, lyricsUrl } = body;

    // 验证必填字段
    if (!albumId || !title || !duration || !audioUrl) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必填字段：albumId, title, duration, audioUrl',
        },
        { status: 400 }
      );
    }

    const songManager = new SongManager();
    const albumManager = new AlbumManager();

    // 检查专辑是否存在
    const album = await albumManager.getAlbumById(albumId);
    if (!album) {
      return NextResponse.json(
        {
          success: false,
          error: '指定的专辑不存在',
        },
        { status: 404 }
      );
    }

    const song = await songManager.createSong({
      albumId,
      title,
      duration,
      audioUrl,
      lyricsUrl: lyricsUrl || undefined,
    });

    return NextResponse.json({
      success: true,
      song,
    });
  } catch (error) {
    console.error('创建歌曲失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建歌曲失败',
      },
      { status: 500 }
    );
  }
}
