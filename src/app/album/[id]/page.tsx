'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { albums as staticAlbums, Album } from '@/lib/musicData';
import { getAlbumById, createSong, deleteSong, updateSong, updateAlbum, isUserUploadedSong } from '@/lib/storageManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadMusicDialog, UploadFormData } from '@/components/upload-music-dialog';
import { EditAlbumDialog } from '@/components/edit-album-dialog';
import { EditSongDialog } from '@/components/edit-song-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Play, LogOut, User, Music as MusicIcon, Disc, Upload as UploadIcon, Trash2, Edit2, Search } from 'lucide-react';

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const albumId = resolvedParams.id;
  const { user, logout } = useAuth();
  const router = useRouter();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [album, setAlbum] = useState<Album | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [editAlbumDialogOpen, setEditAlbumDialogOpen] = useState(false);
  const [editSongDialogOpen, setEditSongDialogOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 加载专辑详情
  useEffect(() => {
    const loadAlbum = async () => {
      const data = await getAlbumById(albumId);
      setAlbum(data);
    };
    loadAlbum();
  }, [albumId, refreshKey]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSongClick = (songId: string) => {
    router.push(`/play/${songId}`);
  };

  const handleUpload = async (uploadData: UploadFormData) => {
    if (!album || !uploadData.songAudioUrl) return;

    // 创建歌曲数据到数据库
    await createSong({
      albumId: album.id,
      title: uploadData.songTitle,
      duration: uploadData.songDuration,
      audioUrl: uploadData.songAudioUrl,
      lyricsUrl: uploadData.songLyricsUrl,
    });
    // 触发重新加载专辑数据
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteSong = (songId: string) => {
    setSongToDelete(songId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSong = async () => {
    if (songToDelete) {
      await deleteSong(songToDelete);
      setSongToDelete(null);
      setDeleteDialogOpen(false);
      // 触发重新加载专辑数据
      setRefreshKey((prev) => prev + 1);
    }
  };

  const cancelDeleteSong = () => {
    setSongToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleEditAlbum = () => {
    setEditAlbumDialogOpen(true);
  };

  const handleEditSong = (songId: string) => {
    setSongToEdit(songId);
    setEditSongDialogOpen(true);
  };

  const handleSaveAlbum = async (data: {
    title: string;
    artist: string;
    year: string;
    coverUrl?: string;
  }) => {
    if (album) {
      await updateAlbum(album.id, {
        title: data.title,
        artist: data.artist,
        year: data.year,
        coverUrl: data.coverUrl || album.coverUrl,
      });
      setEditAlbumDialogOpen(false);
      // 触发重新加载专辑数据
      setRefreshKey((prev) => prev + 1);
    }
  };

  const handleSaveSong = async (data: {
    title: string;
    duration: string;
    audioUrl?: string;
    lyricsUrl?: string;
  }) => {
    if (songToEdit) {
      await updateSong(songToEdit, {
        title: data.title,
        duration: data.duration,
        audioUrl: data.audioUrl,
        lyricsUrl: data.lyricsUrl,
      });
    }
    setEditSongDialogOpen(false);
    setSongToEdit(null);
    // 触发重新加载专辑数据
    setRefreshKey((prev) => prev + 1);
  };

  // 过滤歌曲
  const filteredSongs = album?.songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">专辑未找到</h2>
          <Button onClick={() => router.push('/music')} className="mt-4">
            返回专辑列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
              <MusicIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              音乐管理
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              添加歌曲
            </Button>
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="w-5 h-5" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/music')}
            className="text-gray-700 hover:text-green-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回专辑列表
          </Button>
          <Button
            onClick={handleEditAlbum}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            编辑专辑
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 专辑头部 */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-48 h-48 object-cover rounded-2xl shadow-lg"
              />
            </div>
            <div className="flex flex-col justify-center text-center md:text-left">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <Disc className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">专辑</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{album.title}</h2>
              <p className="text-xl text-gray-600 mb-2">{album.artist}</p>
              <p className="text-gray-500">{album.year} · {album.songs.length} 首歌曲</p>
            </div>
          </div>

          {/* 歌曲列表 */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            {/* 搜索框 */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="搜索歌曲..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
              </div>
            </div>

            <div className="divide-y">
              {filteredSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-4 hover:bg-green-50 transition-colors group"
                >
                  <div
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => handleSongClick(song.id)}
                  >
                    <div className="w-8 text-center text-gray-400 group-hover:text-green-600">
                      {index + 1}
                    </div>
                    <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-500 transition-colors">
                      <Play className="w-4 h-4 text-green-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{song.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500 w-16 text-right">
                      {song.duration}
                    </div>
                    {isUserUploadedSong() && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSong(song.id);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSong(song.id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* 无搜索结果提示 */}
              {filteredSongs.length === 0 && searchQuery && (
                <div className="py-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">未找到相关歌曲</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* 上传音乐对话框 */}
      <UploadMusicDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
        presetAlbum={album ? {
          title: album.title,
          artist: album.artist,
          year: album.year,
        } : undefined}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除歌曲</AlertDialogTitle>
            <AlertDialogDescription>
              你确定要删除这首歌吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteSong}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSong}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 编辑专辑对话框 */}
      {album && (
        <EditAlbumDialog
          albumData={{
            title: album.title,
            artist: album.artist,
            year: album.year,
            coverUrl: album.coverUrl,
          }}
          open={editAlbumDialogOpen}
          onOpenChange={setEditAlbumDialogOpen}
          onSave={handleSaveAlbum}
        />
      )}

      {/* 编辑歌曲对话框 */}
      {songToEdit && album && (
        <EditSongDialog
          songData={album.songs.find((s) => s.id === songToEdit)}
          open={editSongDialogOpen}
          onOpenChange={setEditSongDialogOpen}
          onSave={handleSaveSong}
        />
      )}
    </div>
  );
}
