'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { albums as staticAlbums, Album } from '@/lib/musicData';
import { getMergedAlbums, addUploadedSong } from '@/lib/storageManager';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadMusicDialog, UploadFormData } from '@/components/upload-music-dialog';
import { Disc, LogOut, User, Music as MusicIcon, Upload as UploadIcon } from 'lucide-react';

export default function MusicListPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // 加载合并后的专辑数据
  useEffect(() => {
    setAlbums(getMergedAlbums());
  }, [refreshKey]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAlbumClick = (album: Album) => {
    router.push(`/album/${album.id}`);
  };

  const handleUpload = (uploadData: UploadFormData) => {
    // 保存上传的数据到 localStorage
    addUploadedSong(uploadData);
    // 触发重新加载专辑数据
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <MusicIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              音乐管理
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              上传音乐
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">专辑列表</h2>
          <p className="text-gray-600 mt-2">共 {albums.length} 张专辑</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album) => (
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
                    <Disc className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-gray-900 truncate">{album.title}</h3>
                <p className="text-gray-600 mt-1 truncate">{album.artist}</p>
                <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                  <span className="truncate">{album.year}</span>
                  <span>{album.songs.length} 首歌曲</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* 上传音乐对话框 */}
      <UploadMusicDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
      />
    </div>
  );
}
