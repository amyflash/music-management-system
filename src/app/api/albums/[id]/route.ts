import { NextRequest, NextResponse } from 'next/server';
import { albumManager } from '@/storage/database';
import type { UpdateAlbum } from '@/storage/database';

// GET /api/albums/[id] - 获取专辑详情（包含歌曲）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const album = await albumManager.getAlbumWithSongs(id);

    if (!album) {
      return NextResponse.json(
        { error: '专辑不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ album });
  } catch (error) {
    console.error('获取专辑详情失败:', error);
    return NextResponse.json(
      { error: '获取专辑详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/albums/[id] - 更新专辑
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: UpdateAlbum = {
      title: body.title,
      artist: body.artist,
      year: body.year,
      coverUrl: body.coverUrl,
    };

    const album = await albumManager.updateAlbum(id, updateData);

    if (!album) {
      return NextResponse.json(
        { error: '专辑不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ album });
  } catch (error) {
    console.error('更新专辑失败:', error);
    return NextResponse.json(
      { error: '更新专辑失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/albums/[id] - 删除专辑（同时删除关联的歌曲）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await albumManager.deleteAlbum(id);

    if (!success) {
      return NextResponse.json(
        { error: '专辑不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除专辑失败:', error);
    return NextResponse.json(
      { error: '删除专辑失败' },
      { status: 500 }
    );
  }
}
