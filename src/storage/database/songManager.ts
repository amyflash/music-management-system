import { eq, and, SQL, like } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  songs,
  insertSongSchema,
  updateSongSchema,
} from "./shared/schema";
import type { Song, InsertSong, UpdateSong } from "./shared/schema";

export class SongManager {
  async createSong(data: InsertSong): Promise<Song> {
    const db = await getDb();
    const validated = insertSongSchema.parse(data);
    const [song] = await db.insert(songs).values(validated).returning();
    return song;
  }

  async getSongs(options: {
    skip?: number;
    limit?: number;
    albumId?: string;
    search?: string;
  } = {}): Promise<Song[]> {
    const { skip = 0, limit = 100, albumId, search = "" } = options;
    const db = await getDb();

    if (albumId) {
      if (search) {
        return db
          .select()
          .from(songs)
          .where(
            and(
              eq(songs.albumId, albumId),
              like(songs.title, `%${search}%`)
            )
          )
          .limit(limit)
          .offset(skip)
          .orderBy(songs.createdAt);
      }
      return db
        .select()
        .from(songs)
        .where(eq(songs.albumId, albumId))
        .limit(limit)
        .offset(skip)
        .orderBy(songs.createdAt);
    }

    if (search) {
      return db
        .select()
        .from(songs)
        .where(like(songs.title, `%${search}%`))
        .limit(limit)
        .offset(skip)
        .orderBy(songs.createdAt);
    }

    return db
      .select()
      .from(songs)
      .limit(limit)
      .offset(skip)
      .orderBy(songs.createdAt);
  }

  async getSongById(id: string): Promise<Song | null> {
    const db = await getDb();
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song || null;
  }

  async updateSong(id: string, data: UpdateSong): Promise<Song | null> {
    const db = await getDb();
    const validated = updateSongSchema.parse(data);
    const [song] = await db
      .update(songs)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(songs.id, id))
      .returning();
    return song || null;
  }

  async deleteSong(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(songs).where(eq(songs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteSongsByAlbumId(albumId: string): Promise<number> {
    const db = await getDb();
    const result = await db.delete(songs).where(eq(songs.albumId, albumId));
    return result.rowCount ?? 0;
  }
}

export const songManager = new SongManager();
