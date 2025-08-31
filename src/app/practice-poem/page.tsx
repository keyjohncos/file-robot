'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { recordPractice } from '@/lib/practice-records';
import type { Poem } from '@/types/poem';
import LoginForm from '@/components/LoginForm';

export default function PoemPracticePage() {
  const { user } = useAuth();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [currentPoemIndex, setCurrentPoemIndex] = useState(0);
  const [userInput, setUserInput] = useState({
    title: '',
    author: '',
    content: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [practicedPoems, setPracticedPoems] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 如果用户未登录，显示登录页面
  if (!user) {
    return <LoginForm />;
  }

  useEffect(() => {
    setIsClient(true);
    // 加载诗词数据
    fetch('/poems_18.json')
      .then(res => res.json())
      .then(data => {
        setPoems(data);
        // 从localStorage恢复练习进度
        if (isClient) {
          const saved = localStorage.getItem('poemPracticeProgress');
          if (saved) {
            setPracticedPoems(new Set(JSON.parse(saved)));
          }
        }
      })
      .catch(err => console.error('加载诗词失败:', err));
  }, [isClient]);

  useEffect(() => {
    // 保存练习进度到localStorage
    if (isClient) {
      localStorage.setItem('poemPracticeProgress', JSON.stringify([...practicedPoems]));
    }
  }, [practicedPoems, isClient]);

  const currentPoem = poems[currentPoemIndex];

  const handleInputChange = (field: keyof typeof userInput, value: string) => {
    setUserInput(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!currentPoem || !user) return;

    const titleCorrect = userInput.title.trim() === currentPoem.诗名;
    const authorCorrect = userInput.author.trim() === currentPoem.作者;
    const contentCorrect = userInput.content.trim() === currentPoem.内容;

    const allCorrect = titleCorrect && authorCorrect && contentCorrect;
    
    setIsCorrect(allCorrect);
    setIsSubmitted(true);
    setShowResult(true);

    // 记录练习活动
    recordPractice(
      user.id,
      user.username,
      'poem',
      allCorrect ? '诗词练习正确' : '诗词练习错误',
      {
        poem: currentPoem.诗名,
        author: currentPoem.作者,
        correct: allCorrect,
        userInput,
      }
    );

    if (allCorrect) {
      setPracticedPoems(prev => new Set([...prev, currentPoemIndex]));
    }

    // 3秒后隐藏结果
    setTimeout(() => {
      setShowResult(false);
    }, 3000);
  };

  const handleNext = () => {
    if (currentPoemIndex < poems.length - 1) {
      setCurrentPoemIndex(prev => prev + 1);
      setUserInput({ title: '', author: '', content: '' });
      setIsSubmitted(false);
      setShowResult(false);
      setShowPinyin(false);
    }
  };

  const handlePrevious = () => {
    if (currentPoemIndex > 0) {
      setCurrentPoemIndex(prev => prev - 1);
      setUserInput({ title: '', author: '', content: '' });
      setIsSubmitted(false);
      setShowResult(false);
      setShowPinyin(false);
    }
  };

  const handleRandomPoem = () => {
    const randomIndex = Math.floor(Math.random() * poems.length);
    setCurrentPoemIndex(randomIndex);
    setUserInput({ title: '', author: '', content: '' });
    setIsSubmitted(false);
    setShowResult(false);
    setShowPinyin(false);
  };

  const togglePinyin = () => {
    setShowPinyin(!showPinyin);
  };

  const getProgressText = () => {
    const practiced = practicedPoems.size;
    const total = poems.length;
    return `${practiced}/${total}`;
  };

  const getProgressPercentage = () => {
    return (practicedPoems.size / poems.length) * 100;
  };

  if (poems.length === 0 || !currentPoem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载诗词...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部标题和进度 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-800 mb-4">诗词练习工具</h1>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">练习进度</span>
              <span className="text-2xl font-bold text-indigo-600">{getProgressText()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              已练习 {practicedPoems.size} 首，总共 {poems.length} 首
            </p>
          </div>
        </div>

        {/* 诗词显示区域和练习输入区域 */}
        {showPinyin ? (
          // 左右布局：显示拼音后使用左右结构
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 左侧：诗词显示区域 */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-center">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{currentPoem.诗名}</h2>
                  <button
                    onClick={togglePinyin}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      showPinyin 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                    }`}
                  >
                    {showPinyin ? '隐藏拼音' : '显示拼音'}
                  </button>
                </div>
                
                <p className="text-lg text-green-600 mb-2 font-medium">{currentPoem.拼音}</p>
                
                <p className="text-lg text-gray-600 mb-4">
                  作者：{currentPoem.作者}
                  <span className="text-green-600 ml-2">({currentPoem.作者拼音})</span>
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {currentPoem.内容}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-green-600 text-sm whitespace-pre-line leading-relaxed">
                      {currentPoem.内容拼音}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：练习输入区域 */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">请练习背诵这首诗</h3>
              <p className="text-center text-sm text-gray-600 mb-4">⚠️ 为了确保练习效果，输入框已禁用复制粘贴功能</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">诗名</label>
                  <input
                    type="text"
                    value={userInput.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入诗名"
                  />
                  <p className="text-sm text-green-600 mt-1">拼音提示：{currentPoem.拼音}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">作者</label>
                  <input
                    type="text"
                    value={userInput.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入作者"
                  />
                  <p className="text-sm text-green-600 mt-1">拼音提示：{currentPoem.作者拼音}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">诗的内容</label>
                  <textarea
                    value={userInput.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="请输入诗的内容"
                  />
                  <div className="mt-1">
                    <p className="text-sm text-green-600">拼音提示：</p>
                    <p className="text-xs text-green-500 bg-green-50 p-2 rounded border">
                      {currentPoem.内容拼音}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleSubmit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
                  >
                    提交答案
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 默认布局：未显示拼音时使用垂直布局
          <>
            {/* 诗词显示区域 */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <div className="text-center">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{currentPoem.诗名}</h2>
                  <button
                    onClick={togglePinyin}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      showPinyin 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                    }`}
                  >
                    {showPinyin ? '隐藏拼音' : '显示拼音'}
                  </button>
                </div>
                
                <p className="text-lg text-gray-600 mb-4">
                  作者：{currentPoem.作者}
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {currentPoem.内容}
                  </p>
                </div>
              </div>
            </div>

            {/* 练习输入区域 */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">请练习背诵这首诗</h3>
              <p className="text-center text-sm text-gray-600 mb-4">⚠️ 为了确保练习效果，输入框已禁用复制粘贴功能</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">诗名</label>
                  <input
                    type="text"
                    value={userInput.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入诗名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">作者</label>
                  <input
                    type="text"
                    value={userInput.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入作者"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">诗的内容</label>
                  <textarea
                    value={userInput.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="请输入诗的内容"
                  />
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleSubmit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
                  >
                    提交答案
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 结果显示 */}
        {showResult && (
          <div className={`bg-white rounded-lg p-6 shadow-md mb-6 text-center ${
            isCorrect ? 'border-2 border-green-500' : 'border-2 border-red-500'
          }`}>
            <div className={`text-6xl mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
              {isCorrect ? '✓' : '✗'}
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? '恭喜！答案完全正确！' : '答案有误，请继续练习'}
            </h3>
            {!isCorrect && (
              <div className="text-left bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600 mb-2">正确答案：</p>
                <p><strong>诗名：</strong>{currentPoem.诗名}</p>
                <p><strong>作者：</strong>{currentPoem.作者}</p>
                <p><strong>内容：</strong></p>
                <p className="whitespace-pre-line bg-white p-2 rounded border">{currentPoem.内容}</p>
              </div>
            )}
          </div>
        )}

        {/* 导航按钮 */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentPoemIndex === 0}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:cursor-not-allowed"
          >
            上一首
          </button>
          
          <button
            onClick={handleRandomPoem}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            随机练习
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentPoemIndex === poems.length - 1}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:cursor-not-allowed"
          >
            下一首
          </button>
        </div>

        {/* 已练习诗词列表 */}
        {practicedPoems.size > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-md mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">已练习的诗词</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from(practicedPoems).map(index => {
                const poem = poems[index];
                if (!poem) return null;
                return (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="font-medium text-green-800">{poem.诗名}</p>
                    <p className="text-sm text-green-600">{poem.作者}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
