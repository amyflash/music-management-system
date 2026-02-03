import { Album, Song } from './musicData';

// 获取认证头
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  if (token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}

// 获取所有专辑（从 API）
export async function getAlbums(): Promise<Album[]> {
  try {
    const response = await fetch('/api/albums', {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return data.albums || [];
  } catch (error) {
    console.error('获取专辑失败:', error);
    return [];
  }
}

// 获取专辑详情（从 API，包含歌曲）
export async function getAlbumById(id: string): Promise<(Album & { songs: Song[] }) | null> {
  try {
    const response = await fetch(`/api/albums/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.album) return null;
    return {
      ...data.album,
      songs: data.album.songs || [],
    };
  } catch (error) {
    console.error('获取专辑详情失败:', error);
    return null;
  }
}

// 获取所有歌曲（从 API）
export async function getSongs(options?: { albumId?: string }): Promise<Song[]> {
  try {
    const url = new URL('/api/songs', window.location.origin);
    if (options?.albumId) {
      url.searchParams.append('albumId', options.albumId);
    }
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return data.songs || [];
  } catch (error) {
    console.error('获取歌曲失败:', error);
    return [];
  }
}

// 获取歌曲详情（从 API）
export async function getSongById(id: string): Promise<Song | null> {
  try {
    const response = await fetch(`/api/songs/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.song) return null;
    return data.song;
  } catch (error) {
    console.error('获取歌曲详情失败:', error);
    return null;
  }
}

// 创建专辑（通过 API）
export async function createAlbum(data: {
  title: string;
  artist: string;
  year: string;
  coverUrl?: string;
}): Promise<Album | null> {
  try {
    const response = await fetch('/api/albums', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.album || null;
  } catch (error) {
    console.error('创建专辑失败:', error);
    return null;
  }
}

// 更新专辑（通过 API）
export async function updateAlbum(id: string, data: {
  title?: string;
  artist?: string;
  year?: string;
  coverUrl?: string;
}): Promise<Album | null> {
  try {
    const response = await fetch(`/api/albums/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.album || null;
  } catch (error) {
    console.error('更新专辑失败:', error);
    return null;
  }
}

// 删除专辑（通过 API）
export async function deleteAlbum(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/albums/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.error('删除专辑失败:', error);
    return false;
  }
}

// 创建歌曲（通过 API）
export async function createSong(data: {
  albumId: string;
  title: string;
  duration: string;
  audioUrl: string;
  lyricsUrl?: string;
}): Promise<Song | null> {
  try {
    const response = await fetch('/api/songs', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.song || null;
  } catch (error) {
    console.error('创建歌曲失败:', error);
    return null;
  }
}

// 更新歌曲（通过 API）
export async function updateSong(id: string, data: {
  albumId?: string;
  title?: string;
  duration?: string;
  audioUrl?: string;
  lyricsUrl?: string;
}): Promise<Song | null> {
  try {
    const response = await fetch(`/api/songs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.song || null;
  } catch (error) {
    console.error('更新歌曲失败:', error);
    return null;
  }
}

// 删除歌曲（通过 API）
export async function deleteSong(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/songs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.error('删除歌曲失败:', error);
    return false;
  }
}

// 兼容旧代码的函数（为了保持向后兼容）
export const getMergedAlbums = getAlbums;
export const addUploadedSong = createSong;
export const isUserUploadedSong = () => true; // 所有从数据库加载的都是用户上传的
export const isUserUploadedAlbum = () => true; // 所有从数据库加载的都是用户上传的
export const getUserAlbumById = getAlbumById;
export const getUserSongById = getSongById;
export const getAllSongs = getSongs;
