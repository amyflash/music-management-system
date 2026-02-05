import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { SongManager } from '@/storage/database/songManager';

// GET /api/songs/[id] - 获取歌曲详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 检查认证
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const songManager = new SongManager();
    const song = await songManager.getSongById(id);

    if (!song) {
      return NextResponse.json(
        {
          success: false,
          error: '歌曲不存在',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      song,
    });
  } catch (error) {
    console.error('获取歌曲详情失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取歌曲详情失败',
      },
      { status: 500 }
    );
  }
}

// PUT /api/songs/[id] - 更新歌曲
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
    const { albumId, title, duration, audioUrl, lyricsUrl } = body;

    const songManager = new SongManager();

    // 先检查歌曲是否存在
    const existingSong = await songManager.getSongById(id);
    if (!existingSong) {
      return NextResponse.json(
        {
          success: false,
          error: '歌曲不存在',
        },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData: any = {};
    if (albumId !== undefined) updateData.albumId = albumId;
    if (title !== undefined) updateData.title = title;
    if (duration !== undefined) updateData.duration = duration;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
    if (lyricsUrl !== undefined) updateData.lyricsUrl = lyricsUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '没有提供要更新的字段',
        },
        { status: 400 }
      );
    }

    const updatedSong = await songManager.updateSong(id, updateData);

    return NextResponse.json({
      success: true,
      song: updatedSong,
    });
  } catch (error) {
    console.error('更新歌曲失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新歌曲失败',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/songs/[id] - 删除歌曲
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 检查认证
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const songManager = new SongManager();

    // 先检查歌曲是否存在
    const existingSong = await songManager.getSongById(id);
    if (!existingSong) {
      return NextResponse.json(
        {
          success: false,
          error: '歌曲不存在',
        },
        { status: 404 }
      );
    }

    // 删除歌曲
    await songManager.deleteSong(id);

    return NextResponse.json({
      success: true,
      message: '歌曲删除成功',
    });
  } catch (error) {
    console.error('删除歌曲失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除歌曲失败',
      },
      { status: 500 }
    );
  }
}
