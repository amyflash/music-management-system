'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Loader2 } from 'lucide-react';

interface UploadSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload?: (data: UploadSongFormData) => void;
  // 预置的专辑信息（必需）
  albumId: string;
  albumTitle: string;
  albumArtist: string;
}

export interface UploadSongFormData {
  songTitle: string;
  songDuration: string;
  songAudioFile: File | null;
  songAudioUrl?: string;
  songLyricsFile?: File | null;
  songLyricsUrl?: string;
}

// 上传文件到服务器
async function uploadFile(file: File, token: string): Promise<string> {
  console.log('[Upload] 开始上传文件:', { fileName: file.name, token: token ? '存在' : '不存在' });

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
    console.error('[Upload] 上传失败:', error);
    console.error('[Upload] 响应状态:', response.status);

    // 如果是 401 错误（token 无效或过期），先验证 token 是否真的无效
    if (response.status === 401) {
      console.warn('[Upload] 收到 401 错误，准备验证 token 有效性...');

      // 尝试验证 token
      try {
        const verifyResponse = await fetch('https://auth.516768.xyz/api/verify-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const verifyData = await verifyResponse.json();
        console.log('[Upload] Token 验证结果:', verifyData);

        // 只有当 token 真的无效时才清空 localStorage
        if (!verifyResponse.ok || verifyData.success !== true) {
          console.error('[Upload] ❌ Token 确实无效，准备清理 localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('认证令牌已过期，正在跳转到登录页...');
        } else {
          // Token 有效，可能是上传 API 的问题
          console.error('[Upload] Token 有效，可能是上传 API 的问题');
          throw new Error(error.error || '上传失败，请重试');
        }
      } catch (verifyError) {
        console.error('[Upload] Token 验证失败:', verifyError);
        // 验证失败，可能是网络问题，不清空 localStorage
        throw new Error(error.error || '文件上传失败');
      }
    }

    throw new Error(error.error || '文件上传失败');
  }

  const result = await response.json();
  console.log('[Upload] 上传成功:', result);

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

export function UploadSongDialog({ open, onOpenChange, onUpload, albumId, albumTitle, albumArtist }: UploadSongDialogProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<UploadSongFormData>({
    songTitle: '',
    songDuration: '3:30', // 默认时长，用户无需输入
    songAudioFile: null,
  });
  const [isUploading, setIsUploading] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    if (open && !token) {
      alert('请先登录');
      onOpenChange(false);
    }
  }, [open, token, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.songTitle || !formData.songAudioFile) {
      alert('请填写歌曲名称并选择音频文件');
      return;
    }

    setIsUploading(true);

    try {
      // 上传音频文件
      let songAudioUrl = formData.songAudioUrl;
      if (formData.songAudioFile) {
        songAudioUrl = await uploadFile(formData.songAudioFile, token || '');
      }

      // 上传歌词文件（可选）
      let songLyricsUrl = formData.songLyricsUrl;
      if (formData.songLyricsFile) {
        songLyricsUrl = await uploadFile(formData.songLyricsFile, token || '');
      }

      // 构建完整数据
      const uploadData: UploadSongFormData = {
        ...formData,
        songAudioUrl,
        songLyricsUrl,
      };

      if (onUpload) {
        onUpload(uploadData);
      }

      // 重置表单
      setFormData({
        songTitle: '',
        songDuration: '3:30',
        songAudioFile: null,
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            上传歌曲
          </DialogTitle>
          <DialogDescription>
            添加歌曲到专辑：{albumTitle} - {albumArtist}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 歌曲信息 */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
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
              <Label htmlFor="songAudioFile">音频文件 * (MP3)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="songAudioFile"
                  type="file"
                  accept=".mp3,audio/mpeg,audio/mp3"
                  onChange={(e) => setFormData({ ...formData, songAudioFile: e.target.files?.[0] || null })}
                  required
                />
              </div>
              {formData.songAudioFile && (
                <p className="text-sm text-gray-500">已选择: {formData.songAudioFile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="songLyricsFile">歌词文件 (LRC, 可选)</Label>
              <Input
                id="songLyricsFile"
                type="file"
                accept=".lrc,text/plain"
                onChange={(e) => setFormData({ ...formData, songLyricsFile: e.target.files?.[0] || null })}
              />
              {formData.songLyricsFile && (
                <p className="text-sm text-gray-500">已选择: {formData.songLyricsFile.name}</p>
              )}
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
                  上传歌曲
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
