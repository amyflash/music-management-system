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
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EditSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: {
    title: string;
    duration: string;
    audioUrl?: string;
    lyricsUrl?: string;
  }) => void;
  songData?: {
    title: string;
    duration: string;
    audioUrl: string;
    lyricsUrl?: string;
  };
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

    // 如果是 401 错误（token 无效或过期），清理本地数据
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('认证令牌已过期，正在跳转到登录页...');
    }

    throw new Error(error.error || '文件上传失败');
  }

  const result = await response.json();
  console.log('[Upload] 上传成功:', result);

  // Serverless 环境可能返回 dataUrl 或 warning
  if (result.isTemporary && result.warning) {
    console.warn('[Upload] Serverless 环境:', result.warning);
  }

  // 返回 URL 或 dataUrl
  return result.url || result.dataUrl || '';
}

export function EditSongDialog({ open, onOpenChange, onSave, songData }: EditSongDialogProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    audioFile: null as File | null,
    audioUrl: '',
    lyricsFile: null as File | null,
    lyricsUrl: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // 当对话框打开时，初始化表单
  useEffect(() => {
    if (open && songData) {
      setFormData({
        title: songData.title,
        duration: songData.duration,
        audioFile: null,
        audioUrl: songData.audioUrl,
        lyricsFile: null,
        lyricsUrl: songData.lyricsUrl || '',
      });
    }
  }, [open, songData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      alert('请填写歌曲名称');
      return;
    }

    setIsSaving(true);

    try {
      // 上传音频文件
      let finalAudioUrl = formData.audioUrl;
      if (formData.audioFile) {
        finalAudioUrl = await uploadFile(formData.audioFile, token || '');
      }

      // 上传 LRC 歌词文件
      let finalLyricsUrl = formData.lyricsUrl;
      if (formData.lyricsFile) {
        finalLyricsUrl = await uploadFile(formData.lyricsFile, token || '');
      }

      // 调用保存回调
      if (onSave) {
        onSave({
          title: formData.title,
          duration: formData.duration,
          audioUrl: finalAudioUrl,
          lyricsUrl: finalLyricsUrl,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>编辑歌曲信息</DialogTitle>
          <DialogDescription>修改歌曲的基本信息和文件</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">歌曲名称 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <Label htmlFor="audioFile">音频文件（可选）</Label>
            <Input
              id="audioFile"
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={(e) => setFormData({ ...formData, audioFile: e.target.files?.[0] || null })}
            />
            {formData.audioUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">当前音频：{formData.audioUrl}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lyricsFile">歌词文件 LRC（可选）</Label>
            <Input
              id="lyricsFile"
              type="file"
              accept=".lrc"
              onChange={(e) => setFormData({ ...formData, lyricsFile: e.target.files?.[0] || null })}
            />
            {formData.lyricsUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">当前歌词：{formData.lyricsUrl}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
