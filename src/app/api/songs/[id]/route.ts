import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/songs/[id] - 获取歌曲详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
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
      WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
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
      song: result.rows[0],
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { albumId, title, duration, audioUrl, lyricsUrl } = body;

    // 检查歌曲是否存在
    const checkResult = await pool.query(
      'SELECT id FROM songs WHERE id = $1',
      [id]
    );

    if (checkResult.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '歌曲不存在',
        },
        { status: 404 }
      );
    }

    // 构建更新语句
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (albumId !== undefined) {
      updates.push(`album_id = $${paramIndex++}`);
      values.push(albumId);
    }
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (duration !== undefined) {
      updates.push(`duration = $${paramIndex++}`);
      values.push(duration);
    }
    if (audioUrl !== undefined) {
      updates.push(`audio_url = $${paramIndex++}`);
      values.push(audioUrl);
    }
    if (lyricsUrl !== undefined) {
      updates.push(`lyrics_url = $${paramIndex++}`);
      values.push(lyricsUrl);
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
      UPDATE songs
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING
        id,
        album_id as "albumId",
        title,
        duration,
        audio_url as "audioUrl",
        lyrics_url as "lyricsUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      song: result.rows[0],
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 检查歌曲是否存在
    const checkResult = await pool.query(
      'SELECT id FROM songs WHERE id = $1',
      [id]
    );

    if (checkResult.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '歌曲不存在',
        },
        { status: 404 }
      );
    }

    // 删除歌曲
    await pool.query('DELETE FROM songs WHERE id = $1', [id]);

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
