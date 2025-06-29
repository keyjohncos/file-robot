'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, File, FolderOpen } from 'lucide-react'
import { Translations } from '@/lib/i18n'

interface FileItem {
  file: File
  path: string
  name: string
  size: number
  type: string
}

interface FileUploadProps {
  onFilesLoaded: (files: FileItem[]) => void
  isProcessing: boolean
  filesCount: number
  t: Translations
}

// TypeScript declarations for webkitdirectory and FileSystem API
declare module 'react' {
  interface InputHTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    webkitdirectory?: string
  }
}

// FileSystem API types
interface FileSystemEntry {
  isFile: boolean
  isDirectory: boolean
  name: string
  file?(callback: (file: File) => void): void
  createReader?(): FileSystemDirectoryReader
}

interface FileSystemDirectoryReader {
  readEntries(callback: (entries: FileSystemEntry[]) => void): void
}

export default function FileUpload({ onFilesLoaded, isProcessing, filesCount, t }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  // Prevent default drag behaviors
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDragEnter = (e: DragEvent) => {
      preventDefault(e)
      setIsDragOver(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      preventDefault(e)
      // Only set isDragOver to false if we're leaving the drop area completely
      if (!dropAreaRef.current?.contains(e.relatedTarget as Node)) {
        setIsDragOver(false)
      }
    }

    const handleDrop = (e: DragEvent) => {
      preventDefault(e)
      setIsDragOver(false)

      if (e.dataTransfer?.items) {
        handleFilesDrop(e.dataTransfer.items)
      }
    }

    const dropArea = dropAreaRef.current
    if (dropArea) {
      dropArea.addEventListener('dragenter', handleDragEnter)
      dropArea.addEventListener('dragover', preventDefault)
      dropArea.addEventListener('dragleave', handleDragLeave)
      dropArea.addEventListener('drop', handleDrop)
    }

    return () => {
      if (dropArea) {
        dropArea.removeEventListener('dragenter', handleDragEnter)
        dropArea.removeEventListener('dragover', preventDefault)
        dropArea.removeEventListener('dragleave', handleDragLeave)
        dropArea.removeEventListener('drop', handleDrop)
      }
    }
  }, [])

  const getFileTypeFromName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls': 'application/vnd.ms-excel',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'doc': 'application/msword',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'ppt': 'application/vnd.ms-powerpoint',
      'txt': 'text/plain',
      'csv': 'text/csv'
    }
    return mimeTypes[ext || ''] || 'application/octet-stream'
  }

  const processEntry = async (entry: FileSystemEntry, path = ''): Promise<FileItem[]> => {
    return new Promise((resolve) => {
      if (entry.isFile && entry.file) {
        entry.file((file: File) => {
          const fullPath = path ? `${path}/${file.name}` : file.name
          resolve([{
            file,
            path: fullPath,
            name: file.name,
            size: file.size,
            type: file.type || getFileTypeFromName(file.name)
          }])
        })
      } else if (entry.isDirectory && entry.createReader) {
        const dirReader = entry.createReader()
        const allFiles: FileItem[] = []

        const readEntries = () => {
          dirReader.readEntries(async (entries: FileSystemEntry[]) => {
            if (entries.length === 0) {
              resolve(allFiles)
              return
            }

            for (const childEntry of entries) {
              const childPath = path ? `${path}/${entry.name}` : entry.name
              const childFiles = await processEntry(childEntry, childPath)
              allFiles.push(...childFiles)
            }
            readEntries() // Continue reading if there are more entries
          })
        }
        readEntries()
      } else {
        resolve([])
      }
    })
  }

  const handleFilesDrop = async (items: DataTransferItemList) => {
    try {
      const allFiles: FileItem[] = []
      const entries = Array.from(items).map(item => item.webkitGetAsEntry()).filter(Boolean)

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        if (entry) {
          const files = await processEntry(entry)
          allFiles.push(...files)
        }
      }

      onFilesLoaded(allFiles)
    } catch (err) {
      console.error('File processing error:', err)
    }
  }

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    try {
      const fileItems: FileItem[] = Array.from(selectedFiles).map(file => ({
        file,
        path: file.name,
        name: file.name,
        size: file.size,
        type: file.type || getFileTypeFromName(file.name)
      }))

      onFilesLoaded(fileItems)
    } catch (err) {
      console.error('Error loading files:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {t.fileUpload}
        </CardTitle>
        <CardDescription>
          {t.fileUploadDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Area */}
        <div
          ref={dropAreaRef}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${isProcessing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${isDragOver ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <Upload className={`h-8 w-8 ${isDragOver ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
            </div>
            <div>
              <p className="text-lg font-medium">{t.dropFilesHere}</p>
              <p className="text-sm text-muted-foreground">
                {t.orClickToBrowse}
              </p>
            </div>
          </div>
        </div>

        {/* File Input Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1"
          >
            <File className="h-4 w-4 mr-2" />
            {t.selectFiles}
          </Button>
          <Button
            variant="outline"
            onClick={() => folderInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            {t.selectFolder}
          </Button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          multiple
          onChange={handleFileInput}
          className="hidden"
        />

        {/* File Count Display */}
        {filesCount > 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium">
              📁 {filesCount} {t.filesLoaded}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 