-- 初始化数据库脚本
-- 此脚本会在 PostgreSQL 容器首次启动时自动执行

-- 创建扩展（如果需要）
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建专辑表
CREATE TABLE IF NOT EXISTS albums (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    year VARCHAR(10) NOT NULL,
    cover_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建歌曲表
CREATE TABLE IF NOT EXISTS songs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(10) NOT NULL,
    audio_url VARCHAR(500) NOT NULL,
    lyrics_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS albums_title_idx ON albums(title);
CREATE INDEX IF NOT EXISTS songs_album_id_idx ON songs(album_id);

-- 添加外键约束
ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_album_id_fkey;
ALTER TABLE songs ADD CONSTRAINT songs_album_id_fkey
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE;

-- 插入示例数据（可选）
-- INSERT INTO albums (title, artist, year) VALUES
--     ('示例专辑', '示例歌手', '2024');
