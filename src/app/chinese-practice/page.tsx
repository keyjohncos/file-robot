'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import ChineseCharacterPractice from '@/components/ChineseCharacterPractice'
import LoginForm from '@/components/LoginForm'

export default function ChinesePracticePage() {
  const { user } = useAuth();
  
  // 如果用户未登录，显示登录页面
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                汉字练习
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <ChineseCharacterPractice />
      </main>
    </div>
  )
} 