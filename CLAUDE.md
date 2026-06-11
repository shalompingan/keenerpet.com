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
| Walk | 绿色 | `#10b981` |
| Insurance | 玫红 | `#e11d48` |

## 文件结构
```
keenerpet.com/
├── index.html                  # 首页 — Pet Food Calculator
├── pet-age-calculator/index.html
├── pet-water-intake/index.html
├── pet-calorie-calculator/index.html
├── pet-walking-calculator/index.html
├── pet-insurance/index.html
├── privacy/index.html
├── guides/
│   └── dog-walking-guide/index.html   # SEO 指南文章
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
- Google Analytics 4（ID：`G-J3DHX71CRB`）

## 联盟营销
- **Chewy（Partnerize）**：4% 佣金，30 天 cookie 有效期
  - 不赚佣金：处方粮、药品、礼品卡
  - 链接用 `rel="sponsored"`
- **Amazon Associates**：~3%（180 天需 3 单，新站谨慎）
- **宠物保险**：Lemonade / Healthy Paws，$25-150/lead
- 搜索类链接（非具体产品页）更安全，自动适配品类

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
- [x] 替换 GA4 ID 为真实 ID（G-J3DHX71CRB）
- [x] 注册 Chewy 联盟账号（Partnerize）
- [ ] 获取 Partnerize Camref ID 并加入链接
- [ ] 注册 Amazon Associates
- [ ] 注册 Awin（备选联盟平台）
- [x] 部署到 Cloudflare Pages
- [x] 添加 FAQ 区块提升 SEO
- [x] 写 SEO 文章（dog-walking-guide 首发）
- [ ] 下一篇 SEO 文章
