import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// 专辑表
export const albums = pgTable(
  "albums",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 255 }).notNull(),
    artist: varchar("artist", { length: 255 }).notNull(),
    year: varchar("year", { length: 10 }).notNull(),
    coverUrl: varchar("cover_url", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    titleIdx: index("albums_title_idx").on(table.title),
  })
);

// 歌曲表
export const songs = pgTable(
  "songs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    albumId: varchar("album_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    duration: varchar("duration", { length: 10 }).notNull(),
    audioUrl: varchar("audio_url", { length: 500 }).notNull(),
    lyricsUrl: varchar("lyrics_url", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
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
