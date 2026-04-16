# Run Workflow按钮位置指南

## 正确的按钮位置

### 方法1: 通过Actions页面

1. **访问Actions页面**
   ```
   https://github.com/onezms/low-carbon-app/actions
   ```

2. **找到工作流**
   - 在左侧列表中找到 "Deploy to GitHub Pages"
   - 这是一个工作流名称

3. **点击工作流**
   - 点击 "Deploy to GitHub Pages" 这一行
   - 页面会跳转到工作流详情页

4. **找到Run Workflow按钮**
   - 在详情页顶部
   - 通常在标题 "Deploy to GitHub Pages" 的右侧
   - 按钮上写着 "Run workflow"

### 方法2: 直接访问工作流

访问以下链接直接进入工作流页面：
```
https://github.com/onezms/low-carbon-app/actions/workflows/deploy.yml
```

然后点击右上角的 **Run workflow** 按钮

### 方法3: 使用分支下拉菜单

1. 访问 https://github.com/onezms/low-carbon-app/actions
2. 点击顶部的分支下拉菜单（默认显示 "master"）
3. 选择 "Deploy to GitHub Pages" 工作流
4. 点击 "Run workflow" 按钮

## 如果找不到按钮

### 检查工作流配置

确保工作流文件包含 `workflow_dispatch`：

```yaml
on:
  push:
    branches: [ master ]
  workflow_dispatch:  # 这一行必须存在
```

当前配置已包含此行。

### 检查权限

确保你有仓库的写入权限。

### 检查工作流状态

如果工作流从未运行过，可能需要先推送一次代码来激活它。

## 替代方案

如果仍然找不到按钮，可以：

1. **推送空提交触发**
   ```bash
   git commit --allow-empty -m "Trigger deployment"
   git push origin master
   ```

2. **等待自动触发**
   - 每次推送到master分支都会自动触发部署

## 需要帮助？

如果按照以上步骤仍然无法找到按钮，请告诉我：
1. 你访问的URL是什么？
2. 页面上显示什么内容？
3. 截图或描述按钮区域
