'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSongById, getAllSongs } from '@/lib/musicData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Play, Pause, Volume2, SkipBack, SkipForward, User, LogOut, Music as MusicIcon, FileText } from 'lucide-react';

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const songId = resolvedParams.id;
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const song = getSongById(songId);
  const allSongs = getAllSongs();

  useEffect(() => {
    if (!song) {
      router.push('/music');
    }
  }, [song, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playNext = () => {
    const currentIndex = allSongs.findIndex((s) => s.id === songId);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % allSongs.length;
      router.push(`/play/${allSongs[nextIndex].id}`);
    }
  };

  const playPrevious = () => {
    const currentIndex = allSongs.findIndex((s) => s.id === songId);
    if (currentIndex !== -1) {
      const prevIndex = currentIndex === 0 ? allSongs.length - 1 : currentIndex - 1;
      router.push(`/play/${allSongs[prevIndex].id}`);
    }
  };

  const handleBackToAlbum = () => {
    if (song) {
      router.push(`/album/${song.albumId}`);
    }
  };

  if (!song) {
    return null;
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
            onClick={handleBackToAlbum}
            className="text-gray-700 hover:text-purple-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回专辑
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="overflow-hidden bg-white/95 backdrop-blur-sm shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* 专辑封面 */}
              <div className="flex items-center justify-center">
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-full max-w-md aspect-square object-cover rounded-2xl shadow-lg"
                />
              </div>

              {/* 播放器控制 */}
              <div className="flex flex-col justify-center space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{song.title}</h2>
                  <p className="text-xl text-gray-600 mt-2">{song.artist}</p>
                  <p className="text-gray-500 mt-1">{song.albumTitle}</p>
                </div>

                {/* 音频元素 */}
                <audio
                  ref={audioRef}
                  src={`/api/audio/${songId}`}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => {
                    setIsPlaying(false);
                    playNext();
                  }}
                />

                {/* 进度条 */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* 播放控制按钮 */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={playPrevious}
                    className="rounded-full h-12 w-12"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={togglePlayPause}
                    className="rounded-full h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white fill-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={playNext}
                    className="rounded-full h-12 w-12"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>

                {/* 音量控制 */}
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* 歌词卡片 */}
          {song.lyrics && (
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">歌词</h3>
                </div>
                <ScrollArea className="h-96">
                  <div className="pr-4">
                    <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans text-base">
                      {song.lyrics}
                    </pre>
                  </div>
                </ScrollArea>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
