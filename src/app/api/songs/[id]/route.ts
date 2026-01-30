import { NextRequest, NextResponse } from 'next/server';
import { songManager } from '@/storage/database';
import type { UpdateSong } from '@/storage/database';

// GET /api/songs/[id] - 获取歌曲详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const song = await songManager.getSongById(id);

    if (!song) {
      return NextResponse.json(
        { error: '歌曲不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ song });
  } catch (error) {
    console.error('获取歌曲详情失败:', error);
    return NextResponse.json(
      { error: '获取歌曲详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/songs/[id] - 更新歌曲
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: UpdateSong = {
      albumId: body.albumId,
      title: body.title,
      duration: body.duration,
      audioUrl: body.audioUrl,
      lyricsUrl: body.lyricsUrl,
    };

    const song = await songManager.updateSong(id, updateData);

    if (!song) {
      return NextResponse.json(
        { error: '歌曲不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ song });
  } catch (error) {
    console.error('更新歌曲失败:', error);
    return NextResponse.json(
      { error: '更新歌曲失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/songs/[id] - 删除歌曲
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await songManager.deleteSong(id);

    if (!success) {
      return NextResponse.json(
        { error: '歌曲不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除歌曲失败:', error);
    return NextResponse.json(
      { error: '删除歌曲失败' },
      { status: 500 }
    );
  }
}
