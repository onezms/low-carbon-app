# GitHub Actions 部署失败修复指南

## 问题：工作流显示红色❌

### 可能原因和解决方案

#### 原因1: Pages源未设置为GitHub Actions

**症状**: Pages设置页面显示"Your site is not published"或"Source: None"

**解决方案**:
1. 访问 https://github.com/onezms/low-carbon-app/settings/pages
2. 在 **Build and deployment** 部分
3. 找到 **Source** 选项
4. 选择 **GitHub Actions**
5. 点击 **Save**

#### 原因2: 构建失败

**症状**: 工作流日志中显示npm install或npm run build失败

**解决方案**:
检查工作流日志中的具体错误信息，常见问题：

1. **Node.js版本问题**
   - 确保使用Node.js 18或更高版本
   - 当前配置已设置为 '18'

2. **依赖安装失败**
   - 检查package.json是否正确
   - 尝试清理缓存后重新构建

3. **构建命令错误**
   - 确保package.json中有"build"脚本
   - 当前配置: `"build": "vite build"`

#### 原因3: 权限问题

**症状**: 部署步骤失败，显示权限错误

**解决方案**:
GitHub Actions默认有权限部署到Pages，无需额外配置。

### 快速诊断步骤

1. **查看工作流日志**
   - 访问 https://github.com/onezms/low-carbon-app/actions
   - 点击失败的工作流
   - 查看每个步骤的详细日志
   - 找到红色的错误信息

2. **检查Pages设置**
   - 访问 https://github.com/onezms/low-carbon-app/settings/pages
   - 确认Source设置为GitHub Actions
   - 查看Pages状态

3. **检查分支**
   - 确保推送的是master分支
   - 当前配置只监听master分支

### 手动触发重新部署

1. 访问 https://github.com/onezms/low-carbon-app/actions
2. 点击 "Deploy to GitHub Pages" 工作流
3. 点击 **Run workflow**
4. 选择 master 分支
5. 点击 **Run workflow**

### 常见错误和解决

**错误1: "ref 'refs/heads/master' not found"**
- 解决: 确保本地有master分支并已推送

**错误2: "Cannot find module"**
- 解决: 检查node_modules是否被.gitignore忽略（应该忽略）

**错误3: "Permission denied"**
- 解决: GitHub Actions默认有权限，无需处理

**错误4: "404 Not Found"**
- 解决: 检查publish_dir是否正确指向./dist

### 验证部署

部署成功后，你应该能看到：

1. **工作流显示绿色✓**
2. **Pages设置页面显示"Your site is live at"**
3. **可以访问 https://onezms.github.io/low-carbon-app**

### 需要帮助？

如果按照以上步骤仍然失败，请提供：

1. 工作流日志中的具体错误信息
2. Pages设置页面的截图或描述
3. 你看到的错误类型
