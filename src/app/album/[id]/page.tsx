'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { albums as staticAlbums, Album } from '@/lib/musicData';
import { getMergedAlbums, addUploadedSong } from '@/lib/storageManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadMusicDialog, UploadFormData } from '@/components/upload-music-dialog';
import { ArrowLeft, Play, LogOut, User, Music as MusicIcon, Disc, Upload as UploadIcon } from 'lucide-react';

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const albumId = resolvedParams.id;
  const { user, logout } = useAuth();
  const router = useRouter();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const album = albums.find((a) => a.id === albumId);

  // 加载合并后的专辑数据
  useEffect(() => {
    setAlbums(getMergedAlbums());
  }, [refreshKey]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSongClick = (songId: string) => {
    router.push(`/play/${songId}`);
  };

  const handleUpload = (uploadData: UploadFormData) => {
    // 保存上传的数据到 localStorage
    addUploadedSong(uploadData);
    // 触发重新加载专辑数据
    setRefreshKey((prev) => prev + 1);
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center">
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
          <Button
            variant="ghost"
            onClick={() => router.push('/music')}
            className="text-gray-700 hover:text-purple-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回专辑列表
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 专辑头部 */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-shrink-0">
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-48 h-48 object-cover rounded-2xl shadow-lg"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <Disc className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">专辑</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{album.title}</h2>
              <p className="text-xl text-gray-600 mb-2">{album.artist}</p>
              <p className="text-gray-500">{album.year} · {album.songs.length} 首歌曲</p>
            </div>
          </div>

          {/* 歌曲列表 */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <div className="divide-y">
              {album.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-4 hover:bg-purple-50 cursor-pointer transition-colors group"
                  onClick={() => handleSongClick(song.id)}
                >
                  <div className="w-8 text-center text-gray-400 group-hover:text-purple-600">
                    {index + 1}
                  </div>
                  <div className="p-2 rounded-full bg-purple-100 group-hover:bg-purple-500 transition-colors">
                    <Play className="w-4 h-4 text-purple-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{song.title}</h3>
                  </div>
                  <div className="text-sm text-gray-500 w-16 text-right">
                    {song.duration}
                  </div>
                </div>
              ))}
            </div>
          </Card>
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
