@echo off
echo ========================================
echo  低碳生活管家 - 快速部署脚本
echo ========================================
echo.

echo [1/4] 检查构建...
npm run build
if %errorlevel% neq 0 (
    echo 构建失败！请检查错误。
    pause
    exit /b 1
)
echo 构建成功！
echo.

echo [2/4] 初始化 Git 仓库...
if not exist .git (
    git init
    echo Git 仓库已初始化
) else (
    echo Git 仓库已存在
)
echo.

echo [3/4] 添加文件到 Git...
git add .
git commit -m "Update for web deployment"
echo 文件已提交
echo.

echo [4/4] 下一步操作指南：
echo.
echo 选项 A - 使用 Vercel（推荐）：
echo   1. 访问 https://vercel.com
echo   2. 使用 GitHub 账号登录
echo   3. 点击 "Add New Project"
echo   4. 选择您的仓库
echo   5. 配置：
echo      - Build Command: npm run build
echo      - Output Directory: dist
echo   6. 点击 Deploy
echo.
echo 选项 B - 使用 Netlify：
echo   1. 访问 https://netlify.com
echo   2. 使用 GitHub 账号登录
echo   3. 点击 "New site from Git"
echo   4. 选择您的 GitHub 仓库
echo   5. 配置：
echo      - Build command: npm run build
echo      - Publish directory: dist
echo   6. 点击 Deploy
echo.
echo 选项 C - 手动上传 dist 目录：
echo   1. 将 dist 目录压缩
echo   2. 上传到任何静态托管服务
echo   3. 配置域名（可选）
echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
pause
