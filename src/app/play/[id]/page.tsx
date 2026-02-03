'use client';

import { useState, useRef, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSongById, getSongs } from '@/lib/storageManager';
import { type Song } from '@/lib/musicData';
import { parseLRC, getCurrentLyricIndex, type LyricLine, loadLyricsFromUrl } from '@/lib/lrcParser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadMusicDialog, UploadFormData } from '@/components/upload-music-dialog';
import { ArrowLeft, Play, Pause, Volume2, SkipBack, SkipForward, User, LogOut, Music as MusicIcon, FileText, Upload as UploadIcon } from 'lucide-react';

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const songId = resolvedParams.id;
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [song, setSong] = useState<Song | null>(null);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);  // 添加加载状态
  const lyricItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 加载歌曲和所有歌曲
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const songData = await getSongById(songId);
      setSong(songData);
      const songsData = await getSongs();
      setAllSongs(songsData);
      setIsLoading(false);
    };
    loadData();
  }, [songId, refreshKey]);

  // 解析 LRC 歌词
  useEffect(() => {
    const loadLyrics = async () => {
      if (!song) return;

      console.log('开始加载歌词:', {
        songId: song.id,
        hasLyrics: !!song.lyrics,
        hasLyricsUrl: !!song.lyricsUrl,
        lyricsUrl: song.lyricsUrl,
      });

      let lyricsText: string | undefined;

      // 优先使用歌词 URL（用户上传的数据）
      if (song.lyricsUrl) {
        try {
          console.log('尝试从URL加载歌词:', song.lyricsUrl);
          lyricsText = await loadLyricsFromUrl(song.lyricsUrl);
          console.log('从URL加载歌词成功，长度:', lyricsText.length);
        } catch (error) {
          console.error('从URL加载歌词失败:', error);
        }
      } else {
        // 使用歌词文本（静态数据）
        lyricsText = song.lyrics;
        console.log('使用静态歌词，长度:', lyricsText?.length || 0);
      }

      if (lyricsText) {
        const parsedLyrics = parseLRC(lyricsText);
        console.log('解析歌词成功，行数:', parsedLyrics.length);
        setLyrics(parsedLyrics);
        setCurrentLyricIndex(-1);
        // 清空歌词 refs 数组
        lyricItemRefs.current = [];
      } else {
        console.log('没有歌词数据');
        setLyrics([]);
        setCurrentLyricIndex(-1);
      }
    };

    loadLyrics();
  }, [song?.lyrics, song?.lyricsUrl, refreshKey]);

  // 如果歌曲不存在且不是加载状态，重定向到专辑列表
  useEffect(() => {
    if (!isLoading && !song) {
      router.push('/music');
    }
  }, [songId, router, refreshKey, isLoading, song]);

  // 更新当前歌词索引
  useEffect(() => {
    if (lyrics.length > 0) {
      const newIndex = getCurrentLyricIndex(lyrics, currentTime);
      // console.log('歌词更新:', { currentTime, newIndex, lyricsLength: lyrics.length, currentLyricText: lyrics[newIndex]?.text });
      setCurrentLyricIndex(newIndex);
    }
  }, [currentTime, lyrics]);

  // 自动滚动到当前歌词
  useEffect(() => {
    if (currentLyricIndex >= 0 && lyricItemRefs.current[currentLyricIndex] && scrollContainerRef.current) {
      const activeElement = lyricItemRefs.current[currentLyricIndex];
      if (activeElement && scrollContainerRef.current) {
        // 使用 getBoundingClientRect 计算精确位置
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();

        // 计算元素顶部相对于容器顶部的距离
        const relativeTop = elementRect.top - containerRect.top + scrollContainerRef.current.scrollTop;

        // 计算滚动位置，使元素居中
        const containerHeight = containerRect.height;
        const elementHeight = elementRect.height;
        const scrollTop = relativeTop - (containerHeight / 2) + (elementHeight / 2);

        // 执行滚动
        scrollContainerRef.current.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      }
    }
  }, [currentLyricIndex]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleUpload = (uploadData: UploadFormData) => {
    // 保存上传的数据到 localStorage
    const { addUploadedSong } = require('@/lib/storageManager');
    addUploadedSong(uploadData);
    // 触发重新加载歌曲数据
    setRefreshKey((prev) => prev + 1);
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
      audioRef.current.volume = volume;  // 设置初始音量
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

  const handleProgress = () => {
    if (audioRef.current && audioRef.current.buffered.length > 0) {
      // 获取已缓冲的最后一个时间点（通常是缓冲结束位置）
      const bufferedEnd = audioRef.current.buffered.end(audioRef.current.buffered.length - 1);
      setBuffered(bufferedEnd);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 格式化歌词时间戳为 mm:ss.xx 格式
  const formatLyricTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
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

  const handleLyricClick = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-700">加载歌曲中...</p>
        </div>
      </div>
    );
  }

  // 歌曲不存在时重定向（由 useEffect 处理）
  if (!song) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
              <MusicIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent hidden sm:block">
              音乐管理
            </h1>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            >
              <UploadIcon className="w-4 h-4 mr-2 hidden sm:block" />
              上传音乐
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
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToAlbum}
            className="text-gray-700 hover:text-green-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回专辑
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-4 sm:p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
            {/* 播放器控制 */}
            <div className="flex flex-col justify-center space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{song.title}</h2>
                <p className="text-lg sm:text-xl text-gray-600 mt-2">{song.artist}</p>
                <p className="text-gray-500 mt-1">{song.albumTitle}</p>
              </div>

                {/* 音频元素 */}
                <audio
                  ref={audioRef}
                  src={song.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onProgress={handleProgress}
                  onEnded={() => {
                    setIsPlaying(false);
                    playNext();
                  }}
                />

                {/* 进度条 */}
                <div className="space-y-2">
                  <div className="relative w-full h-2 bg-gray-200 rounded-lg cursor-pointer">
                    {/* 已缓冲区域 */}
                    <div
                      className="absolute top-0 left-0 h-full bg-green-300/50 rounded-lg"
                      style={{ width: `${duration > 0 ? (buffered / duration) * 100 : 0}%` }}
                    />
                    {/* 已播放区域 */}
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ zIndex: 10 }}
                    />
                    {/* 进度条可视化 */}
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-teal-600 rounded-lg pointer-events-none"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* 播放控制按钮 */}
                <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={playPrevious}
                    className="rounded-full h-10 w-10 sm:h-12 sm:w-12"
                  >
                    <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={togglePlayPause}
                    className="rounded-full h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                    ) : (
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white ml-1" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={playNext}
                    className="rounded-full h-10 w-10 sm:h-12 sm:w-12"
                  >
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>

                {/* 音量控制 */}
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </div>
          </Card>

          {/* 歌词卡片 */}
          {(song.lyrics || song.lyricsUrl) && lyrics.length > 0 && (
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">歌词</h3>
                  {lyrics.length > 0 && (
                    <span className="text-sm text-gray-500 ml-2 hidden sm:inline">
                      (支持点击歌词跳转)
                    </span>
                  )}
                </div>
                <div ref={scrollContainerRef} className="h-64 sm:h-96 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50/50">
                  <div className="py-4">
                    {lyrics.map((line, index) => (
                      <div
                        key={index}
                        ref={(el) => {
                          lyricItemRefs.current[index] = el;
                        }}
                        onClick={() => handleLyricClick(line.time)}
                        className={`block py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 mb-2 leading-relaxed ${
                          index === currentLyricIndex
                            ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold scale-105 shadow-lg'
                            : 'text-gray-700 hover:bg-green-50'
                        }`}
                      >
                        <span className="text-xs opacity-70 mr-3 font-mono">
                          [{formatLyricTime(line.time)}]
                        </span>
                        <span className="text-base">
                          {line.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 无歌词提示 */}
          {!isLoading && song && !song.lyrics && !song.lyricsUrl && (
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-600">歌词</h3>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <p>暂无歌词</p>
                  <p className="text-sm mt-2">可以通过编辑歌曲添加歌词文件</p>
                </div>
              </div>
            </Card>
          )}
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
