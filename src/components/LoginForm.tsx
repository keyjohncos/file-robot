'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStudentMode, setIsStudentMode] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login({
        username: username.trim(),
        password: isStudentMode ? undefined : password,
      });

      if (!success) {
        setError(isStudentMode 
          ? '登录失败，请检查用户名' 
          : '用户名或密码错误'
        );
      }
    } catch (err) {
      setError('登录过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsStudentMode(!isStudentMode);
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-800 mb-4">学习工具集</h1>
          <p className="text-xl text-gray-600">选择您需要的功能</p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：登录表单 */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-indigo-800">
                  {isStudentMode ? '学生登录' : '管理员登录'}
                </CardTitle>
                <CardDescription>
                  {isStudentMode 
                    ? '输入用户名即可登录，无需密码' 
                    : '请输入管理员账户和密码'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="请输入用户名"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {!isStudentMode && (
                    <div className="space-y-2">
                      <Label htmlFor="password">密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="请输入密码"
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? '登录中...' : '登录'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                  >
                    {isStudentMode ? '切换到管理员登录' : '切换到学生登录'}
                  </button>
                </div>

                {isStudentMode && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 学生账户特点：
                    </p>
                    <ul className="text-xs text-blue-600 mt-1 space-y-1">
                      <li>• 无需密码，输入用户名即可登录</li>
                      <li>• 自动创建新账户</li>
                      <li>• 练习记录会永久保存</li>
                    </ul>
                  </div>
                )}

                {!isStudentMode && (
                  <div className="mt-4 p-2 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      🔑 管理员账户：
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      请联系系统管理员获取账户信息
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：文件匹配工具 */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-blue-800 flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  文件匹配工具
                </CardTitle>
                <CardDescription>
                  无需登录，直接使用文件匹配功能
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800">功能特点</h3>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• 支持多种文件格式</li>
                      <li>• 智能内容匹配</li>
                      <li>• 快速搜索和筛选</li>
                      <li>• 无需注册登录</li>
                    </ul>
                  </div>
                </div>

                <Button 
                  onClick={() => window.location.href = '/file-matcher'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  立即使用文件匹配工具
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    💡 其他学习工具需要登录后才能使用
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            选择登录以使用完整的学习工具，或直接使用文件匹配功能
          </p>
        </div>
      </div>
    </div>
  );
}
