import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET /api/songs - 获取所有歌曲（可选按专辑ID过滤）
export async function GET(request: NextRequest) {
  // 检查认证
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    let query = `
      SELECT
        id,
        album_id as "albumId",
        title,
        duration,
        audio_url as "audioUrl",
        lyrics_url as "lyricsUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM songs
    `;
    const params: any[] = [];

    if (albumId) {
      query += ' WHERE album_id = $1';
      params.push(albumId);
    }

    query += ' ORDER BY created_at ASC';

    const result = await getPool().query(query, params);

    return NextResponse.json({
      success: true,
      songs: result.rows,
      count: result.rowCount,
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

    // 检查专辑是否存在
    const albumCheck = await getPool().query(
      'SELECT id FROM albums WHERE id = $1',
      [albumId]
    );

    if (albumCheck.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '指定的专辑不存在',
        },
        { status: 404 }
      );
    }

    const result = await getPool().query(
      `INSERT INTO songs (album_id, title, duration, audio_url, lyrics_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id,
         album_id as "albumId",
         title,
         duration,
         audio_url as "audioUrl",
         lyrics_url as "lyricsUrl",
         created_at as "createdAt",
         updated_at as "updatedAt"`,
      [albumId, title, duration, audioUrl, lyricsUrl || null]
    );

    return NextResponse.json({
      success: true,
      song: result.rows[0],
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
