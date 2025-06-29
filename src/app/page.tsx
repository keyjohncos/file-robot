'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, Download, FileText, Search, AlertCircle, CheckCircle2, FolderOpen, File, Moon } from 'lucide-react'
import JSZip from 'jszip'
import { ThemeToggle } from '@/components/theme-toggle'

interface FileItem {
  file: File
  path: string
  name: string
  size: number
  type: string
}

interface MatchedFile extends FileItem {
  matched: boolean
  matchedCodes: string[]
}

const FILE_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'pdf', label: 'PDF (.pdf)' },
  { value: 'jpg,jpeg', label: 'JPEG (.jpg, .jpeg)' },
  { value: 'png', label: 'PNG (.png)' },
  { value: 'xlsx,xls', label: 'Excel (.xlsx, .xls)' },
  { value: 'docx,doc', label: 'Word (.docx, .doc)' },
  { value: 'pptx,ppt', label: 'PowerPoint (.pptx, .ppt)' },
  { value: 'txt', label: 'Text (.txt)' },
  { value: 'csv', label: 'CSV (.csv)' }
]

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

export default function FileMatcherPro() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [productCodes, setProductCodes] = useState('')
  const [selectedFileTypes, setSelectedFileTypes] = useState('all')
  const [matchedFiles, setMatchedFiles] = useState<MatchedFile[]>([])
  const [unmatchedCodes, setUnmatchedCodes] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [progress, setProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const dropAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  // Clear messages after a delay
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('')
        setSuccess('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

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

  const handleFilesDrop = async (items: DataTransferItemList) => {
    setIsProcessing(true)
    setError('')
    setProgress(0)

    try {
      const allFiles: FileItem[] = []
      const entries = Array.from(items).map(item => item.webkitGetAsEntry()).filter(Boolean)

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        if (entry) {
          const files = await processEntry(entry)
          allFiles.push(...files)
        }
        setProgress(((i + 1) / entries.length) * 100)
      }

      setFiles(allFiles)
      setSuccess(`Successfully loaded ${allFiles.length} files`)
    } catch (err) {
      setError('Error processing files. Please try again.')
      console.error('File processing error:', err)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    setIsProcessing(true)
    setError('')

    try {
      const fileItems: FileItem[] = Array.from(selectedFiles).map(file => ({
        file,
        path: file.name,
        name: file.name,
        size: file.size,
        type: file.type || getFileTypeFromName(file.name)
      }))

      setFiles(fileItems)
      setSuccess(`Successfully loaded ${fileItems.length} files`)
    } catch (err) {
      setError('Error loading files. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const matchFiles = useCallback(() => {
    if (files.length === 0) {
      setError('Please upload files first')
      return
    }

    if (!productCodes.trim()) {
      setError('Please enter product codes to match')
      return
    }

    setError('')
    setIsProcessing(true)

    try {
      // Parse product codes (support both newline and comma separation)
      const codes = productCodes
        .split(/[,\n]/)
        .map(code => code.trim())
        .filter(code => code.length > 0)

      if (codes.length === 0) {
        setError('Please enter valid product codes')
        setIsProcessing(false)
        return
      }

      // Filter files by type if specified
      let filteredFiles = files
      if (selectedFileTypes !== 'all') {
        const allowedExtensions = selectedFileTypes.split(',')
        filteredFiles = files.filter(file => {
          const ext = file.name.split('.').pop()?.toLowerCase()
          return ext && allowedExtensions.includes(ext)
        })
      }

      // Match files
      const matched: MatchedFile[] = filteredFiles.map(file => {
        const matchedCodes = codes.filter(code =>
          file.name.toLowerCase().includes(code.toLowerCase())
        )

        return {
          ...file,
          matched: matchedCodes.length > 0,
          matchedCodes
        }
      }).filter(file => file.matched)

      // Find unmatched codes
      const allMatchedCodes = new Set<string>()
      matched.forEach(file => {
        file.matchedCodes.forEach(code => allMatchedCodes.add(code))
      })
      
      const unmatched = codes.filter(code => !allMatchedCodes.has(code))

      setMatchedFiles(matched)
      setUnmatchedCodes(unmatched)

      if (matched.length === 0) {
        setError(`No files matched the given product codes. Searched in ${filteredFiles.length} files.`)
      } else {
        setSuccess(`Found ${matched.length} matching files`)
      }
    } catch (err) {
      setError('Error matching files. Please try again.')
      console.error('Matching error:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [files, productCodes, selectedFileTypes])

  const downloadMatchedFiles = async () => {
    if (matchedFiles.length === 0) {
      setError('No matched files to download')
      return
    }

    setIsDownloading(true)
    setError('')
    setProgress(0)

    try {
      const zip = new JSZip()

      for (let i = 0; i < matchedFiles.length; i++) {
        const matchedFile = matchedFiles[i]
        const arrayBuffer = await matchedFile.file.arrayBuffer()

        // Use the full path to maintain folder structure
        zip.file(matchedFile.path, arrayBuffer)
        setProgress(((i + 1) / matchedFiles.length) * 100)
      }

      const content = await zip.generateAsync({ type: 'blob' })

      // Create download link
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'matched_files.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess(`Downloaded ${matchedFiles.length} files as ZIP`)
    } catch (err) {
      setError('Error creating ZIP file. Please try again.')
      console.error('ZIP creation error:', err)
    } finally {
      setIsDownloading(false)
      setProgress(0)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">File Matcher Pro</h1>
            <p className="text-muted-foreground">
              Drop files or folders, enter product codes, and download matched files as a ZIP archive.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      {/* Progress Bar */}
      {(isProcessing || isDownloading) && (
        <div className="mb-6">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            {isDownloading ? 'Creating ZIP file...' : 'Processing files...'}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload
            </CardTitle>
            <CardDescription>
              Drag and drop files or folders, or use the buttons below
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
                  <p className="text-lg font-medium">Drop files or folders here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
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
                Select Files
              </Button>
              <Button
                variant="outline"
                onClick={() => folderInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Select Folder
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
            {files.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium">
                  📁 {files.length} files loaded
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Configuration
            </CardTitle>
            <CardDescription>
              Configure product codes and file filters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Codes Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Product codes to match (one per line or comma-separated)
              </label>
              <Textarea
                placeholder="DCA-4901&#10;DCA-493&#10;DCA-3936, DCA-382W"
                value={productCodes}
                onChange={(e) => setProductCodes(e.target.value)}
                className="min-h-32 resize-y"
              />
            </div>

            {/* File Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                File type filter (optional)
              </label>
              <Select value={selectedFileTypes} onValueChange={setSelectedFileTypes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Match Button */}
            <Button
              onClick={matchFiles}
              disabled={isProcessing || files.length === 0 || !productCodes.trim()}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Match Files'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {(matchedFiles.length > 0 || unmatchedCodes.length > 0) && (
        <div className="mt-6 space-y-6">
          {/* Matched Files */}
          {matchedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Matched Files ({matchedFiles.length})</CardTitle>
                    <CardDescription>
                      Files containing the specified product codes
                    </CardDescription>
                  </div>
                  <Button
                    onClick={downloadMatchedFiles}
                    disabled={isDownloading}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isDownloading ? 'Creating ZIP...' : 'Download ZIP'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {matchedFiles.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.path} • {formatFileSize(file.size)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {file.matchedCodes.map(code => (
                            <Badge key={code} variant="secondary" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <FileText className="h-5 w-5 text-muted-foreground ml-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unmatched Codes */}
          {unmatchedCodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Unmatched Product Codes ({unmatchedCodes.length})
                </CardTitle>
                <CardDescription>
                  These product codes were not found in any uploaded files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {unmatchedCodes.map((code) => (
                    <Badge key={code} variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                      {code}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
