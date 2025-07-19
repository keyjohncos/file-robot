# 环境变量设置指南

<<<<<<< HEAD
## 🔐 项目配置

本项目目前不需要特殊的环境变量配置。所有功能都可以在本地开发环境中正常运行。

### 1. 本地开发

启动开发服务器：
=======
## 🔐 保护API Key

为了保护您的API key不被泄露到GitHub，请按照以下步骤设置环境变量：

### 1. 创建本地环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# 在项目根目录执行
touch .env.local
```

### 2. 添加您的API配置

在 `.env.local` 文件中添加以下内容：

```env
# AI API Configuration
AI_API_KEY=sk-WM1F3X2MQqJdZN5DA076Eb4dD1E74bD0Bf36060114E692C3
AI_BASE_URL=https://aihubmix.com/v1
AI_MODEL=gpt-4.1-nano
```

### 3. 验证设置

确保 `.env.local` 文件已被 `.gitignore` 忽略，不会被提交到GitHub。

### 4. Vercel部署设置

如果您使用Vercel部署，需要在Vercel控制台中设置环境变量：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 "Settings" → "Environment Variables"
4. 添加以下环境变量：
   - `AI_API_KEY`: 您的AI API key
   - `AI_BASE_URL`: https://aihubmix.com/v1
   - `AI_MODEL`: gpt-4.1-nano

### 5. 本地开发

启动开发服务器时，环境变量会自动加载：
>>>>>>> 30ca285dbdf341c27899a3c003e3ced915abd8d9

```bash
npm run dev
```

<<<<<<< HEAD
### 2. Vercel部署设置

如果您使用Vercel部署，项目会自动部署，无需额外配置。

## 🔍 验证配置

您可以通过以下方式验证项目是否正常工作：

1. 检查控制台是否有错误信息
2. 测试文件匹配功能是否正常工作
3. 测试打字练习功能是否正常工作
=======
## ⚠️ 安全注意事项

1. **永远不要**将真实的API key提交到GitHub
2. **永远不要**在代码中硬编码API key
3. 定期轮换您的API key
4. 使用最小权限原则，只给API key必要的权限

## 🔍 验证配置

您可以通过以下方式验证环境变量是否正确加载：

1. 检查控制台是否有环境变量相关的错误
2. 测试find-products功能是否正常工作
3. 查看网络请求中是否使用了正确的API端点
>>>>>>> 30ca285dbdf341c27899a3c003e3ced915abd8d9

## 📝 故障排除

如果遇到问题：

<<<<<<< HEAD
1. 确保所有依赖已正确安装
2. 重启开发服务器
3. 检查网络连接
4. 查看浏览器控制台错误信息 
=======
1. 确保 `.env.local` 文件在项目根目录
2. 重启开发服务器
3. 检查环境变量名称是否正确
4. 验证API key是否有效 
>>>>>>> 30ca285dbdf341c27899a3c003e3ced915abd8d9
