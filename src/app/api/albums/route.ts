import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';

// GET /api/albums - 获取所有专辑
export async function GET() {
  try {
    const result = await getPool().query(
      `SELECT
        id,
        title,
        artist,
        year,
        cover_url as "coverUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM albums
      ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      albums: result.rows,
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
