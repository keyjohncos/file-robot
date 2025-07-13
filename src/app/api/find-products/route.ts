import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PDFExtract } from 'pdf.js-extract';

interface ProductResult {
  fileName: string;
  productCode: string;
  relevance: number;
  summary: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// AI配置
const AI_CONFIG = {
  apiKey: 'sk-WM1F3X2MQqJdZN5DA076Eb4dD1E74bD0Bf36060114E692C3',
  baseURL: 'https://aihubmix.com/v1',
  model: 'gpt-4.1-nano'
};

// 从文件名提取产品代码
function extractProductCode(fileName: string): string {
  const match = fileName.match(/DCA-[A-Z0-9-]+/);
  return match ? match[0] : fileName.replace('.pdf', '');
}

// 从PDF文件提取文本
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extract(filePath);
    return data.pages.map((page: any) => page.content.map((item: any) => item.str).join(' ')).join(' ');
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
}

// 调用AI API
async function callAI(query: string, context: string, chatHistory: ChatMessage[]): Promise<string> {
  try {
    const messages = [
      {
        role: 'system',
        content: `你是一个专业的产品搜索助手。你需要根据用户的查询从产品文档中找到最相关的产品。

用户查询: ${query}

产品文档内容: ${context}

请分析用户需求，从文档中找到最匹配的产品，并返回以下格式的JSON:
{
  "results": [
    {
      "fileName": "文件名.pdf",
      "productCode": "产品代码",
      "relevance": 0.95,
      "summary": "产品简要描述"
    }
  ],
  "response": "用中文回复用户，说明找到了哪些产品以及为什么这些产品符合用户需求"
}

只返回最相关的3-5个产品，按相关度排序。`
      },
      ...chatHistory.slice(-5), // 保留最近5条对话历史
      {
        role: 'user',
        content: query
      }
    ];

    const response = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw error;
  }
}

// 简单的文本匹配搜索（作为AI的备选方案）
function simpleTextSearch(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();
  
  let matchCount = 0;
  queryWords.forEach(word => {
    if (textLower.includes(word)) {
      matchCount++;
    }
  });
  
  return matchCount / queryWords.length;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, chatHistory = [] } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Missing query parameter' },
        { status: 400 }
      );
    }

    // 获取products文件夹中的所有PDF文件
    const productsDir = path.join(process.cwd(), 'data', 'products');
    const files = fs.readdirSync(productsDir)
      .filter(file => file.endsWith('.pdf'))
      .slice(0, 20); // 限制处理文件数量以提高性能

    const results: ProductResult[] = [];
    const allTexts: string[] = [];

    // 提取所有PDF文件的文本
    for (const file of files) {
      const filePath = path.join(productsDir, file);
      const text = await extractTextFromPDF(filePath);
      
      if (text) {
        allTexts.push(text);
        
        // 简单的文本匹配作为备选
        const relevance = simpleTextSearch(query, text);
        if (relevance > 0.1) { // 至少10%的匹配度
          results.push({
            fileName: file,
            productCode: extractProductCode(file),
            relevance: relevance,
            summary: text.substring(0, 200) + '...'
          });
        }
      }
    }

    // 按相关度排序
    results.sort((a, b) => b.relevance - a.relevance);

    // 如果找到结果，调用AI进行进一步分析
    let aiResponse = '';
    let aiResults = results.slice(0, 5); // 取前5个最相关的结果

    if (results.length > 0) {
      try {
        // 将所有相关文本合并作为AI的上下文
        const context = results.map(r => `${r.fileName}: ${r.summary}`).join('\n\n');
        aiResponse = await callAI(query, context, chatHistory);
        
        // 尝试解析AI返回的JSON
        try {
          const aiData = JSON.parse(aiResponse);
          if (aiData.results) {
            aiResults = aiData.results;
          }
        } catch (parseError) {
          console.log('AI response is not JSON, using as text response');
        }
      } catch (aiError) {
        console.error('AI API failed, using fallback results:', aiError);
        aiResponse = `找到了 ${results.length} 个相关产品。请查看以下产品是否符合您的需求：\n\n${results.slice(0, 3).map(r => `• ${r.productCode} (${r.fileName})`).join('\n')}`;
      }
    } else {
      aiResponse = '抱歉，没有找到与您的查询完全匹配的产品。请尝试使用不同的关键词，或者描述更具体的产品特性。';
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      results: aiResults
    });

  } catch (error) {
    console.error('Error in find-products API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 