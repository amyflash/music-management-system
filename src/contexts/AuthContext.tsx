'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 写死的用户信息
const USER = {
  username: 'harrietlq',
  password: '1q2w3e4r',
  name: '音乐管理员'
};

// 简单的登录 token（单用户场景）
const LOGGED_IN_TOKEN = 'LOGGED_IN';

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

    if (savedAuth === 'true' && savedToken === LOGGED_IN_TOKEN) {
      setIsAuthenticated(true);
      setUser(USER);
      setToken(savedToken);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === USER.username && password === USER.password) {
      setIsAuthenticated(true);
      setUser(USER);
      setToken(LOGGED_IN_TOKEN);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', LOGGED_IN_TOKEN);
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
