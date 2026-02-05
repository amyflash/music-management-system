import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { AlbumManager } from '@/storage/database/albumManager';
import { SongManager } from '@/storage/database/songManager';

// GET /api/albums/[id] - 获取专辑详情（包含歌曲）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 检查认证
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    // 使用AlbumManager获取专辑信息
    const albumManager = new AlbumManager();
    const album = await albumManager.getAlbumById(id);

    if (!album) {
      return NextResponse.json(
        {
          success: false,
          error: '专辑不存在',
        },
        { status: 404 }
      );
    }

    // 使用SongManager获取专辑歌曲
    const songManager = new SongManager();
    const songs = await songManager.getSongs({ albumId: id });

    const albumWithSongs = {
      ...album,
      songs,
    };

    return NextResponse.json({
      success: true,
      album: albumWithSongs,
    });
  } catch (error) {
    console.error('获取专辑详情失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取专辑详情失败',
      },
      { status: 500 }
    );
  }
}

// PUT /api/albums/[id] - 更新专辑
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 检查认证
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, artist, year, coverUrl } = body;

    const albumManager = new AlbumManager();

    // 先检查专辑是否存在
    const existingAlbum = await albumManager.getAlbumById(id);
    if (!existingAlbum) {
      return NextResponse.json(
        {
          success: false,
          error: '专辑不存在',
        },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (artist !== undefined) updateData.artist = artist;
    if (year !== undefined) updateData.year = year;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '没有提供要更新的字段',
        },
        { status: 400 }
      );
    }

    const updatedAlbum = await albumManager.updateAlbum(id, updateData);

    return NextResponse.json({
      success: true,
      album: updatedAlbum,
    });
  } catch (error) {
    console.error('更新专辑失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新专辑失败',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/albums/[id] - 删除专辑
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 检查认证
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    const albumManager = new AlbumManager();

    // 先检查专辑是否存在
    const existingAlbum = await albumManager.getAlbumById(id);
    if (!existingAlbum) {
      return NextResponse.json(
        {
          success: false,
          error: '专辑不存在',
        },
        { status: 404 }
      );
    }

    // 删除专辑（会级联删除歌曲）
    await albumManager.deleteAlbum(id);

    return NextResponse.json({
      success: true,
      message: '专辑删除成功',
    });
  } catch (error) {
    console.error('删除专辑失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除专辑失败',
      },
      { status: 500 }
    );
  }
}
