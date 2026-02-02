import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/albums/[id] - 获取专辑详情（包含歌曲）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 获取专辑信息
    const albumResult = await pool.query(
      `SELECT
        id,
        title,
        artist,
        year,
        cover_url as "coverUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM albums
      WHERE id = $1`,
      [id]
    );

    if (albumResult.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '专辑不存在',
        },
        { status: 404 }
      );
    }

    // 获取专辑的歌曲
    const songsResult = await pool.query(
      `SELECT
        id,
        album_id as "albumId",
        title,
        duration,
        audio_url as "audioUrl",
        lyrics_url as "lyricsUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM songs
      WHERE album_id = $1
      ORDER BY created_at ASC`,
      [id]
    );

    const album = {
      ...albumResult.rows[0],
      songs: songsResult.rows,
    };

    return NextResponse.json({
      success: true,
      album,
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, artist, year, coverUrl } = body;

    // 检查专辑是否存在
    const checkResult = await pool.query(
      'SELECT id FROM albums WHERE id = $1',
      [id]
    );

    if (checkResult.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '专辑不存在',
        },
        { status: 404 }
      );
    }

    // 构建更新语句
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (artist !== undefined) {
      updates.push(`artist = $${paramIndex++}`);
      values.push(artist);
    }
    if (year !== undefined) {
      updates.push(`year = $${paramIndex++}`);
      values.push(year);
    }
    if (coverUrl !== undefined) {
      updates.push(`cover_url = $${paramIndex++}`);
      values.push(coverUrl);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '没有提供要更新的字段',
        },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE albums
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING
        id,
        title,
        artist,
        year,
        cover_url as "coverUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      album: result.rows[0],
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 检查专辑是否存在
    const checkResult = await pool.query(
      'SELECT id FROM albums WHERE id = $1',
      [id]
    );

    if (checkResult.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '专辑不存在',
        },
        { status: 404 }
      );
    }

    // 删除专辑（由于有外键约束，会级联删除歌曲）
    await pool.query('DELETE FROM albums WHERE id = $1', [id]);

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
