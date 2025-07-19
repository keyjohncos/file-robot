import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { readFileSync } from 'fs'
import { join } from 'path'

// 👇 指定运行时为 nodejs，避免 Edge Runtime 限制
export const runtime = 'nodejs';




interface Character {
  hanzi: string
  pinyin: string
}

export async function GET() {
  try {
    // 读取Excel文件
    const filePath = join(process.cwd(), 'data', 'chinese-characters', '3500_test.xls')
    console.log('   Excel 路径:', filePath);
    const workbook = XLSX.readFile(filePath)
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // 将工作表转换为JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    // 解析汉字数据
    const characters: Character[] = []
    
    for (const row of jsonData) {
      if (row && row.length >= 2) {
        const hanzi = String(row[0]).trim()
        const pinyin = String(row[1]).trim()
        
        // 确保汉字和拼音都不为空
        if (hanzi && pinyin && hanzi.length === 1) {
          characters.push({ hanzi, pinyin })
        }
      }
    }
    
    if (characters.length === 0) {
      return NextResponse.json(
        { error: '文件中没有找到有效的汉字数据' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      characters,
      total: characters.length,
      message: `成功加载 ${characters.length} 个汉字`
    })
    
  } catch (error) {
    console.error('加载汉字文件失败:', error)
    return NextResponse.json(
      { error: '加载汉字文件失败，请检查文件是否存在且格式正确' },
      { status: 500 }
    )
  }
} 