import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

// 模拟单词数据（支持标准格式）
const mockWords: WordData[] = [
  {
    word: 'review',
    pronunciation: '/rɪˈvjuː/',
    partOfSpeech: 'v. 复习；回顾；n. 复习；评论',
    definition: '复习；回顾；评论',
    phrases: ['book review', 'in review'],
    example: 'I need to do a review for the exam.',
    sourceFile: 'Unit 1.docx',
    pageNumber: 1,
    wordForms: ['reviewer（评论者；书评家）', 'revision（复习；修订）']
  },
  {
    word: 'chocolate',
    pronunciation: '/ˈtʃɒklət/',
    partOfSpeech: 'n. 巧克力；巧克力糖',
    definition: '巧克力；巧克力糖',
    phrases: ['chocolate cake', 'hot chocolate'],
    example: 'I love eating chocolate.',
    sourceFile: 'Unit 1.docx',
    pageNumber: 2,
    wordForms: []
  },
  {
    word: 'apple',
    pronunciation: '/ˈæpəl/',
    partOfSpeech: 'n. 苹果',
    definition: 'a round fruit with red, yellow, or green skin and white flesh',
    phrases: ['apple pie', 'apple juice'],
    example: 'I eat an apple every day.',
    sourceFile: 'Unit 1.docx',
    pageNumber: 3,
    wordForms: []
  },
  {
    word: 'book',
    pronunciation: '/bʊk/',
    partOfSpeech: 'n. 书；书籍',
    definition: 'a written or printed work consisting of pages',
    phrases: ['book store', 'book club'],
    example: 'I love reading books.',
    sourceFile: 'Unit 2.docx',
    pageNumber: 1,
    wordForms: []
  },
  {
    word: 'cat',
    pronunciation: '/kæt/',
    partOfSpeech: 'n. 猫',
    definition: 'a small domesticated carnivorous mammal',
    phrases: ['cat food', 'cat lover'],
    example: 'The cat is sleeping on the sofa.',
    sourceFile: 'Unit 2.docx',
    pageNumber: 2,
    wordForms: []
  }
];

// 获取可用文件列表
async function getAvailableFiles() {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'word-documents');
    
    if (!fs.existsSync(dataDir)) {
      return { success: true, files: ['Unit 1.txt', 'Unit 2.txt', 'Unit 3.txt', 'Unit 4.txt'] };
    }
    
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.docx') || file.endsWith('.doc') || file.endsWith('.txt'))
      .map(file => file);
    
    return { success: true, files };
  } catch (error) {
    console.error('Error reading files:', error);
    return { success: true, files: ['Unit 1.txt', 'Unit 2.txt', 'Unit 3.txt', 'Unit 4.txt'] };
  }
}

// 定义单词类型
interface WordData {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  phrases: string[];
  example: string;
  wordForms: string[];
  sourceFile: string;
  pageNumber: number;
}

// 解析标准格式的单词数据
function parseWordData(text: string): WordData[] {
  const words: WordData[] = [];
  const lines = text.split('\n').filter(line => line.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // 匹配格式：word /pronunciation/definition
    const wordMatch = line.match(/^(\w+)\s+(\/[^\/]+\/)(.+)$/);
    if (wordMatch) {
      const word = wordMatch[1];
      const pronunciation = wordMatch[2];
      const definition = wordMatch[3].trim();
      const partOfSpeech = '';
      const phrases: string[] = [];
      let example = '';
      const wordForms: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j].trim();
        if (nextLine.match(/^\w+\s+\/[^\/]+\//)) break;
        if (nextLine.includes('词形转换：')) {
          j++;
          while (j < lines.length && !lines[j].trim().match(/^(常考短语|举例|^\w+\s+\/[^\/]+\/)/)) {
            const formLine = lines[j].trim();
            if (formLine && !formLine.includes('：')) wordForms.push(formLine);
            j++;
          }
          j--;
        } else if (nextLine.includes('常考短语：')) {
          j++;
          while (j < lines.length && !lines[j].trim().match(/^(举例|^\w+\s+\/[^\/]+\/)/)) {
            const phraseLine = lines[j].trim();
            if (phraseLine && !phraseLine.includes('：')) phrases.push(phraseLine);
            j++;
          }
          j--;
        } else if (nextLine.includes('举例：')) {
          j++;
          while (j < lines.length && !lines[j].trim().match(/^\w+\s+\/[^\/]+\//)) {
            const exampleLine = lines[j].trim();
            if (exampleLine && !exampleLine.includes('：')) example += exampleLine + ' ';
            j++;
          }
          j--;
        }
        j++;
      }
      words.push({
        word,
        pronunciation,
        partOfSpeech,
        definition,
        phrases,
        example: example.trim(),
        wordForms,
        sourceFile: 'Word Document',
        pageNumber: 1
      });
      i = j - 1;
    }
  }
  return words;
}

// 从文件中提取单词
async function extractWordsFromFile(filePath: string): Promise<WordData[]> {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (fileExtension === '.txt') {
      // 处理文本文件
      const text = fs.readFileSync(filePath, 'utf-8');
      const parsedWords = parseWordData(text);
      if (parsedWords.length > 0) {
        return parsedWords;
      }
    } else if (fileExtension === '.docx' || fileExtension === '.doc') {
      // 处理Word文档
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      
      // 尝试解析标准格式
      const parsedWords = parseWordData(text);
      if (parsedWords.length > 0) {
        return parsedWords;
      }
    }
    
    // 如果解析失败，返回空数组
    return [];
  } catch (error) {
    console.error('Error extracting words from file:', error);
    return [];
  }
}

// 获取指定单词的详细信息
async function getWordInfo(targetWord: string, selectedFile?: string): Promise<WordData> {
  try {
    if (selectedFile && selectedFile !== 'all') {
      // 从指定文件获取单词
      const dataDir = path.join(process.cwd(), 'data', 'word-documents');
      const filePath = path.join(dataDir, selectedFile);
      
      if (fs.existsSync(filePath)) {
        const words = await extractWordsFromFile(filePath);
        if (words.length > 0) {
          // 查找指定单词
          const wordInfo = words.find(word => word.word.toLowerCase() === targetWord.toLowerCase());
          if (wordInfo) {
            return wordInfo;
          }
        }
      }
    }
    
    // 如果在文件中找不到，使用模拟数据
    const mockWord = mockWords.find(word => word.word.toLowerCase() === targetWord.toLowerCase());
    return mockWord || mockWords[0];
  } catch (error) {
    console.error('Error getting word info:', error);
    return mockWords[0];
  }
}

// 获取随机单词
async function getRandomWord(selectedFile?: string): Promise<WordData> {
  try {
    if (selectedFile && selectedFile !== 'all') {
      // 从指定文件获取单词
      const dataDir = path.join(process.cwd(), 'data', 'word-documents');
      const filePath = path.join(dataDir, selectedFile);
      
      if (fs.existsSync(filePath)) {
        const words = await extractWordsFromFile(filePath);
        if (words.length > 0) {
          const randomWord = words[Math.floor(Math.random() * words.length)];
          return randomWord;
        }
      }
    }
    
    // 使用模拟数据
    const randomWord = mockWords[Math.floor(Math.random() * mockWords.length)];
    return randomWord;
  } catch (error) {
    console.error('Error getting random word:', error);
    return mockWords[0];
  }
}

// 验证用户输入
function validateUserInput(userInput: string, correctWord: string) {
  const input = userInput.toLowerCase().trim();
  const correct = correctWord.toLowerCase().trim();
  
  if (input === correct) {
    return {
      isCorrect: true,
      correctWord: correctWord
    };
  }
  
  // 找出错误位置
  const errorPositions: number[] = [];
  const minLength = Math.min(input.length, correct.length);
  
  for (let i = 0; i < minLength; i++) {
    if (input[i] !== correct[i]) {
      errorPositions.push(i);
    }
  }
  
  // 如果输入长度不同，标记额外的字符为错误
  for (let i = minLength; i < input.length; i++) {
    errorPositions.push(i);
  }
  
  return {
    isCorrect: false,
    errorPositions,
    correctWord: correctWord
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');
    
    const word = await getRandomWord(file || undefined);
    
    return NextResponse.json({
      success: true,
      ...word
    });
  } catch (error) {
    console.error('Error in GET /api/words:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get word' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, correctWord, selectedFile } = body;
    
    if (!userInput || !correctWord) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const validationResult = validateUserInput(userInput, correctWord);
    
    if (validationResult.isCorrect) {
      // 从文件中获取当前单词的详细信息
      const wordInfo = await getWordInfo(correctWord, selectedFile);
      return NextResponse.json({
        success: true,
        isCorrect: true,
        wordInfo
      });
    }
    
    return NextResponse.json({
      success: true,
      ...validationResult
    });
  } catch (error) {
    console.error('Error in POST /api/words:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate input' },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    const files = await getAvailableFiles();
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error in PUT /api/words:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get files' },
      { status: 500 }
    );
  }
} 