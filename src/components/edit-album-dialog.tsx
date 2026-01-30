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

    if (!formData.title || !formData.artist || !formData.year) {
      alert('请填写所有必要信息');
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
          year: formData.year,
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
            <Label htmlFor="year">发行年份 *</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="2024"
              required
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
