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
  albumArtist: string;
  albumYear: string;
  albumCoverFile?: File | null;
  albumCoverUrl?: string;  // 上传后的 URL
  songTitle: string;
  songDuration: string;
  songAudioFile: File | null;
  songAudioUrl?: string;  // 上传后的 URL
  songLyricsFile?: File | null;  // LRC 文件
  songLyricsUrl?: string;  // 上传后的 LRC 文件 URL
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

  // Serverless 环境可能返回 dataUrl 或 warning
  if (result.isTemporary && result.warning) {
    console.warn('[Upload] Serverless 环境:', result.warning);
  }

  // 如果是本地环境，将 /uploads/ 转换为 /api/files/ 以确保能访问文件
  let fileUrl = result.url || result.dataUrl || '';
  if (fileUrl.startsWith('/uploads/')) {
    const fileName = fileUrl.replace('/uploads/', '');
    fileUrl = `/api/files/${fileName}`;
    console.log('[Upload] 转换文件 URL:', result.url, '->', fileUrl);
  }

  // 返回 URL 或 dataUrl
  return fileUrl;
}

export function UploadMusicDialog({ open, onOpenChange, onUpload, presetAlbum }: UploadMusicDialogProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<UploadFormData>({
    albumTitle: '',
    albumArtist: '',
    albumYear: new Date().getFullYear().toString(),
    albumCoverFile: null,
    songTitle: '',
    songDuration: '3:30',  // 默认时长，用户无需输入
    songAudioFile: null,
  });
  const [isUploading, setIsUploading] = useState(false);

  // 当对话框打开且有预设专辑信息时，初始化表单
  useEffect(() => {
    if (open && presetAlbum) {
      setFormData(prev => ({
        ...prev,
        albumTitle: presetAlbum.title,
        albumArtist: presetAlbum.artist,
        albumYear: presetAlbum.year,
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

    if (!formData.songTitle || !formData.albumArtist || !formData.albumTitle) {
      alert('请填写必要信息');
      return;
    }

    setIsUploading(true);

    try {
      // 上传音频文件
      let songAudioUrl = formData.songAudioUrl;
      if (formData.songAudioFile) {
        songAudioUrl = await uploadFile(formData.songAudioFile, token || '');
      }

      // 上传封面文件
      let albumCoverUrl = formData.albumCoverUrl;
      if (formData.albumCoverFile) {
        albumCoverUrl = await uploadFile(formData.albumCoverFile, token || '');
      }

      // 上传歌词文件
      let songLyricsUrl = formData.songLyricsUrl;
      if (formData.songLyricsFile) {
        songLyricsUrl = await uploadFile(formData.songLyricsFile, token || '');
      }

      // 构建完整数据
      const uploadData: UploadFormData = {
        ...formData,
        songAudioUrl,
        albumCoverUrl,
        songLyricsUrl,
      };

      if (onUpload) {
        onUpload(uploadData);
      }

      // 重置表单
      setFormData({
        albumTitle: '',
        albumArtist: '',
        albumYear: new Date().getFullYear().toString(),
        albumCoverFile: null,
        songTitle: '',
        songDuration: '3:30',
        songAudioFile: null,
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
                  <Label htmlFor="albumArtist">歌手 *</Label>
                  <Input
                    id="albumArtist"
                    value={formData.albumArtist}
                    onChange={(e) => setFormData({ ...formData, albumArtist: e.target.value })}
                    placeholder="例如：John Lennon"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="albumYear">发行年份</Label>
                  <Input
                    id="albumYear"
                    type="number"
                    value={formData.albumYear}
                    onChange={(e) => setFormData({ ...formData, albumYear: e.target.value })}
                    placeholder="2024"
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
              <div className="space-y-2 col-span-2">
                <Label htmlFor="songAudioFile">音频文件 (MP3)</Label>
                <Input
                  id="songAudioFile"
                  type="file"
                  accept=".mp3,audio/mpeg"
                  onChange={(e) => setFormData({ ...formData, songAudioFile: e.target.files?.[0] || null })}
                />
              </div>
              {!presetAlbum && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="albumCoverFile">专辑封面</Label>
                  <Input
                    id="albumCoverFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, albumCoverFile: e.target.files?.[0] || null })}
                  />
                </div>
              )}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="songLyricsFile">歌词文件 (LRC)</Label>
                <Input
                  id="songLyricsFile"
                  type="file"
                  accept=".lrc"
                  onChange={(e) => {
                    setFormData({ ...formData, songLyricsFile: e.target.files?.[0] || undefined });
                  }}
                />
                {formData.songLyricsFile && (
                  <p className="text-sm text-green-600">✓ 已选择歌词文件: {formData.songLyricsFile.name}</p>
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
