'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 写死的用户信息
const USER = {
  username: 'harrietlq',
  password: '1q2w3e4r',
  name: '音乐管理员'
};

// 生成简单的 token（基于用户名和时间戳）
function generateToken(username: string): string {
  const timestamp = Date.now();
  const data = `${username}-${timestamp}`;
  return Buffer.from(data).toString('base64');
}

// 验证 token（简单实现，生产环境应使用 JWT）
function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [username] = decoded.split('-');
    return username === USER.username;
  } catch {
    return false;
  }
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: typeof USER | null;
  token: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<typeof USER | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 检查 localStorage 中是否有登录状态和 token
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedToken = localStorage.getItem('token');

    if (savedAuth === 'true' && savedToken && verifyToken(savedToken)) {
      setIsAuthenticated(true);
      setUser(USER);
      setToken(savedToken);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === USER.username && password === USER.password) {
      const newToken = generateToken(username);
      setIsAuthenticated(true);
      setUser(USER);
      setToken(newToken);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', newToken);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
