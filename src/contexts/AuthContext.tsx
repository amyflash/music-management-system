'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. 定义用户信息接口
interface User {
  name: string;
  username: string;
  role?: string;
}

// 2. 定义 Context 包含的属性和方法
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;   // 修复编译错误：显式包含 token
  loading: boolean;      // 加载状态，防止页面闪烁
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. 后端接口地址 (根据你的 Python 后端配置调整)
const API_URL = 'https://auth.516768.xyz/api/login';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：从本地存储恢复状态
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    console.log('[AuthContext] 初始化:', { savedToken: savedToken ? '存在' : '不存在', savedUser });

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('[AuthContext] 恢复登录状态:', { username: parsedUser.username });
        setToken(savedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('[AuthContext] 解析本地用户信息失败', error);
        // 如果解析失败，清理错误的本地数据
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('[AuthContext] 未找到本地登录信息');
    }
    setLoading(false);
  }, []);

  // 登录方法
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // 1. 更新本地存储 (持久化)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 2. 更新 React 状态
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        // 返回后端 FastAPI 抛出的具体错误信息 (例如: detail: "用户名或密码错误")
        return { success: false, message: data.detail || '登录失败，请检查账号密码' };
      }
    } catch (error) {
      console.error('Login Request Error:', error);
      return { success: false, message: '无法连接到认证服务器，请检查网络或后端状态' };
    }
  };

  // 登出方法
  const logout = () => {
    // 1. 清理状态
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    
    // 2. 清理本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 3. 可选：重定向到登录页
    // window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, loading, login, logout }}>
      {/* 只有在加载检查完成后才渲染子组件，避免未授权内容闪烁 */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 4. 自定义 Hook 方便在其他组件调用
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
}
