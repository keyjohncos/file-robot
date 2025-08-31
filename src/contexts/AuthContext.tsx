'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginForm, AuthContextType, PracticeRecord } from '@/types/user';

// 预设的管理员账户
const ADMIN_USER: User = {
  id: 'admin-001',
  username: 'keyjohnco',
  password: '101301',
  role: 'admin',
  createdAt: new Date('2024-01-01'),
};

// 模拟数据库存储
const USERS_KEY = 'file-matcher-users';
const PRACTICE_RECORDS_KEY = 'file-matcher-practice-records';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查本地存储的用户
  useEffect(() => {
    const savedUser = localStorage.getItem('file-matcher-current-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('file-matcher-current-user');
      }
    }
    setIsLoading(false);
  }, []);

  // 初始化用户数据库
  useEffect(() => {
    const existingUsers = localStorage.getItem(USERS_KEY);
    if (!existingUsers) {
      const initialUsers = [ADMIN_USER];
      localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    }
  }, []);

  const login = async (form: LoginForm): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      
      // 查找用户
      let foundUser = users.find((u: User) => u.username === form.username);
      
      if (!foundUser) {
        // 如果是新学生用户，创建账户（无需密码）
        if (!form.password) {
          const newStudent: User = {
            id: `student-${Date.now()}`,
            username: form.username,
            role: 'student',
            createdAt: new Date(),
          };
          
          users.push(newStudent);
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
          foundUser = newStudent;
        } else {
          return false; // 用户名不存在且提供了密码
        }
      } else {
        // 用户存在，检查密码
        if (foundUser.password && foundUser.password !== form.password) {
          return false; // 密码错误
        }
        
        // 更新最后登录时间
        foundUser.lastLoginAt = new Date();
        const userIndex = users.findIndex((u: User) => u.id === foundUser.id);
        users[userIndex] = foundUser;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }

      // 保存当前用户到本地存储
      localStorage.setItem('file-matcher-current-user', JSON.stringify(foundUser));
      setUser(foundUser);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('file-matcher-current-user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
