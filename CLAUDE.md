# KeenerPet — Project Guide

## 项目概述
宠物工具网站，静态 HTML 多页站点，Cloudflare Pages 部署。主要通过联盟营销（Chewy、Amazon、宠物保险）变现。

## 技术栈
- 纯静态 HTML（无框架、无 SPA）
- CSS：共享 `style.css` + 每个页面独立 `:root` 颜色变量
- 部署：Cloudflare Pages + `_worker.js`（邮件 API）
- 导航：`<link rel="prefetch">` 预加载页面（非 SPA）
- 字体：Inter（Google Fonts）

## 页面主题色
| 页面 | 主题色 | Primary |
|------|--------|---------|
| 首页 (Food) | 青色 | `#0d9488` |
| Age | 紫色 | `#8b5cf6` |
| Water | 蓝色 | `#0ea5e9` |
| Calories | 橙色 | `#f97316` |
| Insurance | 玫红 | `#e11d48` |

## 文件结构
```
keenerpet.com/
├── index.html                  # 首页 — Pet Food Calculator
├── pet-age-calculator/index.html
├── pet-water-intake/index.html
├── pet-calorie-calculator/index.html
├── pet-insurance/index.html
├── privacy/index.html
├── style.css                   # 共享样式（全局通用）
├── _worker.js                  # Cloudflare Worker API
├── wrangler.toml               # Cloudflare Pages 配置
├── sitemap.xml
├── robots.txt
└── .git/
```

## 添加新工具页面的步骤
1. 创建 `新工具名/index.html`
2. 在 `<head>` 引用 `/style.css`
3. 内联 `<style>:root { --primary: ... }` 设置主题色
4. 加入 `<link rel="prefetch">` 预加载其他页面
5. 加 `<nav>` 当前页 `active` 类
6. 使用完整 footer 网格
7. 添加 OG / Twitter Card 元标签
8. 注册新路由到 `wrangler.toml`（如需自定义域名）
9. 更新 `sitemap.xml`

## SEO 规范
- 每个工具独立 URL（权重不分散）
- 首页有 WebApplication + WebSite Schema
- 子页面有 WebApplication Schema
- OG + Twitter Card 每页都要配齐
- Google Analytics 4（ID 占位符：`G-XXXXXXXXXX`）

## 联盟营销
- Chewy：4-8% 佣金
- Amazon Associates：~3%
- 宠物保险：$25-150/lead
- 链接用 `rel="sponsored"`

## 部署
```bash
# 手动部署
npx wrangler pages deploy .

# 日常更新（自动部署）
git add .
git commit -m "描述改动"
git push
```

## 设计规范
- 字体：Inter 400/500/600/700/800
- 卡片圆角：12px / 16px
- 阴影：`0 10px 30px rgba(0,0,0,0.08)`
- 响应式断点：480px / 540px / 600px / 640px
- 配色：暖色基调（`#fafaf9` 背景，`#292524` 文字）

## 待办
- [ ] 替换 `G-XXXXXXXXXX` 为真实 GA4 ID
- [ ] 注册 Chewy 联盟账号
- [ ] 注册 Amazon Associates
- [ ] 部署到 Cloudflare Pages
