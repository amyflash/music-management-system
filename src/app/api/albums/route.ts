import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';
import { requireAuthSync } from '@/lib/auth';

// GET /api/albums - 获取所有专辑
export async function GET(request: NextRequest) {
  // 检查认证
  const authError = requireAuthSync(request);
  if (authError) return authError;

  try {
    const result = await getPool().query(
      `SELECT
        a.id,
        a.title,
        a.artist,
        a.year,
        a.cover_url as "coverUrl",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt",
        COALESCE(COUNT(s.id), 0) as "songCount"
      FROM albums a
      LEFT JOIN songs s ON a.id = s.album_id
      GROUP BY a.id, a.title, a.artist, a.year, a.cover_url, a.created_at, a.updated_at
      ORDER BY a.created_at DESC`
    );

    // 将 songCount 添加到每个专辑对象中
    const albums = result.rows.map(row => ({
      ...row,
      songs: Array(parseInt(row.songCount)).fill(null), // 为保持兼容性，创建占位符数组
    }));

    return NextResponse.json({
      success: true,
      albums: albums,
      count: result.rowCount,
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
  const authError = requireAuthSync(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, artist, year, coverUrl } = body;

    // 验证必填字段
    if (!title || !artist || !year) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必填字段：title, artist, year',
        },
        { status: 400 }
      );
    }

    const result = await getPool().query(
      `INSERT INTO albums (title, artist, year, cover_url)
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         title,
         artist,
         year,
         cover_url as "coverUrl",
         created_at as "createdAt",
         updated_at as "updatedAt"`,
      [title, artist, year, coverUrl || null]
    );

    return NextResponse.json({
      success: true,
      album: result.rows[0],
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
