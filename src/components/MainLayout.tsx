'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  BookOpen, 
  Languages, 
  FileText, 
  Filter,
  BarChart3,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: '首页', href: '/', icon: Home },
    { name: '文件匹配', href: '/file-matcher', icon: Filter, public: true },
    { name: '中文练习', href: '/chinese-practice', icon: Languages },
    { name: '英文练习', href: '/typing-practice', icon: BookOpen },
    { name: '诗词练习', href: '/practice-poem', icon: FileText },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  if (!user) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-800">学习工具集</h1>
              </div>
              
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navigation.map((item) => {
                  if (!item.public && user.role !== 'admin') return null;
                  
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                        isActiveRoute(item.href)
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* 用户信息 */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? '管理员' : '学生'}
                  </Badge>
                </div>
                
                {/* 仪表板链接 */}
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {user.role === 'admin' ? '管理面板' : '个人中心'}
                  </Button>
                </Link>
                
                {/* 退出登录 */}
                <Button 
                  onClick={logout} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  退出
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 移动端导航 */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              if (!item.public && user.role !== 'admin') return null;
              
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActiveRoute(item.href)
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
