# Tier 2: 反向保险精算器 — 待机存档

> 存档日期：2026-06-19
> 状态：待流量达标后启动
> 启动条件：首页风险横幅累计 ≥100 次 `insurance_cta_click`

---

## 核心逻辑

用户输入"每月能承受的医疗支出" → 工具反向精算所需保额 → 匹配推荐具体保险方案 + 联盟链接。

**精算链：**
```
月可承受支出 → 年预算
  → 扣除保费（按 breed/age 动态取值）
  → 剩余可用于自付的金额
  → 反推合理免赔额（deductible）
  → 反推最低年保额（annual coverage limit）
  → 匹配具体 provider 方案 + affiliate CTA
```

**示例场景：**
用户选 "每月能承担 $80" → 猫/成年/中型 → $43 保费 → 剩余 $37/月 = $444/年自付能力 → 建议 $500 免赔额 + $10,000 保额 → 推荐 Lemonade（$36/mo）+ Healthy Paws（$40/mo）→ CTA 跳转

## 用户输入字段

| 字段 | 类型 | 选项 |
|------|------|------|
| Pet Type | select | Dog / Cat |
| Age | select | Puppy / Young / Adult / Senior |
| Breed Size | select | Small / Medium / Large / Giant（仅 Dog 显示） |
| Monthly budget for vet bills | slider 或 select | $20 / $40 / $60 / $80 / $100 / $150 / $200+ |

## 输出结果

- 建议保额（$10,000 / $15,000 / $20,000 / unlimited）
- 建议免赔额（$250 / $500 / $1,000）
- 推荐 provider 卡片（价格、评分、特点、CTA）
- 关键对比：无保险 vs 有保险的年度风险对比（复用首页风险横幅的精算逻辑）

## 流量启动条件

待以下任一指标达成时启动开发：
- 首页风险横幅累计 ≥100 次 `insurance_cta_click` 事件
- 月均首页计算器使用量 ≥3,000 次 `calculate_complete`
- 站点评分（DR）≥15，可竞争 "how much pet insurance do I need" 类长尾词

## 技术要点

- 独立页面：`/pet-insurance/` 替换或新增精算器模块（保留现有比价内容作为下半部分）
- GA4 事件：`ins_calculator_view`、`ins_calculator_budget_selected`、`ins_calculator_cta_click`
- Appliance Schema：WebApplication
- 联盟链接复用 Partnerize（与首页横幅同一 camref ID）

## 关联文档

- `../.assets/risk-gap-banner-deployment-white-paper-v1.0.md`（Tier 1，已完成并部署）
- 本精算器为 Tier 2，Tier 3（每项费用旁独立 "Insure This" 按钮）待定
