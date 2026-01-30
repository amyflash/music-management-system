import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '音乐管理 | 扣子编程',
    template: '%s | 扣子编程',
  },
  description: '一个优雅的音乐管理网站，支持在线播放音乐',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
