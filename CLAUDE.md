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
| 首页 (Cost) | 琥珀 | `#d97706` |
| Food | 青色 | `#0d9488` |
| Age | 紫色 | `#8b5cf6` |
| Water | 蓝色 | `#0ea5e9` |
| Calories | 橙色 | `#f97316` |
| Walk | 绿色 | `#10b981` |
| Insurance | 玫红 | `#e11d48` |

## 文件结构
```
keenerpet.com/
├── index.html                  # 首页 — Pet Cost Calculator（养宠成本计算器）
├── pet-food-calculator/index.html   # Pet Food Calculator（子页面）
├── pet-age-calculator/index.html
├── pet-water-intake/index.html
├── pet-calorie-calculator/index.html
├── pet-walking-calculator/index.html
├── pet-insurance/index.html
├── privacy/index.html
├── guides/
│   └── dog-walking-guide/index.html   # SEO 指南文章
├── logo.svg                     # 宠物 Logo（透明背景 SVG，内嵌 PNG）
├── logo-cat.svg                 # 原猫图标 logo（保留备用）
├── favicon.svg                  # 浏览器标签图标（宠物 logo 透明版）
├── favicon.png                  # 32×32 PNG 版 favicon
├── apple-touch-icon.png         # 180×180 iPhone 书签图标
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

## Logo / Favicon

- **Logo 文件**：`/logo.svg`（透明背景，来自图怪兽设计平台的宠物图片）
- **导航栏 logo**：72px 图片，`margin:-22px 0 -22px 0` 负边距保持导航栏高度不变，`margin-right:-12px` 让文字贴紧
- **底部/侧边栏 logo**：72px 图片，正常文档流（无负边距）；底部加 `margin-right:-12px` 文字贴紧
- **Favicon**：`/favicon.svg`（SVG 内嵌 32×32 PNG）+ `/favicon.png` 备用
- **Apple Touch Icon**：`/apple-touch-icon.png`
- **替换规则**：更换 logo 图片时只需替换 `/logo.svg`，无需改动 HTML（各页面引用同文件）
- **手机端**：`style.css` 中 `@media (max-width: 767px)` 将 header 内边距设为 `padding: 0 12px`，logo 更靠左

## 已修改 logo 的页面

| 页面 | 导航栏 | 侧边栏 | 底部 |
|------|--------|--------|------|
| index.html | ✅ | ✅ | ✅ |
| pet-food-calculator/index.html | ✅ | ✅ | ✅ |

其余页面待修改。

## Contact 表单

所有页面底部导航的 Contact 链接通过弹出表单（modal）提交：

- 邮箱配置（Brevo）：
  - 发件人（verified sender）：`cqionglei@gmail.com`
  - 收件人：`support@keenerpet.com`
  - replyTo：用户提交的邮箱
- API 端点：`POST /api/contact`（在 `_worker.js` 中处理）
- 环境变量：`BREVO_KEY`（Cloudflare Pages Production 环境）
- KV 绑定：`NEWSLETTER`（存储提交记录）
- 表单字段：Name / Email / Message
- Modal 插入位置：`</main>` 和 `<footer>` 之间
- 导航 Contact 链接：`onclick="openContact();return false"`
- 内容区邮件链接也要改为弹出表单，而不是 mailto:

## 待办
- [x] 替换 GA4 ID 为真实 ID（G-J3DHX71CRB）
- [x] 注册 Chewy 联盟账号（Partnerize）
- [ ] 获取 Partnerize Camref ID 并加入链接
- [ ] 注册 Amazon Associates
- [ ] 注册 Awin（备选联盟平台）
- [x] 部署到 Cloudflare Pages
- [x] 添加 FAQ 区块提升 SEO
- [x] 写 SEO 文章（dog-walking-guide 首发）
- [x] 写 SEO 文章（dog-feeding-guide）
- [x] 写 SEO 文章（pet-water-guide）
- [x] 写 SEO 文章（pet-age-guide）
- [x] 写 SEO 文章（pet-calorie-guide）
- [x] 写 SEO 文章（pet-insurance-guide）
- [ ] 下一篇 SEO 文章
- [ ] 去 Search Console 更新 sitemap
