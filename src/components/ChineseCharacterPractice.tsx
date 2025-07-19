'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, Pause, RotateCcw, Check, X, Loader2, BookOpen } from 'lucide-react';

interface Character {
  汉字: string;
  拼音: string;
}

interface ChineseCharacterPracticeProps {
  className?: string;
}

export default function ChineseCharacterPractice({ className = '' }: ChineseCharacterPracticeProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [usedCharacters, setUsedCharacters] = useState<Set<string>>(new Set());
  const [userInput, setUserInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [displayMode, setDisplayMode] = useState<'character' | 'character-pinyin'>('character');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // 加载汉字数据
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const response = await fetch('/3500常用汉字.json');
        if (!response.ok) {
          throw new Error('无法加载汉字数据');
        }
        const data: Character[] = await response.json();
        setCharacters(data);
        setIsLoading(false);
      } catch (err) {
        setError('加载汉字数据失败');
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, []);

  // 获取随机汉字
  const getRandomCharacter = () => {
    const availableCharacters = characters.filter(char => !usedCharacters.has(char.汉字));
    
    if (availableCharacters.length === 0) {
      // 如果所有汉字都用完了，重置已使用的汉字
      setUsedCharacters(new Set());
      return characters[Math.floor(Math.random() * characters.length)];
    }
    
    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
    const selectedCharacter = availableCharacters[randomIndex];
    if (selectedCharacter) {
      setUsedCharacters(prev => new Set([...prev, selectedCharacter.汉字]));
    }
    return selectedCharacter;
  };

  // 开始练习
  const startPractice = () => {
    if (characters.length === 0) {
      setMessage('汉字数据未加载，请稍后再试');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setIsStarted(true);
    setIsPaused(false);
    setCorrectCount(0);
    setTotalCount(0);
    setUsedCharacters(new Set());
    const newCharacter = getRandomCharacter();
    if (newCharacter) {
      setCurrentCharacter(newCharacter);
      setUserInput('');
      setTotalCount(prev => prev + 1);
    }
  };

  // 暂停/继续练习
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // 重置练习
  const resetPractice = () => {
    setIsStarted(false);
    setIsPaused(false);
    setCorrectCount(0);
    setTotalCount(0);
    setUsedCharacters(new Set());
    setCurrentCharacter(null);
    setUserInput('');
    setMessage('');
    setMessageType('');
  };

  // 处理用户输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCharacter || !userInput.trim() || isPaused) return;
    
    if (userInput.trim() === currentCharacter.汉字) {
      setCorrectCount(prev => prev + 1);
      setMessage('正确！');
      setMessageType('success');
    } else {
      setMessage(`错误！正确答案是：${currentCharacter.汉字}`);
      setMessageType('error');
    }
    
    setUserInput('');
    
    // 显示消息后清除并进入下一题
    setTimeout(() => {
      setMessage('');
      setMessageType('');
      const newCharacter = getRandomCharacter();
      if (newCharacter) {
        setCurrentCharacter(newCharacter);
        setTotalCount(prev => prev + 1);
      }
    }, 1500);
  };

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isStarted && !isPaused) {
      handleSubmit(e as any);
    }
  };

  // 计算进度
  const progress = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
  const characterProgress = characters.length > 0 ? (usedCharacters.size / characters.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <X className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">加载失败</p>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${className}`}>
      {/* 汉字信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>汉字库信息</span>
          </CardTitle>
          <CardDescription>已加载的汉字数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {characters.length}
            </div>
            <p className="text-gray-600 dark:text-gray-400">个常用汉字</p>
          </div>
          {message && (
            <div className={`text-center p-3 rounded-lg mt-4 ${
              messageType === 'success' 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 练习设置 */}
      <Card>
        <CardHeader>
          <CardTitle>练习设置</CardTitle>
          <CardDescription>选择显示模式和开始练习</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">显示模式：</label>
            <Select value={displayMode} onValueChange={(value: 'character' | 'character-pinyin') => setDisplayMode(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="character">只显示汉字</SelectItem>
                <SelectItem value="character-pinyin">显示汉字和拼音</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-4">
            {!isStarted ? (
              <Button onClick={startPractice} className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>开始练习</span>
              </Button>
            ) : (
              <>
                <Button 
                  onClick={togglePause} 
                  variant={isPaused ? "default" : "secondary"}
                  className="flex items-center space-x-2"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? '继续' : '暂停'}</span>
                </Button>
                <Button onClick={resetPractice} variant="outline" className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>重置</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 练习区域 */}
      {isStarted && currentCharacter && (
        <Card>
          <CardHeader>
            <CardTitle>练习中</CardTitle>
            <CardDescription>请输入显示的汉字</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 进度条 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>进度</span>
                <span>{usedCharacters.size} / {characters.length}</span>
              </div>
              <Progress value={characterProgress} className="w-full" />
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {correctCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">正确次数</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {progress.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">正确率</div>
              </div>
            </div>

            {/* 当前汉字显示 */}
            {!isPaused && (
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentCharacter.汉字}
                </div>
                {displayMode === 'character-pinyin' && (
                  <div className="text-xl text-gray-600 dark:text-gray-400">
                    {currentCharacter.拼音}
                  </div>
                )}
                
                {/* 输入框 */}
                <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                  <Input
                    value={userInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="请输入汉字"
                    className="text-center text-xl"
                    autoFocus
                  />
                  
                  <Button 
                    type="submit"
                    className="flex items-center space-x-2 w-full"
                    disabled={!userInput.trim()}
                  >
                    <Check className="w-4 h-4" />
                    <span>确认</span>
                  </Button>
                </form>
              </div>
            )}

            {/* 暂停状态 */}
            {isPaused && (
              <div className="text-center py-8">
                <Pause className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">练习已暂停</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 完成提示 */}
      {isStarted && usedCharacters.size === characters.length && characters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-600 dark:text-green-400">
              练习完成！
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
              🎉
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              恭喜你完成了所有汉字的练习！
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {correctCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">正确次数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {progress.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">正确率</div>
              </div>
            </div>
            <Button onClick={resetPractice} className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>重新开始</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 