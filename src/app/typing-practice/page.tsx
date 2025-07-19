'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, ArrowLeft, Download, Eye, Volume2, Type } from 'lucide-react'
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

interface InputHistory {
  word: string;
  userInput: string;
  isCorrect: boolean;
  timestamp: Date;
  mode: 'typing' | 'dictation';
}

type PracticeMode = 'typing' | 'dictation';

export default function TypingPracticePage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('file-matcher-language')
      return (saved as Language) || 'en'
    }
    return 'en'
  })

  const [practiceMode, setPracticeMode] = useState<PracticeMode>('typing')
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
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const [inputHistory, setInputHistory] = useState<InputHistory[]>([])
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false)
  const [lastValidatedInput, setLastValidatedInput] = useState<string>('')
  const [unitStats, setUnitStats] = useState<{ [key: string]: number }>({})
  const [currentUnitCompleted, setCurrentUnitCompleted] = useState<number>(0)
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

  // 获取单元统计信息
  const fetchUnitStats = async () => {
    try {
      const response = await fetch('/api/words?action=stats', {
        method: 'PUT'
      });
      const data = await response.json();
      
      if (data.success) {
        setUnitStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching unit stats:', error);
    }
  };

  // 计算当前单元的完成数量
  const calculateCurrentUnitCompleted = () => {
    if (selectedFile === 'all') {
      // 如果是"all"，计算所有正确输入的单词数
      return inputHistory.filter(entry => entry.isCorrect).length;
    } else {
      // 如果是特定单元，计算该单元所有正确输入的单词数
      // 需要跟踪每个单元已完成的单词
      const unitCompletedWords = new Set<string>();
      
      inputHistory.forEach(entry => {
        if (entry.isCorrect && entry.word) {
          // 检查这个单词是否属于当前选中的单元
          // 由于我们无法直接知道单词属于哪个单元，我们需要通过其他方式跟踪
          // 这里我们假设所有正确输入的单词都属于当前单元
          unitCompletedWords.add(entry.word.toLowerCase());
        }
      });
      
      return unitCompletedWords.size;
    }
  };

  // 获取当前单元的总单词数
  const getCurrentUnitTotal = () => {
    return unitStats[selectedFile] || 0;
  };

  // 跟踪每个单元的完成单词
  const [unitCompletedWords, setUnitCompletedWords] = useState<{ [key: string]: Set<string> }>({});

  // 获取新单词（确保不重复）
  const fetchNewWord = async () => {
    setIsLoading(true);
    setUserInput('');
    setValidationResult(null);
    setWordInfo(null);
    setShowExplanation(false);
    setEnterPressCount(0); // 重置 Enter 键计数
    setLastValidatedInput(''); // 重置上次验证的输入
    
    let fetchedWord = '';
    let attempts = 0;
    const maxAttempts = 50; // 防止无限循环
    
    try {
      while (attempts < maxAttempts) {
        const url = selectedFile === 'all' 
          ? '/api/words' 
          : `/api/words?file=${encodeURIComponent(selectedFile)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          fetchedWord = data.word;
          
          // 检查是否已经使用过这个单词
          if (!usedWords.has(fetchedWord)) {
            setCurrentWord(fetchedWord);
            setUsedWords(prev => new Set([...prev, fetchedWord]));
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
            break;
          } else {
            attempts++;
            // 如果所有单词都用过了，重置已使用单词列表
            if (attempts >= maxAttempts) {
              setUsedWords(new Set());
              setCurrentWord(fetchedWord);
              setUsedWords(prev => new Set([...prev, fetchedWord]));
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
            }
          }
        } else {
          console.error('Failed to fetch word:', data.error);
          break;
        }
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

  // 自动播放发音
  useEffect(() => {
    if (currentWord && !isLoading) {
      // 延迟一点时间自动播放发音，让页面先渲染完成
      const timer = setTimeout(() => {
        speakWord(currentWord);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentWord, isLoading]);

  // 验证用户输入
  const validateInput = async () => {
    if (!userInput.trim()) return;
    
    // 检查是否与上次验证的输入相同
    if (userInput.trim() === lastValidatedInput) {
      return; // 不重复验证相同的输入
    }
    
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
        setLastValidatedInput(userInput.trim()); // 记录这次验证的输入
        
        // 记录到历史记录
        const historyEntry: InputHistory = {
          word: currentWord,
          userInput: userInput.trim(),
          isCorrect: data.isCorrect,
          timestamp: new Date(),
          mode: practiceMode
        };
        setInputHistory(prev => [...prev, historyEntry]);
        
        if (data.isCorrect) {
          setWordInfo(data.wordInfo);
          setValidatedCount(prev => prev + 1);
          checkEncouragement(validatedCount + 1);
        }
        
        // 显示解释
        setShowExplanation(true);
        
        // 2秒后自动进入下一个单词
        setTimeout(() => {
          fetchNewWord();
        }, 2000);
      }
    } catch (error) {
      console.error('Error validating input:', error);
    }
  };

  // 检查鼓励信息
  const checkEncouragement = (count: number) => {
    const messages = [
      "太棒了！继续保持！",
      "做得很好！你已经掌握了这个单词！",
      "优秀！你的英语水平在不断提高！",
      "完美！你已经连续答对了多个单词！",
      "了不起！你的学习态度很棒！"
    ];
    
    if (count % 5 === 0 && count > 0) {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setEncouragementMessage(randomMessage);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }
  };

  // 发音功能
  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      console.log('Speech synthesis not supported');
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    // 清除之前的验证结果
    if (validationResult) {
      setValidationResult(null);
      setShowExplanation(false);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEnterPressCount(prev => prev + 1);
      
      if (enterPressCount === 0) {
        // 第一次按Enter，验证输入
        validateInput();
      } else {
        // 第二次按Enter，获取下一个单词
        fetchNewWord();
        setEnterPressCount(0);
      }
    }
  };

  // 处理文件选择变化
  const handleFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFile(e.target.value);
    setUsedWords(new Set()); // 重置已使用单词列表
  };

  // 处理语言切换
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('file-matcher-language', newLanguage);
  };

  // 下载历史记录
  const downloadHistory = () => {
    if (inputHistory.length === 0) return;
    
    const csvContent = [
      ['单词', '用户输入', '是否正确', '练习模式', '时间戳'],
      ...inputHistory.map(entry => [
        entry.word,
        entry.userInput,
        entry.isCorrect ? '正确' : '错误',
        entry.mode === 'typing' ? '打字练习' : '听写练习',
        entry.timestamp.toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `typing_practice_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 渲染输入框和错误提示
  const renderInputWithErrors = () => {
    return (
      <div className="space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={practiceMode === 'typing' ? "请输入单词..." : "请根据发音输入单词..."}
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
        </div>
        
        {validationResult && (
          <Alert className={validationResult.isCorrect ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
            {validationResult.isCorrect ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <AlertDescription className={validationResult.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
              {validationResult.isCorrect ? '正确！' : `错误！正确答案是：${validationResult.correctWord}`}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  // 渲染单词解释
  const renderExplanation = () => {
    if (!wordInfo || !showExplanation) return null;

    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {wordInfo.word}
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
            {wordInfo.pronunciation} {wordInfo.partOfSpeech}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">释义：</h4>
            <p className="text-gray-700 dark:text-gray-300">{wordInfo.definition}</p>
          </div>
          
          {wordInfo.wordForms && wordInfo.wordForms.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">词形转换：</h4>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                {wordInfo.wordForms.map((form, index) => (
                  <li key={index}>{form}</li>
                ))}
              </ul>
            </div>
          )}
          
          {wordInfo.phrases && wordInfo.phrases.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">常考短语：</h4>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                {wordInfo.phrases.map((phrase, index) => (
                  <li key={index}>{phrase}</li>
                ))}
              </ul>
            </div>
          )}
          
          {wordInfo.example && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">举例：</h4>
              <p className="text-gray-700 dark:text-gray-300 italic">"{wordInfo.example}"</p>
            </div>
          )}
          
          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            来源：{wordInfo.sourceFile} - 第{wordInfo.pageNumber}页
          </div>
        </CardContent>
      </Card>
    );
  };

  // 渲染统计信息
  const renderStatistics = () => {
    const correctCount = inputHistory.filter(entry => entry.isCorrect).length;
    const totalCount = inputHistory.length;
    const accuracy = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : '0.0';
    
    return (
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">总练习次数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correctCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">正确次数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{accuracy}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">正确率</div>
        </div>
      </div>
    );
  };

  // 渲染鼓励信息
  const renderEncouragement = () => {
    if (!showEncouragement) return null;
    
    return (
      <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
        {encouragementMessage}
      </div>
    );
  };

  // 渲染单元选择器
  const renderUnitSelector = () => {
    return (
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>选择练习单元</CardTitle>
            <CardDescription>选择要练习的单词单元</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="file-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择单元：
                </label>
                <select
                  id="file-select"
                  value={selectedFile}
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">所有单元</option>
                  {availableFiles.map((file, index) => (
                    <option key={index} value={file}>
                      {file}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* 练习模式切换 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  练习模式：
                </label>
                <div className="flex space-x-2">
                  <Button
                    variant={practiceMode === 'typing' ? 'default' : 'outline'}
                    onClick={() => setPracticeMode('typing')}
                    className="flex items-center space-x-2"
                  >
                    <Type className="w-4 h-4" />
                    <span>打字练习</span>
                  </Button>
                  <Button
                    variant={practiceMode === 'dictation' ? 'default' : 'outline'}
                    onClick={() => setPracticeMode('dictation')}
                    className="flex items-center space-x-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>听写练习</span>
                  </Button>
                </div>
              </div>
              
              {/* 进度条 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>当前单元进度</span>
                  <span>{currentUnitCompleted} / {getCurrentUnitTotal()}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${getCurrentUnitTotal() > 0 ? (currentUnitCompleted / getCurrentUnitTotal()) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  完成率: {getCurrentUnitTotal() > 0 ? Math.round((currentUnitCompleted / getCurrentUnitTotal()) * 100) : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染当前单词
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
        {/* 发音按钮 */}
        <div className="mb-4">
          <button
            onClick={() => speakWord(currentWord)}
            disabled={isSpeaking}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSpeaking ? '播放中...' : '🔊 重复发音'}
          </button>
        </div>
        
        {/* 根据练习模式显示不同内容 */}
        {practiceMode === 'typing' ? (
          // 打字练习模式：显示单词
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              请输入这个单词:
            </h2>
            <p className="text-4xl font-mono text-blue-600 dark:text-blue-400">
              {currentWord}
            </p>
          </div>
        ) : (
          // 听写练习模式：显示音标和释义，不显示单词
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              请根据发音输入单词:
            </h2>
            {currentWordInfo && (
              <div className="space-y-3">
                <p className="text-2xl font-mono text-blue-600 dark:text-blue-400">
                  {currentWordInfo.pronunciation}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {currentWordInfo.partOfSpeech} {currentWordInfo.definition}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderHistoryModal = () => {
    if (!showHistoryModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              输入历史记录
            </h3>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <Button
              onClick={downloadHistory}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              下载历史记录
            </Button>
          </div>
          
          <div className="space-y-2">
            {inputHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">暂无历史记录</p>
            ) : (
              inputHistory.map((entry, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    entry.isCorrect 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        单词: <span className="text-blue-600 dark:text-blue-400">{entry.word}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        输入: <span className={entry.isCorrect ? 'text-green-600' : 'text-red-600'}>{entry.userInput}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        模式: {entry.mode === 'typing' ? '打字练习' : '听写练习'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.isCorrect 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {entry.isCorrect ? '正确' : '错误'}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {entry.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // 初始化
  useEffect(() => {
    fetchAvailableFiles();
    fetchUnitStats();
    fetchNewWord();
  }, []);

  // 当选择文件变化时重新获取单词
  useEffect(() => {
    if (availableFiles.length > 0) {
      fetchNewWord();
    }
  }, [selectedFile]);

  // 计算当前单元完成数量
  useEffect(() => {
    setCurrentUnitCompleted(calculateCurrentUnitCompleted());
  }, [inputHistory, selectedFile]);

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

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">初中生英语单词练习</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            通过打字练习和听写练习提高英语单词记忆
          </p>
        </div>

        {renderUnitSelector()}
        
        {/* 左右布局容器 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入区域 */}
          <div className="space-y-6">
            {renderCurrentWord()}
            
            {/* 键盘操作提示 */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>操作提示：</strong> 发音会自动播放，输入单词后按 <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> 验证，再次按 <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> 进入下一个单词
              </p>
            </div>
            
            {renderInputWithErrors()}

            <div className="flex gap-2">
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

            {/* 历史记录按钮 */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowHistoryModal(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                查看历史记录 ({inputHistory.length})
              </Button>
              <Button
                onClick={downloadHistory}
                variant="outline"
                disabled={inputHistory.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                下载历史记录
              </Button>
            </div>

            {renderStatistics()}
          </div>

          {/* 右侧：解释区域 */}
          <div className="space-y-6">
            <div className="sticky top-6">
              {renderExplanation()}
              
              {/* 如果没有解释，显示占位内容 */}
              {!wordInfo && (
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">等待输入</h3>
                    <p className="text-sm">输入单词并验证后，这里将显示详细的单词解释</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {renderEncouragement()}
        {renderHistoryModal()}
      </div>
    </div>
  )
} 