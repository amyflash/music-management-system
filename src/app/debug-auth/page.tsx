'use client';

import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    setDebugInfo({
      token: token ? `${token.substring(0, 50)}...` : 'null',
      tokenLength: token?.length || 0,
      user: user ? JSON.parse(user) : null,
    });
  }, []);

  const handleVerifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setVerifyResult({ error: '没有找到 token' });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('https://auth.516768.xyz/api/verify-token', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setVerifyResult({
        status: response.status,
        ok: response.ok,
        data: data,
      });
    } catch (error) {
      setVerifyResult({ error: (error as Error).message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">认证调试信息</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">localStorage 内容</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Token 验证测试</h2>
          <button
            onClick={handleVerifyToken}
            disabled={isVerifying}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isVerifying ? '验证中...' : '验证 Token'}
          </button>

          {verifyResult && (
            <pre className="mt-4 bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(verifyResult, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">操作</h2>
          <div className="space-y-2">
            <button
              onClick={handleClearStorage}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              清除所有 localStorage 并刷新
            </button>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">如果 Token 无效，请按以下步骤操作：</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>点击上方的"清除所有 localStorage 并刷新"按钮</li>
            <li>跳转到登录页面</li>
            <li>使用账号 <code>harrietlq</code> / <code>1q2w3e4r</code> 登录</li>
            <li>登录成功后，重新尝试上传文件</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
