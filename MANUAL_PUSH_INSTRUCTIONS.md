# 🚨 紧急手动推送指南

## 问题
网络连接 GitHub 失败，无法自动推送代码。

## 已完成的修复 ✅

1. ✅ vite.config.js - 已配置 `base: '/low-carbon-app/'`
2. ✅ .github/workflows/deploy.yml - 已更新为官方 GitHub Pages action
3. ✅ 本地构建已完成

## ⚠️ 需要手动推送

由于网络问题，请**手动执行以下命令**：

### 方法 1：命令行推送（推荐）

打开终端（PowerShell 或 CMD），在项目目录下执行：

```bash
git push origin master
```

如果上面失败，尝试使用 Git Bash：

```bash
git push origin master
```

### 方法 2：使用 GitHub Desktop

1. 打开 GitHub Desktop
2. 看到 "Use official GitHub Pages actions" 提交
3. 点击 "Push origin" 按钮

### 方法 3：使用 VS Code

1. 打开 VS Code
2. 点击左侧"源代码管理"图标
3. 点击"..."菜单
4. 选择"推送"

### 方法 4：直接在 GitHub 网站上手动触发

1. 访问 https://github.com/onezms/low-carbon-app/actions
2. 点击 "Deploy to GitHub Pages" 工作流
3. 点击 "Run workflow" 按钮
4. 选择 master 分支
5. 点击 "Run workflow"

## 推送后的验证步骤

### 步骤 1：检查 Actions 状态

访问：https://github.com/onezms/low-carbon-app/actions

等待工作流显示绿色 ✓（大约 1-2 分钟）

### 步骤 2：访问网站

访问：https://onezms.github.io/low-carbon-app/

应该能看到你的应用！

### 步骤 3：检查自定义域名

访问：https://dtshgj.top

## 如果还是 404

1. **等待 5 分钟** - GitHub Pages 需要时间更新
2. **清除浏览器缓存** - 按 Ctrl+Shift+Delete
3. **强制刷新** - 按 Ctrl+F5
4. **使用无痕模式** - Ctrl+Shift+N（Chrome）或 Ctrl+Shift+P（Firefox）

## 检查 GitHub Pages 设置

1. 访问 https://github.com/onezms/low-carbon-app/settings/pages
2. 确认 **Source** 设置为 **GitHub Actions**
3. 如果有 Custom domain，确认是 `dtshgj.top`

## 需要帮助？

推送后如果还有问题，请告诉我：
1. 推送是否成功
2. Actions 页面显示什么状态
3. 访问网站显示什么错误
