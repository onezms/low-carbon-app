# DNS配置验证指南

## 验证DNS是否配置正确

### 方法1: 使用nslookup命令

打开命令提示符或PowerShell，运行：

```bash
nslookup dtshgj.top
```

期望输出应该显示：
```
Address: 185.199.108.153
```

### 方法2: 使用在线工具

访问以下网站验证DNS：

1. https://dnschecker.org/
   - 输入: dtshgj.top
   - 查看A记录是否指向185.199.108.153

2. https://dns.google.com/
   - 搜索: dtshgj.top
   - 查看A记录

### 方法3: 使用ping命令

```bash
ping dtshgj.top
```

应该能收到响应，IP地址应该是185.199.108.153

## 常见DNS记录值

GitHub Pages的IP地址：
- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

## 如果DNS配置正确但仍显示错误

1. **等待DNS传播**
   - DNS更改可能需要时间生效
   - 等待1-24小时

2. **清除DNS缓存**
   - Windows: `ipconfig /flushdns`
   - macOS: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`

3. **检查GitHub Pages设置**
   - 确保Custom domain设置为dtshgj.top
   - 确保Enforce HTTPS已启用

## 验证成功标志

DNS配置成功后，你应该看到：
- ✅ GitHub Pages设置页面显示"DNS configuration is correct"
- ✅ 访问 https://dtshgj.top 能看到网站
- ✅ 访问 https://onezms.github.io/low-carbon-app 也能看到网站

## 需要帮助？

如果按照以上步骤仍然无法配置DNS，请告诉我：
1. 你使用的是哪个域名注册商？
2. DNS管理面板显示什么？
3. nslookup命令的输出是什么？
