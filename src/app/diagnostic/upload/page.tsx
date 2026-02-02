'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  details?: string;
}

export default function UploadDiagnosticPage() {
  const { token } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const testUpload = async (fileType: 'image' | 'audio') => {
    // 创建测试文件
    const file = fileType === 'image'
      ? new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      : new File(['test'], 'test.mp3', { type: 'audio/mpeg' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '上传失败');
      }

      // 检查是否为 Serverless 环境
      if (data.isTemporary && data.warning) {
        addResult({
          type: 'warning',
          title: '检测到 Serverless 环境',
          message: '文件上传成功，但使用的是临时存储',
          details: data.warning + '\n\n您需要配置对象存储服务（OSS/S3/COS）来实现持久化存储。\n\n请参考：SERVERLESS_UPLOAD.md'
        });
      } else if (data.url) {
        addResult({
          type: 'success',
          title: '文件上传成功',
          message: `文件已保存到：${data.url}`,
          details: '环境支持文件持久化存储，无需配置对象存储。'
        });
      } else if (data.dataUrl) {
        addResult({
          type: 'warning',
          title: 'Serverless 环境（图片）',
          message: '图片已转换为 base64 格式',
          details: '图片可以正常显示，但音频文件无法持久化。\n\n请配置对象存储服务。'
        });
      }
    } catch (error) {
      addResult({
        type: 'error',
        title: '文件上传失败',
        message: '上传过程中发生错误',
        details: (error as Error).message
      });
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    if (!token) {
      addResult({
        type: 'error',
        title: '未登录',
        message: '请先登录后测试',
        details: '上传功能需要登录才能使用'
      });
      setTesting(false);
      return;
    }

    addResult({
      type: 'success',
      title: '开始测试',
      message: '正在测试文件上传功能...',
      details: '请稍候...'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // 测试图片上传
    await testUpload('image');
    await new Promise(resolve => setTimeout(resolve, 500));

    // 测试音频上传
    await testUpload('audio');

    setTesting(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getIcon = (type: TestResult['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getAlertVariant = (type: TestResult['type']) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* 标题 */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white">文件上传诊断工具</h1>
            <p className="text-slate-300">
              测试文件上传功能，检查是否为 Serverless 环境
            </p>
          </div>

          {/* 操作按钮 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={runAllTests}
                  disabled={testing || !token}
                  className="min-w-[200px]"
                >
                  {testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      测试中...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      运行测试
                    </>
                  )}
                </Button>
                <Button
                  onClick={clearResults}
                  variant="outline"
                  disabled={testing || results.length === 0}
                >
                  清除结果
                </Button>
              </div>
              {!token && (
                <p className="text-center text-sm text-slate-500 mt-4">
                  请先登录后才能测试上传功能
                </p>
              )}
            </CardContent>
          </Card>

          {/* 测试结果 */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <Alert key={index} variant={getAlertVariant(result.type)}>
                {getIcon(result.type)}
                <AlertTitle className="flex items-center gap-2">
                  {result.title}
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    <p className="text-slate-700 dark:text-slate-300">{result.message}</p>
                    {result.details && (
                      <pre className="mt-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                        {result.details}
                      </pre>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>

          {/* 使用说明 */}
          <Card>
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
              <CardDescription>如何理解测试结果</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">上传成功（本地/VPS）</p>
                    <p className="text-sm text-slate-500">
                      环境支持文件持久化存储，可以直接使用上传功能。
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium">检测到 Serverless 环境</p>
                    <p className="text-sm text-slate-500">
                      需要配置对象存储服务（OSS/S3/COS）。请参考
                      <a
                        href="/SERVERLESS_UPLOAD.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline mx-1"
                      >
                        SERVERLESS_UPLOAD.md
                      </a>
                      了解详细配置方法。
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">上传失败</p>
                    <p className="text-sm text-slate-500">
                      检查错误详情，可能是权限问题或环境配置错误。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 快速链接 */}
          <Card>
            <CardHeader>
              <CardTitle>相关文档</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/SERVERLESS_UPLOAD.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    📄 Serverless 环境文件上传解决方案
                  </a>
                </li>
                <li>
                  <a
                    href="/DEPLOYMENT_UPLOAD.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    📄 部署文件上传配置指南
                  </a>
                </li>
                <li>
                  <a
                    href="/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    📄 项目 README
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
