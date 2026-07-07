# Risk Gap Banner — Deployment White Paper v1.0

> 归档日期：2026-06-19
> 状态：终审已通过，待研发排期
> 所属项目：KeenerPet 独立站变现资产库

---

## 一、精算风格 Version C 纯文本最终稿（英文）

### 桌面端（PC）

**标题区：**
Your pet's $2,606 annual cost includes a $782 medical risk gap

**正文区：**
Here's the math: a routine $50 vet visit isn't what breaks the budget. It's the 1-in-3 chance of an unexpected illness or injury costing $2,000+ that creates real financial exposure.

| Item | Amount |
|------|--------|
| Total annual pet cost | $2,606 |
| Uninsured medical risk exposure (30%) | $782/year |
| Pet insurance premium (full coverage) | ~$516/year ($43/month) |
| Net exposure after insurance | $66/year |
| Risk reduction | 97% |
| Cost efficiency | $0.20 per $1 of exposure hedged |

For less than the cost of one emergency vet visit per year, you eliminate 97% of your financial downside. At $0.20 per dollar of risk covered, this is the single highest-ROI line item in your pet budget.

**CTA 按钮文案：**
→ Check Pet Insurance Quotes

**脚注：**
Data based on average US pet medical costs (2025–2026). Your actual risk varies by breed, age, and location. Insurance policy terms and exclusions apply — read the fine print. We may earn a commission if you purchase through this link.

---

### 移动端（≤640px）

**标题区：**
$782 medical risk gap — insure for $43/mo?

**内联计算行：**
$2,606 total → $782 uninsured risk → $516/yr insurance → $66 net exposure

**精简三行数据：**
- Risk reduction: 97%
- Cost efficiency: $0.20/$1 hedged
- Net exposure after insurance: $66/yr

**CTA 按钮文案：**
Check Insurance Quotes →

**脚注：**
Avg US data. Terms apply. We may earn a commission.

---

## 二、移动端与 PC 端排版动线指引

### PC 端（>640px）视差层次

横幅位置固定在结果卡片内部，紧接在 Total 金额行下方、其他费用 breakdown 项上方。用户滚动自然看到底部横幅，视觉停留目标不低于两秒。

视觉区隔规则：
- 使用左侧 4px 主题色竖条（琥珀色 #d97706）与普通结果项区分
- 背景色使用暖黄色（#fffbeb），与首页琥珀主题一致
- 数据表格采用三栏无框线排版（label | value | annotation），移动端改为两栏
- CTA 按钮使用琥珀色（#d97706），鼠标悬停时加深至 #b45309

### 移动端（≤640px）垂直流

横幅宽度 100%，上下留白 12px。"Insure for $43/mo →" 整行作为触控热区，点击整行即可触发跳转（增大 touch target）。CTA 按钮固定在横幅底部，全宽，最小高度 48px。

---

## 三、站内"内合围"路径与合规透明度

### 用户心理漏斗

- 步骤一：计算完成 → 看到 $2,606。认知锚定建立。
- 步骤二：看到 $782 gap → "我承担了这么多风险？" 风险觉醒。
- 步骤三：看到 $516/年 即 $43/月 → "其实也没多少钱"。价格锚定对比。
- 步骤四：看到 97% risk reduction → "这很划算"。价值确认。
- 步骤五：点击 CTA → 跳转 Chewy（Partnerize 联盟链接）。转化完成。

### 路径实现逻辑

**触发条件：** 用户点击 Calculate 且计算完成后自动渲染。无需用户额外操作。

**渲染条件守卫（三个条件须同时满足）：**
- 总成本（totalCost）大于 0
- 用户已选择宠物类型（petType 非空）
- 用户已选择体型（petSize 非空）

**隐藏条件（不显示横幅的三种场景）：**
- 用户未选择 pet type 或 size
- totalCost 为 0 或未计算出
- 页面首次加载、用户尚未点击 Calculate 时

**关闭机制：** 横幅右下角提供关闭按钮。用户点击后，系统将 `keenerpet_risk_banner_dismissed` 写为 `true`，存入浏览器本地存储。本次会话中该横幅不再出现。若用户清空本地存储或使用不同设备，横幅恢复正常显示。

### 合规透明度声明

依据 FTC endorsement guides 及 affiliate disclosure 要求，严格执行以下四条：

1. 所有 CTA 链接必须使用 rel="sponsored" 属性标记
2. 脚注必须包含四项内容：数据来源说明（基于美国平均数据）、免责声明（实际风险因品种、年龄、地区而异）、保险条款提醒（保单条款及除外责任适用）、佣金披露（通过链接购买我们可能获得佣金）
3. 禁止使用虚假紧迫感话术，如"限时优惠""仅剩 X 份"等
4. 禁止暗示保险是"必须品"——全文使用建议语气（"consider"），而非强制语气（"you need"）

**合规文案模板（CTA 周边标注，不侵入按钮本身）：**
> See how much pet insurance could protect your budget. If you choose to get a quote, we may earn a commission at no extra cost to you.

---

## 四、研发对接用"数据事件逻辑说明"

### GA4 事件一：`calculate_complete`

在 `calculate()` 函数执行完毕且 DOM 渲染完成后立即触发。

携带参数：
- `tool`：固定值 `cost-calculator`，标识来源工具
- `total_cost`：用户计算得出的总金额，数值型
- `medical_risk`：总成本乘以 0.3 后四舍五入取整，数值型
- `insurance_premium`：固定值 516，数值型
- `risk_gap_shown`：布尔值，由 total_cost 是否大于 0 决定
- `pet_type`：用户当前选中的宠物类型，字符串型
- `pet_size`：用户当前选中的宠物体型，字符串型

### GA4 事件二：`insurance_cta_click`

在用户点击横幅范围内任意 CTA 链接时触发。不阻止浏览器默认跳转行为。

携带参数：
- `tool`：固定值 `cost-calculator`
- `version`：固定值 `C`，标识文案版本
- `strategy`：固定值 `risk_gap`，标识策略类型
- `total_cost`：窗口作用域中最近一次计算的总金额，数值型
- `cta_text`：用户实际点击的 CTA 按钮文本内容，字符串型
- `placement`：固定值 `results_banner`，标识点击位置

### GA4 事件三：`risk_banner_dismiss`

在用户点击横幅关闭按钮时触发。

携带参数：
- `action`：固定值 `dismiss`
- `total_cost`：最近一次计算的总金额，数值型

### 数据流时序

1. 用户点击 Calculate
2. calculate() 函数执行，buildGrid() 渲染费用项
3. showResults() 执行，在结果卡片中插入风险横幅
4. 浏览器立即向 GA4 发送 calculate_complete 事件，携带全部参数
5. 用户浏览横幅内容
6. 用户点击 CTA 链接
7. 浏览器向 GA4 发送 insurance_cta_click 事件，携带全部参数
8. 浏览器新标签页打开 Chewy 联盟链接
9. Partnerize 开始 30 天 cookie 有效期倒计时

### localStorage 存储方案

需要两个存储键：
- `keenerpet_cost_state`：存储用户已选择的 petType、size、budget 和 enabledItems 状态，永久保留
- `keenerpet_risk_banner_dismissed`：用户关闭横幅后写入 `true`，永久保留或设置 30 天过期

---

## 五、纯文字版数据逻辑与渲染规则

### 5.1 渲染函数的执行入口

横幅渲染逻辑不应独立存在，而应作为 `showResults()` 或 `calculate()` 流程末尾的一个子步骤被调用。具体来说，在计算完成、总金额已写入 DOM、结果卡片已展开之后，由主流程判断是否需要调用横幅渲染逻辑。

### 5.2 安全守卫 —— 优先读取 localStorage

渲染函数在被调用时，应依次执行以下三项守卫检查，全部通过后才进入文案拼装阶段：

**守卫一：本地存储免打扰标记**
从 `localStorage` 中读取键名为 `keenerpet_risk_banner_dismissed` 的记录。如果该记录的值为 `true`，则立即终止渲染流程，不做任何 DOM 插入。这确保已关闭过横幅的用户在本次会话中不再被打扰。

**守卫二：计算数据有效性**
检查传入的总金额、宠物类型、宠物体型三个参数是否都有值。总金额必须大于 0，宠物类型和体型不能为空字符串或 null。任一条件不满足则终止渲染。

**守卫三：视口状态确认（隐性守卫）**
在移动端，额外确认结果卡片当前处于可见状态（用户没有在计算前关闭结果区域）。如果结果区域被折叠或隐藏，横幅也不应渲染。

### 5.3 核心精算公式

守卫全部通过后，按以下四个公式依次计算文案所需的动态数值：

- **医疗风险敞口（medicalRisk）** = 总成本 × 0.3。结果取整（四舍五入）。
- **年度建议保费（premium）** = 固定值 516。此值基于全美宠物保险平均年费（2025-2026 数据），作为常量内置。
- **月均保费（monthly）** = 年度保费 ÷ 12，即 516 ÷ 12 = 43。结果同样取整。
- **净风险敞口（netExposure）** = 医疗风险敞口 − 年度保费。若结果为负数则取 0。实际保险理赔有免赔额和共付额，更精确的净敞口建议按以下公式：净敞口 = 医疗风险敞口 × 保险后剩余风险比例。如保险覆盖 90%，则净敞口 = 782 × 10% = 78.2，取整为 78。此处两个版本均可，由产品决策确定。
- **风险降低比例** = (1 − 净敞口 ÷ 医疗风险敞口) × 100%，文案按实际计算结果取整显示。
- **成本效率比** = 保费 ÷ 风险敞口。

### 5.4 断点判断与文案选择

渲染函数需要获知当前视口宽度，以决定调用哪一套纯英文文案模板：

- **大于 640px（桌面端）**：调用桌面端文案模板。包含完整标题区（四行结构）、七行数据表格、完整 CTA 按钮文案、完整脚注文案。
- **小于等于 640px（移动端）**：调用移动端精简文案模板。包含精简标题（一行）、内联计算流（一行箭头链）、三行关键数据、精简 CTA 按钮文案、精简脚注文案。

判断断点的最佳时机是渲染函数被调用时，使用浏览器视口宽度 API 进行实时检测而非监听 resize 事件。横幅渲染后不会随窗口缩放动态切换模板，以避免布局抖动。

### 5.5 文案中动态数值的填入规则

**桌面端模板的动态插槽：**
- 标题行中的总金额和风险缺口
- 数据表格中的总金额行、风险敞口行、保费行（年度和月度两个值）、净敞口行、风险降低百分比、成本效率比
- 正文字段中的年度保费数值和成本效率比数值

**移动端模板的动态插槽：**
- 标题行中的风险缺口数值和建议月费
- 内联计算链中的三个数值（总金额、风险缺口、保费、净敞口）
- 三行数据中的风险降低百分比和成本效率比

### 5.6 链接处理规则

CTA 链接不应硬编码在渲染逻辑中，而应从全局配置或数据属性中读取：
- 跳转目标为 Chewy 联盟链接，具体 Partnerize camref ID 由配置变量控制，便于未来更换
- 所有链接必须在新标签页打开
- 所有链接必须标注 rel="sponsored" 以满足 FTC 合规
- 链接点击行为不应被 JavaScript 拦截或延迟，确保浏览器原生跳转不受影响

### 5.7 关闭按钮的行为规则

关闭按钮点击后应同时执行三项操作：
1. 从 DOM 中移除横幅元素（删除节点而非隐藏）
2. 将 `keenerpet_risk_banner_dismissed` 写入 localStorage，值为 `true`
3. 触发 `risk_banner_dismiss` 事件到 GA4，携带当前总金额作为参数

关闭操作不应影响结果卡片中其他内容的显示，不应刷新页面，不应触发重新计算。

---

## 六、上线检查清单

- [ ] 数据精算确认：30% 比例是基于当前版本 item 数据动态计算得出，还是使用固定值？需确认计算逻辑与实际费用项匹配
- [ ] 响应式测试：在 375px、540px、640px、768px、1024px 五个断点测试渲染效果，确保无布局溢出或文案截断
- [ ] 关闭按钮测试：点击关闭后刷新页面，确认横幅不再出现；清除 localStorage 后刷新，确认横幅恢复
- [ ] GA4 DebugView 验证：使用 Chrome GA4 Debugger 插件确认 `calculate_complete`、`insurance_cta_click`、`risk_banner_dismiss` 三个事件全部携带完整参数，无误报
- [ ] 联盟链接验证：确认 Partnerize camref ID 已正确注入，点击后跳转到预期页面，新标签页行为正常
- [ ] Lighthouse 无障碍专项：确认横幅使用的 ARIA label 和 role 属性齐全，不影响总评分
- [ ] 合规审查终审：确认脚注包含佣金披露（"We may earn a commission"）、数据免责声明（"Your actual risk varies"）、保险条款提醒（"Policy terms and exclusions apply"）三项，缺一不可
- [ ] 上线后观察期：上线后追踪两周 CTA 点击率，目标基准不低于 `calculate_complete` 事件总数的 3%。达到目标后决策是否启动 Tier 2（内嵌保险精算器）和 Tier 3（每项费用旁独立 "Insure This" 按钮）

---

## 附录：Growth Hacker 商业复盘

### 移动端翻车应急预案

上线 48 小时内监控三个 Clarity 热力指标：
- 关闭按钮点击率超过 CTA 点击率 → 切 C-2 省钱版文案
- `risk_banner_dismiss` 超过 20% → 切 C-3 社交举证版文案
- `calculate_complete` → `insurance_cta_click` 转化率低于 1.5% → 移动端改用感性文案

备选文案版本（纯文本，仅改移动端）：

**C-2 省钱版（移动端）：**
标题：Most owners save $200+ yearly with pet insurance
内联行：Insurance from $43/mo → could save you $200+/yr
CTA：See if you qualify →

**C-3 社交举证版（移动端）：**
标题：7 out of 10 pet owners save with insurance
内联行：Join 70% of informed owners who protect their budget
CTA：Check your savings →

### 联盟佣金复利增长预测

基于日均 1,000 次 calculate_complete：
- 月均 CTA 点击：900 次（CTR 3%）
- 月均保险 Lead：135 个（转化率 15%）
- 保守月收入：$3,375（$25/lead）
- 中性月收入：$6,750（$50/lead）
- 乐观月收入：$13,500（$100/lead）
- 年度合理预期：$41,748–$82,248
- 零边际成本，零新增服务器负载
