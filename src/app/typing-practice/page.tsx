'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import LanguageToggle from '@/components/language-toggle'
import { Language, translations } from '@/lib/i18n'

interface WordInfo {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  phrases: string[];
  example: string;
  sourceFile: string;
  pageNumber: number;
  wordForms?: string[];
}

interface ValidationResult {
  isCorrect: boolean;
  errorPositions?: number[];
  correctWord?: string;
  wordInfo?: WordInfo;
}

export default function TypingPracticePage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('file-matcher-language')
      return (saved as Language) || 'en'
    }
    return 'en'
  })

  const [currentWord, setCurrentWord] = useState<string>('')
  const [userInput, setUserInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null)
  const [showExplanation, setShowExplanation] = useState<boolean>(false)
  const [currentWordInfo, setCurrentWordInfo] = useState<WordInfo | null>(null)
  const [availableFiles, setAvailableFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<string>('all')
  const [validatedCount, setValidatedCount] = useState<number>(0)
  const [showEncouragement, setShowEncouragement] = useState<boolean>(false)
  const [encouragementMessage, setEncouragementMessage] = useState<string>('')
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [enterPressCount, setEnterPressCount] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const t = translations[language]

  // 获取可用文件列表
  const fetchAvailableFiles = async () => {
    try {
      const response = await fetch('/api/words', {
        method: 'PUT'
      });
      const data = await response.json();
      
      if (data.success) {
        setAvailableFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // 获取新单词
  const fetchNewWord = async () => {
    setIsLoading(true);
    setUserInput('');
    setValidationResult(null);
    setWordInfo(null);
    setShowExplanation(false);
    setEnterPressCount(0); // 重置 Enter 键计数
    
    try {
      const url = selectedFile === 'all' 
        ? '/api/words' 
        : `/api/words?file=${encodeURIComponent(selectedFile)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setCurrentWord(data.word);
        setCurrentWordInfo({
          word: data.word,
          pronunciation: data.pronunciation,
          partOfSpeech: data.partOfSpeech,
          definition: data.definition,
          phrases: data.phrases,
          example: data.example,
          sourceFile: data.sourceFile,
          pageNumber: data.pageNumber
        });
      } else {
        console.error('Failed to fetch word:', data.error);
      }
    } catch (error) {
      console.error('Error fetching word:', error);
    } finally {
      setIsLoading(false);
      // 自动聚焦到输入框
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // 验证用户输入
  const validateInput = async () => {
    if (!userInput.trim()) return;
    
    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput.trim(),
          correctWord: currentWord,
          selectedFile: selectedFile
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setValidationResult(data);
        
        if (data.isCorrect) {
          setWordInfo(data.wordInfo);
          setShowExplanation(true);
          
          const newCount = validatedCount + 1;
          setValidatedCount(newCount);
          
          checkEncouragement(newCount);
        }
      }
    } catch (error) {
      console.error('Error validating input:', error);
    }
  };

  // 检查激励消息
  const checkEncouragement = (count: number) => {
    if (count === 20) {
      setEncouragementMessage('你好棒！完成了20个啦');
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 5000);
    } else if (count === 50) {
      setEncouragementMessage('加油，如果按1元一个单词的话，你赚了50元了');
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 5000);
    } else if (count === 100) {
      setEncouragementMessage('不要这么努力呀，你同学快跟不上你了，去休息一下');
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 5000);
    }
  };

  // 播放单词发音
  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('您的浏览器不支持语音合成功能');
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    if (validationResult) {
      setValidationResult(null);
    }
    
    // 当用户开始输入时，重置 Enter 键计数
    if (enterPressCount > 0) {
      setEnterPressCount(0);
    }
  };

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (enterPressCount === 0) {
        // 第一次按 Enter：验证
        validateInput();
        setEnterPressCount(1);
      } else {
        // 第二次按 Enter：下一个单词
        fetchNewWord();
      }
    }
  };

  // 处理文件选择变化
  const handleFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFile(e.target.value);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    if (typeof window !== 'undefined') {
      localStorage.setItem('file-matcher-language', newLanguage)
    }
  }

  // 初始化打字练习
  useEffect(() => {
    fetchAvailableFiles();
    fetchNewWord();
  }, []);

  // 当加载完成时自动聚焦到输入框
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // 渲染带错误标记的输入框
  const renderInputWithErrors = () => {
    if (!validationResult || validationResult.isCorrect) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="请输入单词..."
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          disabled={isLoading}
        />
      );
    }

    const { errorPositions = [], correctWord = '' } = validationResult;
    const inputArray = userInput.split('');
    const correctArray = correctWord.split('');

    return (
      <div className="w-full px-4 py-3 text-lg border-2 border-red-500 rounded-lg bg-white dark:bg-gray-800">
        <div className="flex flex-wrap">
          {inputArray.map((char, index) => {
            const isError = errorPositions.includes(index);
            const isCorrect = index < correctArray.length && char === correctArray[index];
            
            return (
              <span
                key={index}
                className={`${isError ? 'text-red-500 bg-red-100 dark:bg-red-900' : ''} ${
                  isCorrect ? 'text-green-600' : ''
                }`}
              >
                {char}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const renderExplanation = () => {
    if (!wordInfo) return null;

    return (
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          单词解释
        </h3>
        <div className="space-y-2 text-sm">
          <p><strong>单词:</strong> {wordInfo.word}</p>
          <p><strong>音标:</strong> {wordInfo.pronunciation}</p>
          <p><strong>词性:</strong> {wordInfo.partOfSpeech}</p>
          <p><strong>定义:</strong> {wordInfo.definition}</p>
          {wordInfo.phrases && wordInfo.phrases.length > 0 && (
            <div>
              <p><strong>常考短语:</strong></p>
              <ul className="list-disc list-inside ml-4">
                {wordInfo.phrases.map((phrase, index) => (
                  <li key={index}>{phrase}</li>
                ))}
              </ul>
            </div>
          )}
          {wordInfo.wordForms && wordInfo.wordForms.length > 0 && (
            <div>
              <p><strong>词形转换:</strong></p>
              <ul className="list-disc list-inside ml-4">
                {wordInfo.wordForms.map((form, index) => (
                  <li key={index}>{form}</li>
                ))}
              </ul>
            </div>
          )}
          {wordInfo.example && (
            <p><strong>例句:</strong> {wordInfo.example}</p>
          )}
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    return (
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          已完成: {validatedCount} 个单词
        </p>
      </div>
    );
  };

  const renderEncouragement = () => {
    if (!showEncouragement) return null;

    return (
      <div className="fixed top-4 right-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 shadow-lg z-50">
        <p className="text-yellow-800 dark:text-yellow-200 font-medium">
          {encouragementMessage}
        </p>
      </div>
    );
  };

  const renderUnitSelector = () => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          选择学习单元:
        </label>
        <select
          value={selectedFile}
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="all">所有单元</option>
          {availableFiles.map((file) => (
            <option key={file} value={file}>
              {file}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderCurrentWord = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="mb-4">
          <button
            onClick={() => speakWord(currentWord)}
            disabled={isSpeaking}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSpeaking ? '播放中...' : '🔊 听发音'}
          </button>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            请输入这个单词:
          </h2>
          <p className="text-4xl font-mono text-blue-600 dark:text-blue-400">
            {currentWord}
          </p>
        </div>
      </div>
    );
  };

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
                English Practice
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

      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">初中生英语单词练习</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            通过打字练习提高英语单词记忆
          </p>
        </div>

        {renderUnitSelector()}
        {renderCurrentWord()}
        
        {/* 键盘操作提示 */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>键盘操作提示：</strong> 输入单词后按 <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> 验证，再次按 <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> 进入下一个单词
          </p>
        </div>
        
        {renderInputWithErrors()}

        <div className="mt-4 flex gap-2">
          <Button
            onClick={validateInput}
            disabled={isLoading || !userInput.trim()}
            className="flex-1"
          >
            验证 (Enter)
          </Button>
          <Button
            onClick={fetchNewWord}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            下一个单词 (Enter)
          </Button>
        </div>

        {renderExplanation()}
        {renderStatistics()}
        {renderEncouragement()}
      </div>
    </div>
  )
} 