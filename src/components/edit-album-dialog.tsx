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
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EditAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: {
    title: string;
    artist: string;
    year: string;
    coverUrl?: string;
  }) => void;
  albumData?: {
    title: string;
    artist: string;
    year: string;
    coverUrl?: string;
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

  // 返回 URL
  return result.url || '';
}

export function EditAlbumDialog({ open, onOpenChange, onSave, albumData }: EditAlbumDialogProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    year: '',
    coverFile: null as File | null,
    coverUrl: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // 当对话框打开时，初始化表单
  useEffect(() => {
    if (open && albumData) {
      setFormData({
        title: albumData.title,
        artist: albumData.artist,
        year: albumData.year,
        coverFile: null,
        coverUrl: albumData.coverUrl || '',
      });
    }
  }, [open, albumData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.artist) {
      alert('请填写专辑名称和歌手');
      return;
    }

    setIsSaving(true);

    try {
      // 上传封面文件
      let finalCoverUrl = formData.coverUrl;
      if (formData.coverFile) {
        finalCoverUrl = await uploadFile(formData.coverFile, token || '');
      }

      // 调用保存回调
      if (onSave) {
        onSave({
          title: formData.title,
          artist: formData.artist,
          year: formData.year || undefined,
          coverUrl: finalCoverUrl,
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
          <DialogTitle>编辑专辑信息</DialogTitle>
          <DialogDescription>修改专辑的基本信息和封面</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">专辑名称 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例如：Imagine"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artist">歌手 *</Label>
            <Input
              id="artist"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              placeholder="例如：John Lennon"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">发行年份（可选）</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="2024"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverFile">专辑封面（可选）</Label>
            <Input
              id="coverFile"
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, coverFile: e.target.files?.[0] || null })}
            />
            {formData.coverUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">当前封面：</p>
                <img
                  src={formData.coverUrl}
                  alt="封面预览"
                  className="w-24 h-24 object-cover rounded-lg"
                />
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
