import { eq, like } from "drizzle-orm";
import { getDb } from "./db";
import {
  albums,
  insertAlbumSchema,
  updateAlbumSchema,
  songs,
} from "./shared/schema";
import type { Album, InsertAlbum, UpdateAlbum, Song } from "./shared/schema";

export class AlbumManager {
  async createAlbum(data: InsertAlbum): Promise<Album> {
    const db = await getDb();
    const validated = insertAlbumSchema.parse(data);
    const [album] = await db.insert(albums).values(validated).returning();
    return album;
  }

  async getAlbums(options: {
    skip?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<Album[]> {
    const { skip = 0, limit = 100, search = "" } = options;
    const db = await getDb();

    if (search) {
      return db
        .select()
        .from(albums)
        .where(like(albums.title, `%${search}%`))
        .limit(limit)
        .offset(skip)
        .orderBy(albums.createdAt);
    }

    return db
      .select()
      .from(albums)
      .limit(limit)
      .offset(skip)
      .orderBy(albums.createdAt);
  }

  async getAlbumById(id: string): Promise<Album | null> {
    const db = await getDb();
    const [album] = await db.select().from(albums).where(eq(albums.id, id));
    return album || null;
  }

  async getAlbumWithSongs(id: string): Promise<(Album & { songs: Song[] }) | null> {
    const db = await getDb();
    const [album] = await db.select().from(albums).where(eq(albums.id, id));

    if (!album) return null;

    const albumSongs = await db
      .select()
      .from(songs)
      .where(eq(songs.albumId, id))
      .orderBy(songs.createdAt);

    return {
      ...album,
      songs: albumSongs,
    };
  }

  async updateAlbum(id: string, data: UpdateAlbum): Promise<Album | null> {
    const db = await getDb();
    const validated = updateAlbumSchema.parse(data);
    const [album] = await db
      .update(albums)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(albums.id, id))
      .returning();
    return album || null;
  }

  async deleteAlbum(id: string): Promise<boolean> {
    const db = await getDb();
    // 先删除关联的歌曲
    await db.delete(songs).where(eq(songs.albumId, id));
    // 再删除专辑
    const result = await db.delete(albums).where(eq(albums.id, id));
    // @ts-expect-error libsql client returns different result format
    return (result.changes ?? 0) > 0;
  }
}

export const albumManager = new AlbumManager();
