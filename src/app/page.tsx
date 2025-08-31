'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSearch, Keyboard, ArrowRight, BookOpen, BookText, Lock } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import LanguageToggle from '@/components/language-toggle'
import { Language, translations } from '@/lib/i18n'
import LoginForm from '@/components/LoginForm'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const [language, setLanguage] = useState<Language>('en')
  const [isClient, setIsClient] = useState(false)

  // 使用 useEffect 来处理客户端初始化
  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem('file-matcher-language')
    if (saved) {
      setLanguage(saved as Language)
    }
  }, [])

  const t = translations[language]

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    if (isClient) {
      localStorage.setItem('file-matcher-language', newLanguage)
    }
  }

  // 显示登录页面，如果用户未登录
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const navigateToFeature = (feature: string) => {
    // 文件匹配功能无需登录
    if (feature === 'file-matcher') {
      window.location.href = '/file-matcher'
    } else if (user) {
      // 其他功能需要登录
      if (feature === 'typing-practice') {
        window.location.href = '/typing-practice'
      } else if (feature === 'chinese-practice') {
        window.location.href = '/chinese-practice'
      } else if (feature === 'practice-poem') {
        window.location.href = '/practice-poem'
      }
    }
  }

  const isFeatureLocked = (feature: string) => {
    return feature !== 'file-matcher' && !user
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                File Robot
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageToggle 
                currentLanguage={language}
                onLanguageChange={handleLanguageChange}
              />
              <ThemeToggle />
                          </div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Poem Practice
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Practice Chinese poems with pinyin support and progress tracking
              </p>
            </div>
          </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to use File Robot
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your comprehensive platform for file management, English learning, and Chinese character practice
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* File Filter Feature */}
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" 
                onClick={() => navigateToFeature('file-matcher')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <FileSearch className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Filter Files
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                产品筛选
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Advanced file matching tool with drag-and-drop support, real file processing, 
                and ZIP download.
              </p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigateToFeature('file-matcher')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* English Practice Feature */}
          <Card className={`hover:shadow-lg transition-shadow duration-300 cursor-pointer ${isFeatureLocked('typing-practice') ? 'opacity-60' : ''}`}
                onClick={() => navigateToFeature('typing-practice')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4 relative">
                <Keyboard className="w-8 h-8 text-green-600 dark:text-green-400" />
                {isFeatureLocked('typing-practice') && (
                  <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                English Practice
                {isFeatureLocked('typing-practice') && <span className="text-red-500 ml-2">🔒</span>}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                初中生练习打字
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Interactive English word practice tool with real-time validation, 
                pronunciation support, and detailed word explanations.
              </p>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                onClick={() => navigateToFeature('typing-practice')}
                disabled={isFeatureLocked('typing-practice')}
              >
                {isFeatureLocked('typing-practice') ? '需要登录' : 'Start Learning'}
                {!isFeatureLocked('typing-practice') && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>

          {/* Chinese Practice Feature */}
          <Card className={`hover:shadow-lg transition-shadow duration-300 cursor-pointer ${isFeatureLocked('chinese-practice') ? 'opacity-60' : ''}`}
                onClick={() => navigateToFeature('chinese-practice')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4 relative">
                <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                {isFeatureLocked('chinese-practice') && (
                  <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Chinese Practice
                {isFeatureLocked('chinese-practice') && <span className="text-red-500 ml-2">🔒</span>}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                汉字练习
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Interactive Chinese character practice tool with Excel file support, 
                random character selection, and progress tracking.
              </p>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                onClick={() => navigateToFeature('chinese-practice')}
                disabled={isFeatureLocked('chinese-practice')}
              >
                {isFeatureLocked('chinese-practice') ? '需要登录' : 'Start Practice'}
                {!isFeatureLocked('chinese-practice') && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>

          {/* Poem Practice Feature */}
          <Card className={`hover:shadow-lg transition-shadow duration-300 cursor-pointer ${isFeatureLocked('practice-poem') ? 'opacity-60' : ''}`}
                onClick={() => navigateToFeature('practice-poem')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4 relative">
                <BookText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                {isFeatureLocked('practice-poem') && (
                  <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Poem Practice
                {isFeatureLocked('practice-poem') && <span className="text-red-500 ml-2">🔒</span>}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                诗词练习
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Interactive Chinese poem practice tool with pinyin support, 
                progress tracking, and comprehensive learning features.
              </p>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                onClick={() => navigateToFeature('practice-poem')}
                disabled={isFeatureLocked('practice-poem')}
              >
                {isFeatureLocked('practice-poem') ? '需要登录' : 'Start Practice'}
                {!isFeatureLocked('practice-poem') && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSearch className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Smart File Matching
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Match files by product codes with advanced filtering options
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Keyboard className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Interactive Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Practice English words with real-time feedback and pronunciation
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chinese Character Practice
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Practice Chinese characters with Excel file support and progress tracking
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Poem Practice
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Practice Chinese poems with pinyin support and progress tracking
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 File Robot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
