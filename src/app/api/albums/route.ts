import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { AlbumManager } from '@/storage/database/albumManager';
import { SongManager } from '@/storage/database/songManager';

// GET /api/albums - 获取所有专辑
export async function GET(request: NextRequest) {
  // 检查认证
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const albumManager = new AlbumManager();
    const songManager = new SongManager();

    const albums = await albumManager.getAlbums();

    // 为每个专辑添加歌曲信息
    const albumsWithSongs = await Promise.all(
      albums.map(async (album) => {
        const songs = await songManager.getSongs({ albumId: album.id });
        return {
          ...album,
          songs,
          songCount: songs.length,
        };
      })
    );

    return NextResponse.json({
      success: true,
      albums: albumsWithSongs,
      count: albumsWithSongs.length,
    });
  } catch (error) {
    console.error('获取专辑列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取专辑列表失败',
      },
      { status: 500 }
    );
  }
}

// POST /api/albums - 创建专辑
export async function POST(request: NextRequest) {
  // 检查认证
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, artist, year, coverUrl } = body;

    // 验证必填字段
    if (!title || !artist) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必填字段：title, artist',
        },
        { status: 400 }
      );
    }

    const albumManager = new AlbumManager();
    const album = await albumManager.createAlbum({
      title,
      artist,
      year: year || undefined,
      coverUrl: coverUrl || undefined,
    });

    return NextResponse.json({
      success: true,
      album,
    });
  } catch (error) {
    console.error('创建专辑失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建专辑失败',
      },
      { status: 500 }
    );
  }
}
