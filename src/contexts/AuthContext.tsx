'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 写死的用户信息
const USER = {
  username: 'admin',
  password: 'admin',
  name: '音乐管理员'
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: typeof USER | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<typeof USER | null>(null);

  useEffect(() => {
    // 检查 localStorage 中是否有登录状态
    const savedAuth = localStorage.getItem('isAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      setUser(USER);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === USER.username && password === USER.password) {
      setIsAuthenticated(true);
      setUser(USER);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
