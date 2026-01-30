'use client';

import { useState } from 'react';
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
import { Upload, Loader2 } from 'lucide-react';

interface UploadMusicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload?: (data: UploadFormData) => void;
}

export interface UploadFormData {
  albumTitle: string;
  artist: string;
  songTitle: string;
  duration: string;
  audioFile: File | null;
  coverFile: File | null;
  lyrics?: string;
  year: string;
}

export function UploadMusicDialog({ open, onOpenChange, onUpload }: UploadMusicDialogProps) {
  const [formData, setFormData] = useState<UploadFormData>({
    albumTitle: '',
    artist: '',
    songTitle: '',
    duration: '',
    audioFile: null,
    coverFile: null,
    lyrics: '',
    year: new Date().getFullYear().toString(),
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.songTitle || !formData.artist || !formData.albumTitle) {
      alert('请填写必要信息');
      return;
    }

    setIsUploading(true);

    try {
      // 这里可以实现实际的文件上传逻辑
      // 例如上传到对象存储或服务器
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟上传

      if (onUpload) {
        onUpload(formData);
      }

      // 重置表单
      setFormData({
        albumTitle: '',
        artist: '',
        songTitle: '',
        duration: '',
        audioFile: null,
        coverFile: null,
        lyrics: '',
        year: new Date().getFullYear().toString(),
      });

      onOpenChange(false);
      alert('上传成功！');
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
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setFormData({ ...formData, lyrics: e.target?.result as string });
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                {formData.lyrics && (
                  <p className="text-sm text-green-600">✓ 已加载歌词文件</p>
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
