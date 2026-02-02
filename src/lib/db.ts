import { Pool } from 'pg';

// 延迟创建数据库连接池（避免构建时连接）
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000, // 空闲连接超时
      connectionTimeoutMillis: 2000, // 连接超时
    });

    // 测试数据库连接
    pool.on('connect', () => {
      console.log('✅ 数据库连接成功');
    });

    pool.on('error', (err) => {
      console.error('❌ 数据库连接错误:', err);
    });
  }
  return pool;
}

export default getPool;
