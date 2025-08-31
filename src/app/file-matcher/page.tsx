'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Download, FileText, Search, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import JSZip from 'jszip'
import { ThemeToggle } from '@/components/theme-toggle'
import LanguageToggle from '@/components/language-toggle'
import FileUpload from '@/components/FileUpload'
import { Language, translations, formatMessage, Translations } from '@/lib/i18n'

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
  { value: 'all', labelKey: 'allTypes' },
  { value: 'pdf', labelKey: 'pdf' },
  { value: 'jpg,jpeg', labelKey: 'jpeg' },
  { value: 'png', labelKey: 'png' },
  { value: 'xlsx,xls', labelKey: 'excel' },
  { value: 'docx,doc', labelKey: 'word' },
  { value: 'pptx,ppt', labelKey: 'powerpoint' },
  { value: 'txt', labelKey: 'text' },
  { value: 'csv', labelKey: 'csv' }
]

export default function FileMatcherPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [isClient, setIsClient] = useState(false)

  // 使用 useEffect 来处理客户端初始化
  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem('file-matcher-language')
    if (saved) {
      setLanguage(saved as Language)
    }
  }, [])
  
  const [files, setFiles] = useState<FileItem[]>([])
  const [productCodes, setProductCodes] = useState('')
  const [selectedFileTypes, setSelectedFileTypes] = useState('all')
  const [matchedFiles, setMatchedFiles] = useState<MatchedFile[]>([])
  const [unmatchedCodes, setUnmatchedCodes] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [progress, setProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const t = translations[language]

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

  const handleFilesLoaded = (loadedFiles: FileItem[]) => {
    setFiles(loadedFiles)
    setSuccess(formatMessage(t.successfullyLoadedFiles, { count: loadedFiles.length }))
  }

  const matchFiles = useCallback(() => {
    if (files.length === 0) {
      setError(t.pleaseUploadFiles)
      return
    }

    if (!productCodes.trim()) {
      setError(t.pleaseEnterCodes)
      return
    }

    setError('')
    setIsProcessing(true)

    try {
      const codes = productCodes
        .split(/[,\n]/)
        .map(code => code.trim())
        .filter(code => code.length > 0)

      if (codes.length === 0) {
        setError(t.pleaseEnterValidCodes)
        setIsProcessing(false)
        return
      }

      let filteredFiles = files
      if (selectedFileTypes !== 'all') {
        const allowedExtensions = selectedFileTypes.split(',')
        filteredFiles = files.filter(file => {
          const ext = file.name.split('.').pop()?.toLowerCase()
          return ext && allowedExtensions.includes(ext)
        })
      }

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

      const allMatchedCodes = new Set<string>()
      matched.forEach(file => {
        file.matchedCodes.forEach(code => allMatchedCodes.add(code))
      })
      
      const unmatched = codes.filter(code => !allMatchedCodes.has(code))

      setMatchedFiles(matched)
      setUnmatchedCodes(unmatched)

      if (matched.length === 0) {
        setError(formatMessage(t.noFilesMatched, { count: filteredFiles.length }))
      } else {
        setSuccess(formatMessage(t.foundMatchingFiles, { count: matched.length }))
      }
    } catch (err) {
      setError(t.errorMatchingFiles)
      console.error('Matching error:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [files, productCodes, selectedFileTypes, t])

  const downloadMatchedFiles = async () => {
    if (matchedFiles.length === 0) {
      setError(t.noMatchedFilesToDownload)
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

        zip.file(matchedFile.path, arrayBuffer)
        setProgress(((i + 1) / matchedFiles.length) * 100)
      }

      const content = await zip.generateAsync({ type: 'blob' })

      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'matched_files.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess(formatMessage(t.downloadedFilesAsZip, { count: matchedFiles.length }))
    } catch (err) {
      setError(t.errorCreatingZip)
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

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    if (isClient) {
      localStorage.setItem('file-matcher-language', newLanguage)
    }
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
                Filter Files
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

      <div className="container mx-auto p-6 max-w-6xl">
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
              {isDownloading ? t.creatingZipFile : t.processingFiles}
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* File Upload Section */}
          <FileUpload 
            onFilesLoaded={handleFilesLoaded}
            isProcessing={isProcessing}
            filesCount={files.length}
            t={t}
          />

          {/* Search Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {t.searchConfiguration}
              </CardTitle>
              <CardDescription>
                {t.searchConfigurationDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Codes Input */}
              <div>
                <label className="text-lg font-medium mb-2 block">
                  {t.productCodesLabel}
                </label>
                <Textarea
                  placeholder={t.productCodesPlaceholder}
                  value={productCodes}
                  onChange={(e) => setProductCodes(e.target.value)}
                  className="min-h-32 resize-y"
                />
              </div>

              {/* File Type Filter */}
              <div>
                <label className="text-lg font-medium mb-2 block">
                  {t.fileTypeFilter}
                </label>
                <Select value={selectedFileTypes} onValueChange={setSelectedFileTypes}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {t[type.labelKey as keyof Translations]}
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
                {isProcessing ? t.processing : t.matchFiles}
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
                      <CardTitle>{t.matchedFiles} ({matchedFiles.length})</CardTitle>
                      <CardDescription>
                        {t.matchedFilesDescription}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={downloadMatchedFiles}
                      disabled={isDownloading}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {isDownloading ? t.creatingZip : t.downloadZip}
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
                    {t.unmatchedCodes} ({unmatchedCodes.length})
                  </CardTitle>
                  <CardDescription>
                    {t.unmatchedCodesDescription}
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

        {/* Tool Footer */}
        <div className="mt-10 leading-relaxed text-muted-foreground whitespace-pre-line" style={{ fontSize: '22px' }}>
          {t.toolFooter}
        </div>
      </div>
    </div>
  )
} 