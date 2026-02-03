'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { albums as staticAlbums, Album } from '@/lib/musicData';
import { getMergedAlbums, createAlbum, createSong, deleteAlbum, isUserUploadedAlbum } from '@/lib/storageManager';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadMusicDialog, UploadFormData } from '@/components/upload-music-dialog';
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
import { Disc, LogOut, User, Music as MusicIcon, Upload as UploadIcon, Trash2, Search } from 'lucide-react';

export default function MusicListPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);

  // 加载专辑数据
  useEffect(() => {
    const loadAlbums = async () => {
      const data = await getMergedAlbums();
      setAlbums(data);
    };
    loadAlbums();
  }, [refreshKey]);

  // 搜索过滤
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAlbums(albums);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = albums.filter(album =>
        album.title.toLowerCase().includes(query) ||
        album.artist.toLowerCase().includes(query)
      );
      setFilteredAlbums(filtered);
    }
  }, [searchQuery, albums]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAlbumClick = (album: Album) => {
    router.push(`/album/${album.id}`);
  };

  const handleUpload = async (uploadData: UploadFormData) => {
    // 创建专辑
    const newAlbum = await createAlbum({
      title: uploadData.albumTitle,
      artist: uploadData.albumArtist,
      year: uploadData.albumYear,
      coverUrl: uploadData.albumCoverUrl,
    });

    if (newAlbum && uploadData.songAudioUrl) {
      // 创建歌曲
      await createSong({
        albumId: newAlbum.id,
        title: uploadData.songTitle,
        duration: uploadData.songDuration,
        audioUrl: uploadData.songAudioUrl,
        lyricsUrl: uploadData.songLyricsUrl,
      });
      // 触发重新加载专辑数据
      setRefreshKey((prev) => prev + 1);
    }
  };

  const handleDeleteAlbum = (albumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlbumToDelete(albumId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAlbum = async () => {
    if (albumToDelete) {
      await deleteAlbum(albumToDelete);
      setAlbumToDelete(null);
      setDeleteDialogOpen(false);
      // 触发重新加载专辑数据
      setRefreshKey((prev) => prev + 1);
    }
  };

  const cancelDeleteAlbum = () => {
    setAlbumToDelete(null);
    setDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-end">
          <div className="flex items-center space-x-2 justify-end w-full sm:w-auto">
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            >
              <UploadIcon className="w-4 h-4 mr-2 hidden sm:block" />
              创建专辑
            </Button>
            <div className="flex items-center space-x-2 text-gray-700 hidden sm:flex">
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
              <span className="hidden sm:inline">退出登录</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 搜索框 */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索专辑或歌手..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            专辑列表
            {searchQuery && ` (${filteredAlbums.length} 个结果)`}
          </h2>
          <p className="text-gray-600 mt-2">
            {searchQuery ? `搜索 "${searchQuery}"` : `共 ${albums.length} 张专辑`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlbums.map((album) => (
            <Card
              key={album.id}
              className="group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              onClick={() => handleAlbumClick(album)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="p-4 bg-white/90 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <Disc className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 truncate">{album.title}</h3>
                    <p className="text-gray-600 mt-1 truncate">{album.artist}</p>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                      <span className="truncate">{album.year}</span>
                      <span>{album.songs?.length || 0} 首歌曲</span>
                    </div>
                  </div>
                  {isUserUploadedAlbum() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteAlbum(album.id, e)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* 无搜索结果提示 */}
          {filteredAlbums.length === 0 && searchQuery && (
            <div className="col-span-full py-16 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">未找到相关专辑</h3>
              <p className="text-gray-500">
                尝试使用其他关键词搜索
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 上传音乐对话框 */}
      <UploadMusicDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除专辑</AlertDialogTitle>
            <AlertDialogDescription>
              你确定要删除这个专辑吗？此操作将删除专辑中的所有歌曲，无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteAlbum}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAlbum}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
