import { NextRequest, NextResponse } from 'next/server';
import { songManager } from '@/storage/database';
import type { InsertSong } from '@/storage/database';

// GET /api/songs - 获取所有歌曲
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const albumId = searchParams.get('albumId') || '';
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');

    const songs = await songManager.getSongs({
      search,
      albumId,
      skip,
      limit,
    });
    return NextResponse.json({ songs });
  } catch (error) {
    console.error('获取歌曲失败:', error);
    return NextResponse.json(
      { error: '获取歌曲失败' },
      { status: 500 }
    );
  }
}

// POST /api/songs - 创建歌曲
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const songData: InsertSong = {
      albumId: body.albumId,
      title: body.title,
      duration: body.duration,
      audioUrl: body.audioUrl,
      lyricsUrl: body.lyricsUrl,
    };

    const song = await songManager.createSong(songData);
    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    console.error('创建歌曲失败:', error);
    return NextResponse.json(
      { error: '创建歌曲失败' },
      { status: 500 }
    );
  }
}
