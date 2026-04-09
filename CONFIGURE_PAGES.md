# GitHub Pages 配置完整指南

## 问题诊断

你看到"没有page"或"404"错误，说明GitHub Pages还没有正确配置。

## 解决方案

### 步骤1: 启用GitHub Pages

1. 访问 https://github.com/onezms/low-carbon-app
2. 点击顶部的 **Settings** 标签（不是Repository标签）
3. 在左侧菜单中找到 **Pages**（可能需要向下滚动）
4. 在 **Build and deployment** 部分：
   - 找到 **Source** 选项
   - 点击下拉菜单，选择 **GitHub Actions**
   - 向下滚动，点击 **Save** 保存
   - 保存后，页面会刷新并显示部署状态

### 步骤2: 触发首次部署

有两种方式触发部署：

**方式A: 手动触发（推荐）**
1. 访问 https://github.com/onezms/low-carbon-app/actions
2. 在左侧找到 "Deploy to GitHub Pages" 工作流
3. 点击它
4. 点击右上角的 **Run workflow** 按钮
5. 在下拉菜单中选择 **Branch: master**
6. 点击 **Run workflow** 按钮
7. 等待部署完成（约1-2分钟）

**方式B: 推送代码触发**
```bash
git commit --allow-empty -m "Trigger deployment"
git push origin master
```

### 步骤3: 检查部署状态

1. 访问 https://github.com/onezms/low-carbon-app/actions
2. 你会看到一个工作流正在运行或已完成
3. 点击工作流查看详细日志
4. 确保所有步骤都显示绿色的 ✓

### 步骤4: 访问你的网站

部署成功后，你可以通过以下地址访问：

**默认GitHub Pages地址**:
```
https://onezms.github.io/low-carbon-app
```

**自定义域名地址** (dtshgj.top):
- 需要在GitHub Pages设置中配置
- 需要在域名DNS管理中添加CNAME记录

### 步骤5: 配置自定义域名（可选）

如果要使用 dtshgj.top：

1. 在GitHub Pages设置页面，找到 **Custom domain** 部分
2. 输入：`dtshgj.top`
3. 点击 **Save**
4. GitHub会自动配置SSL证书

5. 在你的域名注册商（dtshgj.top）DNS管理中添加：
   - 类型: CNAME
   - 主机名: @
   - 值: onezms.github.io
   - TTL: 300

## 常见问题

### Q: 找不到Pages设置
A: 确保你点击的是仓库的 **Settings** 标签，不是 **Code** 标签

### Q: Source选项没有GitHub Actions
A: 这是正常的，如果仓库是新建的。直接选择GitHub Actions即可

### Q: 部署失败
A: 检查：
- Node.js版本是否正确（需要18+）
- npm install是否成功
- npm run build是否成功

### Q: 域名无法访问
A: DNS传播需要时间，通常几分钟到24小时

## 验证部署

部署成功后，访问：
- https://onezms.github.io/low-carbon-app

你应该能看到低碳生活管家应用的首页。

## 需要帮助？

如果按照以上步骤操作后仍然有问题，请告诉我：
1. GitHub Pages设置页面显示什么？
2. GitHub Actions工作流显示什么状态？
3. 你访问的具体URL是什么？
