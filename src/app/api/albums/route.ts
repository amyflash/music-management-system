import { NextRequest, NextResponse } from 'next/server';
import { albumManager } from '@/storage/database';
import type { InsertAlbum } from '@/storage/database';

// GET /api/albums - 获取所有专辑
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');

    const albums = await albumManager.getAlbums({ search, skip, limit });
    return NextResponse.json({ albums });
  } catch (error) {
    console.error('获取专辑失败:', error);
    return NextResponse.json(
      { error: '获取专辑失败' },
      { status: 500 }
    );
  }
}

// POST /api/albums - 创建专辑
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const albumData: InsertAlbum = {
      title: body.title,
      artist: body.artist,
      year: body.year,
      coverUrl: body.coverUrl,
    };

    const album = await albumManager.createAlbum(albumData);
    return NextResponse.json({ album }, { status: 201 });
  } catch (error) {
    console.error('创建专辑失败:', error);
    return NextResponse.json(
      { error: '创建专辑失败' },
      { status: 500 }
    );
  }
}
