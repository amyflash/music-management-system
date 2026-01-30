'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Loader2 } from 'lucide-react';

interface UploadMusicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload?: (data: UploadFormData) => void;
  // 预置的专辑信息（可选，用于添加歌曲到指定专辑）
  presetAlbum?: {
    title: string;
    artist: string;
    year: string;
  };
}

export interface UploadFormData {
  albumTitle: string;
  artist: string;
  songTitle: string;
  duration: string;
  audioFile: File | null;
  audioUrl?: string;  // 上传后的 URL
  coverFile: File | null;
  coverUrl?: string;  // 上传后的 URL
  lyricsFile?: File | null;  // LRC 文件
  lyricsUrl?: string;  // 上传后的 LRC 文件 URL
  year: string;
}

// 上传文件到服务器
async function uploadFile(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '文件上传失败');
  }

  const result = await response.json();
  return result.url;
}

export function UploadMusicDialog({ open, onOpenChange, onUpload, presetAlbum }: UploadMusicDialogProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<UploadFormData>({
    albumTitle: '',
    artist: '',
    songTitle: '',
    duration: '',
    audioFile: null,
    coverFile: null,
    year: new Date().getFullYear().toString(),
  });
  const [isUploading, setIsUploading] = useState(false);

  // 当对话框打开且有预设专辑信息时，初始化表单
  useEffect(() => {
    if (open && presetAlbum) {
      setFormData(prev => ({
        ...prev,
        albumTitle: presetAlbum.title,
        artist: presetAlbum.artist,
        year: presetAlbum.year,
      }));
    }
  }, [open, presetAlbum]);

  // 检查是否已登录
  useEffect(() => {
    if (open && !token) {
      alert('请先登录');
      onOpenChange(false);
    }
  }, [open, token, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.songTitle || !formData.artist || !formData.albumTitle) {
      alert('请填写必要信息');
      return;
    }

    setIsUploading(true);

    try {
      // 上传音频文件
      let audioUrl = formData.audioUrl;
      if (formData.audioFile) {
        audioUrl = await uploadFile(formData.audioFile, token || '');
      }

      // 上传封面文件
      let coverUrl = formData.coverUrl;
      if (formData.coverFile) {
        coverUrl = await uploadFile(formData.coverFile, token || '');
      }

      // 上传 LRC 歌词文件
      let lyricsUrl = formData.lyricsUrl;
      if (formData.lyricsFile) {
        lyricsUrl = await uploadFile(formData.lyricsFile, token || '');
      }

      // 构建完整数据
      const uploadData = {
        ...formData,
        audioUrl,
        coverUrl,
        lyricsUrl,
      };

      if (onUpload) {
        onUpload(uploadData);
      }

      // 重置表单
      setFormData({
        albumTitle: '',
        artist: '',
        songTitle: '',
        duration: '',
        audioFile: null,
        coverFile: null,
        year: new Date().getFullYear().toString(),
      });

      onOpenChange(false);
      alert('上传成功！文件已保存到 /public/uploads 目录');
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            上传音乐
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 专辑信息 */}
          {presetAlbum ? (
            // 预置专辑信息，只显示不可编辑
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">专辑信息</h3>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">专辑名称：</span>
                      <span className="font-medium ml-2">{presetAlbum.title}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">歌手：</span>
                      <span className="font-medium ml-2">{presetAlbum.artist}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">发行年份：</span>
                      <span className="font-medium ml-2">{presetAlbum.year}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // 新建专辑，可编辑
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">专辑信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="albumTitle">专辑名称 *</Label>
                  <Input
                    id="albumTitle"
                    value={formData.albumTitle}
                    onChange={(e) => setFormData({ ...formData, albumTitle: e.target.value })}
                    placeholder="例如：Imagine"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">发行年份</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="artist">歌手 *</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    placeholder="例如：John Lennon"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* 歌曲信息 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">歌曲信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="songTitle">歌曲名称 *</Label>
                <Input
                  id="songTitle"
                  value={formData.songTitle}
                  onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
                  placeholder="例如：Imagine"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">时长</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="3:45"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audioFile">音频文件 (MP3)</Label>
                <Input
                  id="audioFile"
                  type="file"
                  accept=".mp3,audio/mpeg"
                  onChange={(e) => setFormData({ ...formData, audioFile: e.target.files?.[0] || null })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="coverFile">专辑封面</Label>
                <Input
                  id="coverFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, coverFile: e.target.files?.[0] || null })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="lyricsFile">歌词文件 (LRC)</Label>
                <Input
                  id="lyricsFile"
                  type="file"
                  accept=".lrc"
                  onChange={(e) => {
                    setFormData({ ...formData, lyricsFile: e.target.files?.[0] || undefined });
                  }}
                />
                {formData.lyricsFile && (
                  <p className="text-sm text-green-600">✓ 已选择歌词文件: {formData.lyricsFile.name}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  上传
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
