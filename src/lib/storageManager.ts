import { Album, Song, albums as staticAlbums } from './musicData';
import { UploadFormData } from '@/components/upload-music-dialog';

const STORAGE_KEY = 'music_app_user_data';

// 用户上传的数据结构
interface UserData {
  albums: {
    [albumId: string]: {
      title: string;
      artist: string;
      year: string;
      coverUrl?: string;
      songs: Song[];
    };
  };
}

// 从 localStorage 读取用户数据
function getUserData(): UserData {
  if (typeof window === 'undefined') {
    return { albums: {} };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { albums: {} };
  } catch {
    return { albums: {} };
  }
}

// 保存用户数据到 localStorage
function saveUserData(data: UserData): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 生成专辑 ID
function generateAlbumId(title: string, artist: string): string {
  return `${artist}-${title}`.replace(/\s+/g, '-').toLowerCase();
}

// 添加上传的歌曲
export function addUploadedSong(uploadData: UploadFormData): void {
  const userData = getUserData();

  // 生成专辑 ID
  const albumId = generateAlbumId(uploadData.albumTitle, uploadData.artist);

  // 如果专辑不存在，创建新专辑
  if (!userData.albums[albumId]) {
    userData.albums[albumId] = {
      title: uploadData.albumTitle,
      artist: uploadData.artist,
      year: uploadData.year,
      coverUrl: uploadData.coverUrl,
      songs: [],
    };
  } else {
    // 如果专辑已存在且上传了新封面，更新封面
    if (uploadData.coverUrl) {
      userData.albums[albumId].coverUrl = uploadData.coverUrl;
    }
  }

  // 生成歌曲 ID
  const songId = `${albumId}-${Date.now()}`;

  // 添加歌曲到专辑
  userData.albums[albumId].songs.push({
    id: songId,
    title: uploadData.songTitle,
    duration: uploadData.duration || '',
    audioUrl: uploadData.audioUrl || '',
    lyricsUrl: uploadData.lyricsUrl,
  });

  // 保存到 localStorage
  saveUserData(userData);
}

// 获取合并后的专辑列表（静态数据 + 用户数据）
export function getMergedAlbums(): Album[] {
  const userData = getUserData();

  // 创建用户专辑的映射
  const mergedAlbums = new Map<string, Album>();

  // 添加静态专辑
  staticAlbums.forEach((album) => {
    mergedAlbums.set(album.id, { ...album });
  });

  // 合并用户数据
  Object.entries(userData.albums).forEach(([albumId, userAlbum]) => {
    const existingAlbum = mergedAlbums.get(albumId);

    if (existingAlbum) {
      // 专辑已存在，合并歌曲
      existingAlbum.songs = [...existingAlbum.songs, ...userAlbum.songs];
      // 如果用户上传了封面，更新封面
      if (userAlbum.coverUrl) {
        existingAlbum.coverUrl = userAlbum.coverUrl;
      }
    } else {
      // 专辑不存在，创建新专辑
      mergedAlbums.set(albumId, {
        id: albumId,
        title: userAlbum.title,
        artist: userAlbum.artist,
        year: userAlbum.year,
        coverUrl: userAlbum.coverUrl || `https://picsum.photos/seed/${albumId}/400/400`,
        songs: userAlbum.songs,
      });
    }
  });

  return Array.from(mergedAlbums.values());
}

// 清除用户数据（用于测试）
export function clearUserData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

// 获取所有歌曲（包含专辑信息）
export function getAllSongs(): (Song & { albumId: string; albumTitle: string; artist: string; coverUrl: string })[] {
  const mergedAlbums = getMergedAlbums();
  const allSongs: (Song & { albumId: string; albumTitle: string; artist: string; coverUrl: string })[] = [];

  mergedAlbums.forEach((album) => {
    album.songs.forEach((song) => {
      allSongs.push({
        ...song,
        albumId: album.id,
        albumTitle: album.title,
        artist: album.artist,
        coverUrl: album.coverUrl,
      });
    });
  });

  return allSongs;
}

// 根据歌曲ID获取完整歌曲信息（包含专辑信息）
export function getSongById(songId: string): (Song & { albumId: string; albumTitle: string; artist: string; coverUrl: string }) | null {
  const mergedAlbums = getMergedAlbums();

  for (const album of mergedAlbums) {
    const song = album.songs.find((s) => s.id === songId);
    if (song) {
      return {
        ...song,
        albumId: album.id,
        albumTitle: album.title,
        artist: album.artist,
        coverUrl: album.coverUrl,
      };
    }
  }

  return null;
}

// 检查歌曲是否为用户上传的歌曲
export function isUserUploadedSong(songId: string): boolean {
  const userData = getUserData();

  for (const albumId in userData.albums) {
    if (userData.albums[albumId].songs.some((song) => song.id === songId)) {
      return true;
    }
  }

  return false;
}

// 检查专辑是否为用户创建的专辑
export function isUserUploadedAlbum(albumId: string): boolean {
  const userData = getUserData();
  return albumId in userData.albums;
}

// 删除歌曲
export function deleteSong(songId: string): boolean {
  const userData = getUserData();

  for (const albumId in userData.albums) {
    const songIndex = userData.albums[albumId].songs.findIndex((song) => song.id === songId);

    if (songIndex !== -1) {
      // 找到歌曲，删除它
      userData.albums[albumId].songs.splice(songIndex, 1);

      // 如果专辑没有歌曲了，删除整个专辑
      if (userData.albums[albumId].songs.length === 0) {
        delete userData.albums[albumId];
      }

      saveUserData(userData);
      return true;
    }
  }

  return false;
}

// 删除专辑
export function deleteAlbum(albumId: string): boolean {
  const userData = getUserData();

  if (userData.albums[albumId]) {
    delete userData.albums[albumId];
    saveUserData(userData);
    return true;
  }

  return false;
}

// 更新专辑信息
export function updateAlbum(albumId: string, albumData: {
  title?: string;
  artist?: string;
  year?: string;
  coverUrl?: string;
}): boolean {
  const userData = getUserData();

  if (!userData.albums[albumId]) {
    return false;
  }

  // 更新专辑信息
  if (albumData.title !== undefined) {
    userData.albums[albumId].title = albumData.title;
  }
  if (albumData.artist !== undefined) {
    userData.albums[albumId].artist = albumData.artist;
  }
  if (albumData.year !== undefined) {
    userData.albums[albumId].year = albumData.year;
  }
  if (albumData.coverUrl !== undefined) {
    userData.albums[albumId].coverUrl = albumData.coverUrl;
  }

  saveUserData(userData);
  return true;
}

// 更新歌曲信息
export function updateSong(songId: string, songData: {
  title?: string;
  duration?: string;
  audioUrl?: string;
  lyricsUrl?: string;
}): boolean {
  const userData = getUserData();

  for (const albumId in userData.albums) {
    const songIndex = userData.albums[albumId].songs.findIndex((song) => song.id === songId);

    if (songIndex !== -1) {
      // 更新歌曲信息
      if (songData.title !== undefined) {
        userData.albums[albumId].songs[songIndex].title = songData.title;
      }
      if (songData.duration !== undefined) {
        userData.albums[albumId].songs[songIndex].duration = songData.duration;
      }
      if (songData.audioUrl !== undefined) {
        userData.albums[albumId].songs[songIndex].audioUrl = songData.audioUrl;
      }
      if (songData.lyricsUrl !== undefined) {
        userData.albums[albumId].songs[songIndex].lyricsUrl = songData.lyricsUrl;
      }

      saveUserData(userData);
      return true;
    }
  }

  return false;
}

// 获取专辑信息（仅用户上传的专辑）
export function getUserAlbumById(albumId: string): UserData['albums'][string] | null {
  const userData = getUserData();
  return userData.albums[albumId] || null;
}

// 获取歌曲信息（仅用户上传的歌曲）
export function getUserSongById(songId: string): { song: Song, albumId: string, index: number } | null {
  const userData = getUserData();

  for (const albumId in userData.albums) {
    const songIndex = userData.albums[albumId].songs.findIndex((song) => song.id === songId);

    if (songIndex !== -1) {
      return {
        song: userData.albums[albumId].songs[songIndex],
        albumId,
        index: songIndex,
      };
    }
  }

  return null;
}
