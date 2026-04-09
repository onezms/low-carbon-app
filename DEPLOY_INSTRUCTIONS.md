# 部署说明

## 已完成的配置

1. ✅ 创建了GitHub Actions部署配置文件 `.github/workflows/deploy.yml`
2. ✅ 创建了域名绑定文件 `CNAME`
3. ✅ 项目已构建成功

## 手动部署步骤

### 步骤1: 推送代码到GitHub

```bash
# 添加所有文件
git add .

# 提交
git commit -m "Add GitHub Actions deploy and CNAME"

# 推送到GitHub
git push origin master
```

### 步骤2: 在GitHub启用Pages

1. 访问 https://github.com/onezms/low-carbon-app
2. 进入 **Settings** → **Pages**
3. 在 **Build and deployment** 部分：
   - **Source**: 选择 **GitHub Actions**
   - 保存设置

### 步骤3: 配置自定义域名

1. 在Pages设置页面，找到 **Custom domain** 部分
2. 输入你的域名：`dtshgj.top`
3. 点击 **Save**
4. GitHub会自动创建DNS记录（通常需要几分钟到几小时生效）

### 步骤4: 配置DNS记录

在你的域名注册商（dtshgj.top）的DNS管理面板中，添加以下记录：

**选项A - 使用CNAME（推荐）:**
- 类型: CNAME
- 主机名: @ (或留空)
- 值: onezms.github.io
- TTL: 300 (或默认)

**选项B - 使用A记录:**
- 类型: A
- 主机名: @ (或留空)
- 值: 185.199.108.153
- TTL: 300

同时为www子域名添加：
- 类型: CNAME
- 主机名: www
- 值: dtshgj.top
- TTL: 300

### 步骤5: 等待DNS生效

DNS传播通常需要：
- 最快: 几分钟
- 通常: 1-24小时
- 最长: 48小时

### 步骤6: 验证部署

1. 访问 `https://dtshgj.top` 查看网站
2. 如果使用了GitHub Pages默认域名，访问 `https://onezms.github.io/low-carbon-app`

## GitHub Actions部署流程

每次你推送到master分支时，GitHub Actions会自动：
1. 检出代码
2. 安装依赖
3. 构建项目
4. 部署到GitHub Pages

## 注意事项

⚠️ **数据存储**: 应用使用浏览器localStorage存储数据，每个用户的数据独立存储在自己的浏览器中。

⚠️ **HTTPS**: GitHub Pages自动提供HTTPS证书，你的域名也会自动配置SSL证书（可能需要几分钟）。

⚠️ **DNS缓存**: 如果DNS未生效，可以尝试清除本地DNS缓存：
- Windows: `ipconfig /flushdns`
- macOS: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`

## 故障排除

**问题**: 域名无法访问
- 检查DNS记录是否正确
- 等待DNS传播完成
- 检查GitHub Pages设置

**问题**: HTTPS证书未配置
- 等待GitHub自动配置（通常几分钟）
- 在Pages设置中点击"Enforce HTTPS"

**问题**: 404错误
- 检查CNAME文件内容是否正确
- 确认GitHub Pages源设置为GitHub Actions

## 支持

如有问题，请检查：
1. GitHub Actions工作流日志
2. GitHub Pages设置
3. DNS记录配置
