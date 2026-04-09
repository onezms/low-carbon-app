# 低碳生活管家 - 部署指南

## 免费部署方案（推荐）

### 方案一：Vercel（最简单）

#### 步骤 1：准备代码
```bash
# 确保构建成功
npm run build
```

#### 步骤 2：推送到 GitHub
```bash
# 初始化 git（如果还没有）
git init

# 添加文件
git add .

# 提交
git commit -m "Initial commit"

# 创建 GitHub 仓库并推送
git remote add origin https://github.com/your-username/low-carbon-app.git
git push -u origin main
```

#### 步骤 3：部署到 Vercel
1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择您的仓库 `low-carbon-app`
5. 配置项目：
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. 点击 "Deploy"

#### 步骤 4：绑定自定义域名（可选）
1. 在 Vercel 项目设置中找到 "Domains"
2. 添加您的域名（如 `lowcarbon.com`）
3. 在域名注册商处配置 DNS 记录：
   - 类型: `CNAME`
   - 名称: `www`（或您的子域名）
   - 值: `cname.vercel-dns.com`

---

### 方案二：Netlify

#### 步骤 1：推送到 GitHub（同上）

#### 步骤 2：部署到 Netlify
1. 访问 https://netlify.com
2. 使用 GitHub 账号登录
3. 点击 "New site from Git"
4. 选择您的 GitHub 仓库
5. 配置构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. 点击 "Deploy site"

#### 步骤 3：绑定自定义域名
1. 进入站点设置 → "Domain settings"
2. 添加自定义域名
3. 配置 DNS 记录（A 记录或 CNAME）

---

### 方案三：GitHub Pages

#### 步骤 1：推送到 GitHub（同上）

#### 步骤 2：配置 GitHub Pages
1. 进入仓库 → Settings → Pages
2. Source 选择 "GitHub Actions"
3. 创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 步骤 3：绑定自定义域名
1. 在仓库根目录创建 `CNAME` 文件，内容为您的域名
2. 推送到 GitHub
3. 在 GitHub Pages 设置中配置

---

## 部署后

部署成功后，您会获得一个 URL：
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`
- GitHub Pages: `https://your-username.github.io/low-carbon-app`

访问该 URL 即可使用您的低碳生活管家应用！

## 注意事项

⚠️ **数据存储**：
- 应用使用浏览器 `localStorage` 存储数据
- 每个用户的数据独立存储在自己的浏览器中
- 如需用户账号和云端同步，需要搭建后端服务器

⚠️ **浏览器兼容性**：
- 确保用户使用现代浏览器（Chrome, Firefox, Edge, Safari）
- localStorage 有 5-10MB 的存储限制

---

## 常见问题

**Q: 部署后数据丢失了怎么办？**
A: 这是正常的，因为数据存储在浏览器本地。如果用户清除浏览器缓存，数据会丢失。

**Q: 如何备份数据？**
A: 可以让用户定期导出数据，或者搭建后端服务器实现云端同步。

**Q: 自定义域名多久生效？**
A: DNS 解析通常需要几分钟到几小时不等。
