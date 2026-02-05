import {
  sqliteTable,
  text,
  integer,
  index,
} from "drizzle-orm/sqlite-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// 专辑表
export const albums = sqliteTable(
  "albums",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => globalThis.crypto.randomUUID()),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    year: text("year"),
    coverUrl: text("cover_url"),
    createdAt: integer("created_at", { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: 'timestamp' }),
  },
  (table) => ({
    titleIdx: index("albums_title_idx").on(table.title),
  })
);

// 歌曲表
export const songs = sqliteTable(
  "songs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => globalThis.crypto.randomUUID()),
    albumId: text("album_id").notNull(),
    title: text("title").notNull(),
    duration: text("duration").notNull(),
    audioUrl: text("audio_url").notNull(),
    lyricsUrl: text("lyrics_url"),
    createdAt: integer("created_at", { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: 'timestamp' }),
  },
  (table) => ({
    albumIdIdx: index("songs_album_id_idx").on(table.albumId),
  })
);

// 定义关系
export const albumsRelations = relations(albums, ({ many }) => ({
  songs: many(songs),
}));

export const songsRelations = relations(songs, ({ one }) => ({
  album: one(albums, {
    fields: [songs.albumId],
    references: [albums.id],
  }),
}));

// 使用 createSchemaFactory 配置 date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// Albums Zod schemas
export const insertAlbumSchema = createCoercedInsertSchema(albums).pick({
  title: true,
  artist: true,
  year: true,
  coverUrl: true,
});

export const updateAlbumSchema = createCoercedInsertSchema(albums)
  .pick({
    title: true,
    artist: true,
    year: true,
    coverUrl: true,
  })
  .partial();

// Songs Zod schemas
export const insertSongSchema = createCoercedInsertSchema(songs).pick({
  albumId: true,
  title: true,
  duration: true,
  audioUrl: true,
  lyricsUrl: true,
});

export const updateSongSchema = createCoercedInsertSchema(songs)
  .pick({
    albumId: true,
    title: true,
    duration: true,
    audioUrl: true,
    lyricsUrl: true,
  })
  .partial();

// TypeScript types
export type Album = typeof albums.$inferSelect;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;
export type UpdateAlbum = z.infer<typeof updateAlbumSchema>;

export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type UpdateSong = z.infer<typeof updateSongSchema>;
