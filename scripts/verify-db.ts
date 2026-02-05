import { createClient } from '@libsql/client';
import path from 'path';

async function verifyDatabase() {
  const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH ||
                         path.join(process.cwd(), 'data', 'music.db');

  console.log('📂 数据库文件:', SQLITE_DB_PATH);

  const client = createClient({ url: `file:${SQLITE_DB_PATH.replace(/\\/g, '/')}` });

  try {
    // 获取所有表
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('\n📋 数据库表:');
    for (const row of tables.rows as any[]) {
      console.log(`  - ${row.name}`);

      // 获取表结构
      const schema = await client.execute(`PRAGMA table_info(${row.name})`);
      console.log('    字段:');
      for (const col of schema.rows as any[]) {
        const type = col.type;
        const required = col.notnull ? ' NOT NULL' : '';
        const pk = col.pk ? ' PK' : '';
        const dflt = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
        console.log(`      ${col.name}: ${type}${required}${pk}${dflt}`);
      }
    }

    // 获取所有索引
    const indexes = await client.execute("SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY tbl_name, name");
    console.log('\n📋 数据库索引:');
    for (const row of indexes.rows as any[]) {
      if (!row.name.startsWith('sqlite_autoindex')) {
        console.log(`  - ${row.name} (表: ${row.tbl_name})`);
      }
    }

    client.close();
  } catch (error) {
    console.error('❌ 验证失败:', error);
    client.close();
    process.exit(1);
  }
}

verifyDatabase();
