# 如何手动触发GitHub Actions部署

## Run Workflow按钮位置

### 步骤1: 访问Actions页面

打开以下链接：
```
https://github.com/onezms/low-carbon-app/actions
```

### 步骤2: 找到工作流

在页面左侧，你会看到一个列表，找到 **"Deploy to GitHub Pages"** 这个工作流

### 步骤3: 点击工作流

点击 "Deploy to GitHub Pages" 这一行

### 步骤4: 找到Run Workflow按钮

点击工作流后，页面会跳转到该工作流的详细页面。

**Run Workflow按钮位置：**
- 在页面顶部，靠近标题的地方
- 通常在 "Deploy to GitHub Pages" 标题的右侧
- 按钮上会显示 "Run workflow"

### 步骤5: 选择分支并运行

点击 "Run workflow" 按钮后：
1. 会弹出一个下拉菜单
2. 选择 **Branch: master**
3. 点击 **Run workflow** 按钮

## 如果没有Run Workflow按钮

如果页面上没有 "Run workflow" 按钮，可能是因为：

1. **工作流配置问题**
   - 确保工作流文件中有 `workflow_dispatch` 触发器
   - 当前配置已包含 `workflow_dispatch`

2. **权限问题**
   - 确保你是仓库的管理员或拥有者

3. **工作流未激活**
   - 首次推送代码后，工作流才会激活

## 替代方案：等待自动触发

如果手动触发不可用，可以：

1. **推送空提交触发**
   ```bash
   git commit --allow-empty -m "Trigger deployment"
   git push origin master
   ```

2. **等待下一次推送**
   - 每次推送到master分支都会自动触发部署

## 验证部署

部署触发后：
1. 返回 https://github.com/onezms/low-carbon-app/actions
2. 查看工作流是否显示 "In progress"
3. 等待1-2分钟，应该显示绿色 ✓

## 需要帮助？

如果按照以上步骤仍然找不到Run Workflow按钮，请告诉我：
1. 你看到的Actions页面是什么样子？
2. 页面上有哪些按钮？
3. 工作流列表显示什么？
