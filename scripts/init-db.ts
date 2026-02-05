import { createClient, type Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';

async function main() {
  // 数据库文件位置
  const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH ||
                         path.join(process.cwd(), 'data', 'music.db');

  // 创建数据库目录（如果不存在）
  const dbDir = path.dirname(SQLITE_DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log('🔄 初始化数据库...');
  console.log('📂 数据库文件:', SQLITE_DB_PATH);

  // 创建 libsql 客户端
  const dbUrl = `file:${SQLITE_DB_PATH.replace(/\\/g, '/')}`;
  const client: Client = createClient({ url: dbUrl });

  try {
    console.log('🔄 检查数据库表...');

    // 检查albums表是否存在
    const albumsResult = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='albums'
    `);

    if (albumsResult.rows.length === 0) {
      console.log('🔄 创建数据库表...');

      // 创建albums表
      await client.execute(`
        CREATE TABLE albums (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          artist TEXT NOT NULL,
          year TEXT NOT NULL,
          cover_url TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER
        )
      `);

      // 创建songs表
      await client.execute(`
        CREATE TABLE songs (
          id TEXT PRIMARY KEY,
          album_id TEXT NOT NULL,
          title TEXT NOT NULL,
          duration TEXT NOT NULL,
          audio_url TEXT NOT NULL,
          lyrics_url TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER,
          FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
        )
      `);

      console.log('✅ 数据库表创建完成');
    } else {
      console.log('✅ 数据库表已存在');
    }

    // 确保索引存在（无论表是新创建的还是已存在的）
    console.log('🔄 检查并创建索引...');
    await client.execute('CREATE INDEX IF NOT EXISTS albums_title_idx ON albums(title)');
    await client.execute('CREATE INDEX IF NOT EXISTS songs_album_id_idx ON songs(album_id)');
    console.log('✅ 索引已就绪');

    // 验证表结构
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 已创建的表:', tables.rows.map((r: any) => r.name));

    // 检查索引
    const indexes = await client.execute("SELECT name FROM sqlite_master WHERE type='index'");
    console.log('📋 已创建的索引:', indexes.rows.map((r: any) => r.name));

    client.close();
    console.log('🎉 数据库初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    client.close();
    process.exit(1);
  }
}

main();
