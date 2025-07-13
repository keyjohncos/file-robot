'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Search, Loader2, Send, FileText, Package } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import LanguageToggle from '@/components/language-toggle'
import { Language, translations } from '@/lib/i18n'

interface ProductResult {
  fileName: string;
  productCode: string;
  relevance: number;
  summary: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function FindProductsPage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('file-matcher-language')
      return (saved as Language) || 'en'
    }
    return 'en'
  })

  const [userInput, setUserInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [currentResults, setCurrentResults] = useState<ProductResult[]>([])
  const [error, setError] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const t = translations[language]

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  // 处理用户输入提交
  const handleSubmit = async () => {
    if (!userInput.trim() || isLoading) return

    const userMessage = userInput.trim()
    setUserInput('')
    setIsLoading(true)
    setError('')

    // 添加用户消息到聊天历史
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setChatHistory(prev => [...prev, newUserMessage])

    try {
      const response = await fetch('/api/find-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          chatHistory: chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      const data = await response.json()

      if (data.success) {
        // 添加AI回复到聊天历史
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
        setChatHistory(prev => [...prev, aiMessage])
        setCurrentResults(data.results || [])
      } else {
        setError(data.error || '搜索失败，请重试')
      }
    } catch (error) {
      console.error('Error searching products:', error)
      setError('网络错误，请检查连接后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理回车键提交
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    if (typeof window !== 'undefined') {
      localStorage.setItem('file-matcher-language', newLanguage)
    }
  }

  // 清空聊天历史
  const clearChat = () => {
    setChatHistory([])
    setCurrentResults([])
    setError('')
  }

  // 渲染聊天消息
  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user'
    
    return (
      <div
        key={index}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[80%] rounded-lg p-4 ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          }`}
        >
          <div className="flex items-start gap-2">
            {!isUser && (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Search className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="flex-1">
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            {isUser && (
              <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <Package className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 渲染产品结果
  const renderProductResults = () => {
    if (currentResults.length === 0) return null

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          找到的产品 ({currentResults.length})
        </h3>
        <div className="grid gap-4">
          {currentResults.map((product, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-blue-600 dark:text-blue-400">
                    {product.productCode}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      相关度: {Math.round(product.relevance * 100)}%
                    </span>
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  {product.fileName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {product.summary}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Find Products
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

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">AI 产品搜索</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            通过自然语言描述搜索匹配的产品
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 聊天区域 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  AI 产品助手
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className="text-xs"
                >
                  清空对话
                </Button>
              </div>
              <CardDescription>
                描述您需要的产品特性，AI将帮您找到匹配的产品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">开始搜索产品</p>
                    <p className="text-sm">例如：</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• "leveling agent"</li>
                      <li>• "Silicone or Silicone Free"</li>
                      <li>• "water based"</li>
                      <li>• "defoamer for water based coatings"</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((message, index) => renderMessage(message, index))}
                    {isLoading && (
                      <div className="flex justify-start mb-4">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-gray-600 dark:text-gray-400">AI正在搜索...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 错误提示 */}
              {error && (
                <Alert className="mb-4">
                  <AlertDescription className="text-red-600 dark:text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* 输入区域 */}
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="描述您需要的产品特性..."
                  className="flex-1 min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !userInput.trim()}
                  className="px-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 产品结果 */}
          {renderProductResults()}
        </div>
      </div>
    </div>
  )
} 