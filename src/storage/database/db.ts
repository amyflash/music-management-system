import { drizzle } from 'drizzle-orm/libsql';
import { createClient, type Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';

// 导入schema
import * as schema from './shared/schema';

// 数据库文件位置
const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH ||
                       path.join(process.cwd(), 'data', 'music.db');

// 创建数据库目录（如果不存在）
const dbDir = path.dirname(SQLITE_DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建 libsql 客户端
let db: ReturnType<typeof drizzle> | null = null;
let tablesInitialized = false;

// 获取数据库连接
export async function getDb() {
  if (!db) {
    // 创建 libsql 客户端（使用本地文件，URL 格式）
    const dbUrl = `file:${SQLITE_DB_PATH.replace(/\\/g, '/')}`;
    const client = createClient({
      url: dbUrl,
    });

    // 创建Drizzle实例
    db = drizzle(client, { schema });

    // 初始化数据库表
    await initTables(client);

    console.log('✅ SQLite数据库连接已建立');
  }

  return db;
}

// 初始化表结构
async function initTables(client: Client) {
  if (tablesInitialized) return;

  try {
    console.log('🔄 检查数据库表...');

    // 检查albums表是否存在
    const result = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='albums'
    `);

    if (result.rows.length === 0) {
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

    tablesInitialized = true;
  } catch (error) {
    console.error('❌ 初始化数据库表失败:', error);
    throw error;
  }
}

// 清理连接（用于测试或优雅关闭）
export async function closeDb() {
  if (db) {
    db = null;
    tablesInitialized = false;
    console.log('✅ 数据库连接已关闭');
  }
}