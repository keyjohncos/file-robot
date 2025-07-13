'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSearch, Keyboard, ArrowRight, Search } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import LanguageToggle from '@/components/language-toggle'
import { Language, translations } from '@/lib/i18n'

export default function HomePage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('file-matcher-language')
      return (saved as Language) || 'en'
    }
    return 'en'
  })

  const t = translations[language]

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    if (typeof window !== 'undefined') {
      localStorage.setItem('file-matcher-language', newLanguage)
    }
  }

  const navigateToFeature = (feature: string) => {
    if (feature === 'file-matcher') {
      window.location.href = '/file-matcher'
    } else if (feature === 'typing-practice') {
      window.location.href = '/typing-practice'
    } else if (feature === 'find-products') {
      window.location.href = '/find-products'
    }
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
            Your comprehensive platform for file management, English learning, and AI-powered product search
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => navigateToFeature('typing-practice')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Keyboard className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                English Practice
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
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigateToFeature('typing-practice')}
              >
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Find Products Feature */}
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => navigateToFeature('find-products')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Find Products
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                AI产品搜索
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                AI-powered product search tool that analyzes PDF documents to find 
                matching products based on your requirements.
              </p>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => navigateToFeature('find-products')}
              >
                Search Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
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
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI Product Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find products using natural language with AI-powered analysis
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


