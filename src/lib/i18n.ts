export type Language = 'en' | 'zh'

export interface Translations {
  // Header
  title: string
  subtitle: string
  
  // File Upload
  fileUpload: string
  fileUploadDescription: string
  dropFilesHere: string
  orClickToBrowse: string
  selectFiles: string
  selectFolder: string
  filesLoaded: string
  
  // Search Configuration
  searchConfiguration: string
  searchConfigurationDescription: string
  productCodesLabel: string
  productCodesPlaceholder: string
  fileTypeFilter: string
  fileTypeFilterDescription: string
  matchFiles: string
  processing: string
  
  // File Types
  allTypes: string
  pdf: string
  jpeg: string
  png: string
  excel: string
  word: string
  powerpoint: string
  text: string
  csv: string
  
  // Results
  matchedFiles: string
  matchedFilesDescription: string
  downloadZip: string
  creatingZip: string
  unmatchedCodes: string
  unmatchedCodesDescription: string
  
  // Messages
  pleaseUploadFiles: string
  pleaseEnterCodes: string
  pleaseEnterValidCodes: string
  noFilesMatched: string
  foundMatchingFiles: string
  errorMatchingFiles: string
  noMatchedFilesToDownload: string
  downloadedFilesAsZip: string
  errorCreatingZip: string
  successfullyLoadedFiles: string
  errorProcessingFiles: string
  errorLoadingFiles: string
  
  // Progress
  creatingZipFile: string
  processingFiles: string
  
  // Footer
  toolFooter: string
}

export const translations: Record<Language, Translations> = {
  en: {
    // Header
    title: 'File Matcher Pro',
    subtitle: 'Drop files or folders, enter product codes, and download matched files as a ZIP archive.',
    
    // File Upload
    fileUpload: 'File Upload',
    fileUploadDescription: 'Drag and drop files or folders, or use the buttons below',
    dropFilesHere: 'Drop files or folders here',
    orClickToBrowse: 'or click to browse files',
    selectFiles: 'Select Files',
    selectFolder: 'Select Folder',
    filesLoaded: 'files loaded',
    
    // Search Configuration
    searchConfiguration: 'Search Configuration',
    searchConfigurationDescription: 'Configure product codes and file filters',
    productCodesLabel: 'Product codes to match (one per line or comma-separated)',
    productCodesPlaceholder: 'DCA-4901\nDCA-493\nDCA-3936, DCA-382W',
    fileTypeFilter: 'File type filter (optional)',
    fileTypeFilterDescription: 'File type filter (optional)',
    matchFiles: 'Match Files',
    processing: 'Processing...',
    
    // File Types
    allTypes: 'All types',
    pdf: 'PDF (.pdf)',
    jpeg: 'JPEG (.jpg, .jpeg)',
    png: 'PNG (.png)',
    excel: 'Excel (.xlsx, .xls)',
    word: 'Word (.docx, .doc)',
    powerpoint: 'PowerPoint (.pptx, .ppt)',
    text: 'Text (.txt)',
    csv: 'CSV (.csv)',
    
    // Results
    matchedFiles: 'Matched Files',
    matchedFilesDescription: 'Files containing the specified product codes',
    downloadZip: 'Download ZIP',
    creatingZip: 'Creating ZIP...',
    unmatchedCodes: 'Unmatched Product Codes',
    unmatchedCodesDescription: 'These product codes were not found in any uploaded files',
    
    // Messages
    pleaseUploadFiles: 'Please upload files first',
    pleaseEnterCodes: 'Please enter product codes to match',
    pleaseEnterValidCodes: 'Please enter valid product codes',
    noFilesMatched: 'No files matched the given product codes. Searched in {count} files.',
    foundMatchingFiles: 'Found {count} matching files',
    errorMatchingFiles: 'Error matching files. Please try again.',
    noMatchedFilesToDownload: 'No matched files to download',
    downloadedFilesAsZip: 'Downloaded {count} files as ZIP',
    errorCreatingZip: 'Error creating ZIP file. Please try again.',
    successfullyLoadedFiles: 'Successfully loaded {count} files',
    errorProcessingFiles: 'Error processing files. Please try again.',
    errorLoadingFiles: 'Error loading files. Please try again.',
    
    // Progress
    creatingZipFile: 'Creating ZIP file...',
    processingFiles: 'Processing files...',
    
    // Footer
    toolFooter: `What problem does this tool solve?
In daily work, we often face the following issues:
- Need to quickly find specific files from a large number of folders (such as product manuals, certificates, images, etc.)
- Files are scattered, manual searching is time-consuming and laborious
- Users don't know exactly where the files are stored

This tool uses keyword matching and visual selection to achieve:
✅ Quickly import folders or files by drag-and-drop
✅ Enter keywords to intelligently identify target files
✅ One-click to download matched results as a ZIP
✅ No need to browse every directory manually, greatly improving efficiency

What do users care about most?
- Fast file search! With keyword input and batch drag-and-drop, users can locate target files in seconds
- Clear interface, simple operation
- No installation required, use online, drag and drop files instantly
- Reliable results, accurate matching
- Precise keyword recognition (such as product model, client name, date, etc.)
- Download immediately, no manual selection needed
- Matched files are directly packaged for download, saving steps

✨ Usage Tips  
Supported formats: .pdf, .jpg, .png, .xlsx, .docx, etc.  
It is recommended to use product model and keyword combinations for searching (e.g., DCA-4901 invoice)`
  },
  zh: {
    // Header
    title: '文件匹配器专业版',
    subtitle: '拖拽文件或文件夹，输入产品代码，下载匹配的文件为ZIP压缩包。',
    
    // File Upload
    fileUpload: '文件上传',
    fileUploadDescription: '拖拽文件或文件夹，或使用下方按钮',
    dropFilesHere: '拖拽文件或文件夹到此区域',
    orClickToBrowse: '或点击浏览文件',
    selectFiles: '选择文件',
    selectFolder: '选择文件夹',
    filesLoaded: '个文件已加载',
    
    // Search Configuration
    searchConfiguration: '搜索配置',
    searchConfigurationDescription: '配置产品代码和文件过滤器',
    productCodesLabel: '要匹配的产品代码（每行一个或用逗号分隔）',
    productCodesPlaceholder: 'DCA-4901\nDCA-493\nDCA-3936, DCA-382W',
    fileTypeFilter: '文件类型过滤器（可选）',
    fileTypeFilterDescription: '文件类型过滤器（可选）',
    matchFiles: '匹配文件',
    processing: '处理中...',
    
    // File Types
    allTypes: '所有类型',
    pdf: 'PDF (.pdf)',
    jpeg: 'JPEG (.jpg, .jpeg)',
    png: 'PNG (.png)',
    excel: 'Excel (.xlsx, .xls)',
    word: 'Word (.docx, .doc)',
    powerpoint: 'PowerPoint (.pptx, .ppt)',
    text: '文本 (.txt)',
    csv: 'CSV (.csv)',
    
    // Results
    matchedFiles: '匹配的文件',
    matchedFilesDescription: '包含指定产品代码的文件',
    downloadZip: '下载ZIP',
    creatingZip: '创建ZIP中...',
    unmatchedCodes: '未匹配的产品代码',
    unmatchedCodesDescription: '这些产品代码在已上传的文件中未找到',
    
    // Messages
    pleaseUploadFiles: '请先上传文件',
    pleaseEnterCodes: '请输入要匹配的产品代码',
    pleaseEnterValidCodes: '请输入有效的产品代码',
    noFilesMatched: '没有文件匹配给定的产品代码。在{count}个文件中搜索。',
    foundMatchingFiles: '找到{count}个匹配文件',
    errorMatchingFiles: '匹配文件时出错。请重试。',
    noMatchedFilesToDownload: '没有匹配的文件可下载',
    downloadedFilesAsZip: '已下载{count}个文件为ZIP',
    errorCreatingZip: '创建ZIP文件时出错。请重试。',
    successfullyLoadedFiles: '成功加载{count}个文件',
    errorProcessingFiles: '处理文件时出错。请重试。',
    errorLoadingFiles: '加载文件时出错。请重试。',
    
    // Progress
    creatingZipFile: '创建ZIP文件中...',
    processingFiles: '处理文件中...',
    
    // Footer
    toolFooter: `这个工具解决了什么问题？
在日常工作中，我们经常面临以下问题：
- 需要从大量文件夹中快速查找特定文件（如产品手册、证书、图片等）
- 文件分散存放，人工查找费时费力
- 用户不知道文件到底存在于哪里

本工具通过关键词匹配+可视化选择，实现：
✅ 拖拽文件夹或文件快速导入
✅ 输入关键词，智能识别目标文件
✅ 一键打包下载匹配结果
✅ 无需手动浏览每个目录，提高效率

用户最在意的是什么？
- 找文件要快！通过关键词输入和批量拖拽，让用户在几秒钟内定位目标文件
- 界面清晰、操作简单
- 无需安装，在线使用，文件即拖即用
- 结果可靠、匹配精准
- 精准关键词识别（如产品型号、客户名、日期等）
- 可立即下载、无需手动挑选
- 匹配的文件直接打包下载，节省操作步骤

✨ 使用建议  
支持上传格式：.pdf, .jpg, .png, .xlsx, .docx 等  
推荐使用产品型号、关键词组合来查找（如：DCA-4901 invoice）`
  }
}

export function formatMessage(message: string, params: Record<string, string | number> = {}): string {
  return message.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
} 