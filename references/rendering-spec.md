# HTML Rendering Spec (7-module single-page guide)

This is the **style-and-structure contract for the final `.html` deliverable**. Follow it every
time you build a guide so the output stays premium and consistent. It is a set of writing/rendering
conventions for the conversation, not a script or a data contract — you produce one HTML file
directly, no intermediate JSON, no build step.

If you want a feeling for a premium editorial travel look, you may open
`assets/canonical/product/index.html` in a browser. Absorb its **layout rhythm, spaciousness, and
card proportions** only. Do **not** copy its 8-chapter structure, its multi-theme picker, or any of
its Bali content.

---

## 1. File-level constraints

- **Deliverable is one HTML file + a sibling local-image folder.** The `.html` holds all CSS
  inline in a single `<style>` and only the JS genuinely needed (e.g. top-nav active state) inline
  in a single `<script>` at the end of `<body>`.
- **Local images, not remote hotlinks.** Every venue photo is downloaded to a same-level folder
  named `{destination-slug}-guide_files/` (e.g. `chengdu-guide_files/`, `tokyo-guide_files/`) and
  referenced by a **relative path** like `chengdu-guide_files/panda-base.jpg`. This makes every
  image 100% local and never breaks offline or from disk — deliver the HTML *together with* its
  folder (zip them or keep them side by side). **Do not** rely on remote image URLs that need the
  user's browser to reach the internet.
- No external CSS/JS/font files, no CDN, no framework for layout. The page must still open via
  `file://` and be servable statically, **provided the sibling `_files/` folder is present**.
- Document language: use the traveler's UI language (default 简体中文) as the primary UI language,
  with native/local names shown alongside venue names.
- `<html lang>` and `<title>` (e.g. `成都 4 天 3 晚 · 旅行手册`) set correctly.
- `meta viewport` present. Use semantic tags (`header`, `nav`, `section`, `footer`) and `details`
  only where an accordion is truly wanted.

## 2. Layout & visual system

- **Fixed blue/teal editorial theme** (do not offer a color picker). Soft warm paper background
  (`#f6f4ee`–`#f5f2ea` range), generous whitespace, hairline rules (`rgba(...)~8–12%` borders)
  instead of heavy boxes. **All foreground colours come from the §2.1 semantic tokens — that
  section is the single source of truth; do not invent extra accent colours.**
- Two clearly separated surfaces: **cover/hero** (destination title, date/duration, travel style
  chips, one evocative image or a clean gradient) and the **body** (cream/paper panels).
- **Card images** (reuse this pattern for every venue card): make the card `overflow:hidden`, put a
  top image that bleeds to the card edges, e.g.
  `.card{...;padding:16px 16px 14px;overflow:hidden}` +
  `.card .card-img-wrap{margin:-16px -16px 14px}` +
  `.card-img{width:100%;height:168px;object-fit:cover;display:block}`.
  This keeps the visual premium and the photos consistent across cards.
- Readable body copy; a **serif for headings + system sans for body**, or all-system sans with
  clear hierarchy — pick one system font stack (e.g. `PingFang SC, "Microsoft YaHei", system-ui`),
  do not rely on a web font.
- **Responsive**: fluid single column on ~390 px; a narrow content column with comfortable measure
  (~640–720 px max) on ~1440 px. Nothing overflows horizontally at 390 px.

### 2.1 统一语义标注系统（同一信息 → 同一颜色 → 同一形式）

**页面一致性优先于单卡表现力。** 同一种信息在全页必须用**同一颜色、同一形式、同一位置**出现；
不同信息类型不得互相借用颜色。生成前先铺好下表这套 CSS 变量并全程执行，不得中途即兴换色。

| 信息类型 | 专用变量 | 固定形式 |
|---|---|---|
| 地点 / 名称 / 标题 | `--ink` 墨绿 `#0d3b40` | 加粗；同一地点全页统一写法（全称或统一简称，二选一） |
| 时间 | `--time` 青灰 `#5f7d85` | 统一 `HH:MM`；统一前缀符号（如 `09:00 ·`）或统一 chip；位置固定在行程条开头 / 卡片同一行位 |
| 链接 · 可点击（地图、预约、官方渠道） | `--teal` 青 `#12657c` | 统一下划线或统一按钮样式 |
| 价格 / 费用 | `--price` 暖褐 `#8a6a3b` | 统一 `¥120` 写法 + 统一 chip 样式 |
| 警示（硬约束 / 风险：闭馆、必须预约、节假日拥堵） | `--warn` 红 `#b23b3b` | 全页**唯一**的红色，仅此用途 |
| 评分来源 / 元信息 | `--meta` 中性灰 | 统一小号标签 |

```css
:root{
  --ink:#0d3b40;    /* 地点/名称/标题 */
  --time:#5f7d85;   /* 时间（专用，不作他用） */
  --teal:#12657c;   /* 链接/可点击 */
  --price:#8a6a3b;  /* 价格/费用（专用） */
  --warn:#b23b3b;   /* 警示：唯一红色，仅限硬约束/风险 */
  --meta:#7a8a8d;   /* 元信息/来源标签 */
  --mark:#f3ead6;   /* 文字底色高亮（最重档，全页合计 ≤3 处） */
}
```

**强调只有三档，跨档混用即违规：**

1. **语义色**（默认档）— 按上表着色，不额外加粗、不加底色；
2. **标签 chip**（中度）— 同一类标签全页同形状同尺寸（如「必去」「需预约」）；
3. **文字底色高亮**（最重档，**全页合计 ≤ 3 处**）— 只给"错过会耽误行程"的信息
   （如"故宫提前 7 天 20:00 抢票""周一闭馆"），底色统一 `--mark`，不逐处换色。

禁止：同一信息类型出现两种颜色（时间一处黄一处红）；用高亮/警示色标注普通描述；为装饰而加底色。

**呈现形式统一（防表格/块状、横/竖混排）：**

- 同一模块的同一类信息**只能用一种形式**：卡片或表格，二选一，全模块内不得混用。
- **表格仅在满足全部条件时使用**：≥ 3 条同类短字段 + 需要对齐比较（如"票价一览""开放时间一览"）
  + 全页表格样式统一。其余场景一律用卡片块。
- 卡片内部一律**纵向堆叠**；横向排列只允许两类元素——chips 标签行、顶部导航条。
  禁止整卡横排，禁止把"时间 + 地点 + 价格"挤进同一行。
- 同类卡片的字段顺序与层级全页一致（场所卡固定为：图 → 名称 → 一句话 → 时间/价格 → 地址链接 → 说明）。
- 每个信息类型的图标/前缀符号固定一个，不得同义换形（时间不能一处 `·`、一处 🕘）。

## 3. Navigation & page order

Exactly seven numbered sections, always in this order, with a **sticky top nav / in-page TOC** of the
seven Chinese titles at the very top:

1. 行程 Itinerary
2. 景点 Attractions
3. 体验 Experiences
4. 餐饮住宿 Dining & Lodging (three subgroups only)
5. 购物 Shopping
6. 当地贴士 Local Tips
7. 未安排的景点清单 Unscheduled

Each section gets `<section id="itinerary|attractions|shopping|experiences|dining|tips|unscheduled">` so the
nav anchors work. Keep section titles short and consistent between the nav and the section heading.

## 4. Per-section content shape

Every field listed below is rendered through the **§2.1 semantic marking system** — the same
information type gets the same colour and the same form in all seven modules. When a section's
field list and §2.1 seem to conflict, §2.1 wins.

### 行程 Itinerary
- A short overview paragraph, then one block **per day**: date/相对(第 N 天)、当日主题、上午/中午/下午的
  按时间线安排(时间 · 地点 · 活动 · 简短说明)、餐食建议。可用 `details/summary` 收起长日。
- **餐食与住宿在行程里只写范围，不点名**：午餐/晚餐写"顺路解决的一片区域"（如「午餐：XX 片区」
  「晚餐：回 XX 片区解决」），住宿写"建议住哪一片/哪个地铁站一带"（如「住宿：XX 站一带，
  每天换乘一次可达」）。具体餐厅名与酒店名**一律放第 4 模块**——行程先保动线顺，
  不让一家店反向拉扯路线。可加一句"店名见第 4 模块"，但不要在这里写店名。
- Give at least arrival and departure days a light buffer note; never leave a day empty.
- **默认时间盒**（默认受众＝中国年轻视觉型旅客，详见 `itinerary-selection-logic.md`）：
  - 早上 **08:00 出发**；午餐排在 **13:00–14:30 之间任取一时段、时长约 1 小时**；
    晚上可安排夜市/夜游，一天最晚可到 **22:00–24:00** 结束。
  - **若同行含老人或小孩**：早上 **09:00 以后**才出发，一天最晚 **21:00–22:00** 收尾，
    半天内留出更明确的休息缓冲。
  - 抵达日/返程日更轻，以航班车次为准，不受此约束；用户给了明确时间偏好则以其为准。

### 景点 Attractions
- 必去 (must-see) + 小众 (hidden gems). Each card: 名称(+中文/当地名)、一句话为何值得去、地址、
  **精确地图链接**(境内=百度/境外=Google)、开放时间、票价(若有)、建议时长/最佳时段、来源或公众号/官网。
- **每个景点尽量配一张真实、内容正确的照片**（见下“Image rule”）。取得到就放、让页面更有吸引力；
  取不到贴切图时**可以不放**，保持卡片整洁即可——绝不张冠李戴，也不要放会裂的远程图。

### 体验 Experiences
- 有真实本地身份的文化活动/工坊/演出/季节活动。卡片含名称、时长、价格、地点+地图链接、如何预约、
  “为什么在这里做、适合谁”。

### 餐饮住宿 Dining & Lodging — 只三类

- **当地小吃/街头小吃**：每项解释是什么、口感、常见于何处、怎么点，给出价格与地标；
  **点名一家代表店**。
- **值得专程去**：招牌菜、人均区间、营业时间、地图链接，并写明"值得专程去的理由"；
  **给出具体店名**。
- **住宿推荐**：**给出具体酒店名**，并含所在片区/最近地铁站（说明为何顺路）、档次、
  平台评分与点评数、平日参考价与节假日参考价、"为什么住这里"的一句具体理由。
- **必须点名（本模块硬规则）**：这里的餐厅与酒店都要给出**真实、可在平台搜到的具体名称**。
  "推荐 XX 片区"这类范围式回答在本模块不合格——**范围属于行程模块**。每张卡带名称、地址、
  地图链接与「导航」按钮，用户能直接搜到、能导航过去。
- **取值口径**（默认档，用户明确要求更便宜/更小众时按其偏好调整，但始终给出评分来源与分值）：
  - 境内酒店：从**携程**评分中选高分酒店——默认 携程 ≥ 4.5，优先 4.7+ 且有足量点评数；
  - 境内餐厅：搜**大众点评**高分店——默认 ≥ 4.5，小吃摊档可放宽至 4.3 但须有真实点评支撑；
  - 境外酒店：查 **Google Maps** 高评分——默认 ≥ 4.3；
  - 境外餐厅：查 **Google** 高评分——默认 ≥ 4.5。
- **住宿动线优先**：先顺路，再评分。优先**一城一个住宿基地**（每天换乘一次可达），
  而不是换三四家酒店——中途搬一次酒店要吃掉半天。行程确实分段时，写明哪几晚住哪、为什么。
- **节假日价格语境**：行程落在节假日窗口（元旦/过年/清明/端午/五一/中秋/十一/圣诞）时，
  酒店卡同时写出**平日参考价**与**节假日参考价**（如 `平日 ¥420 / 节假日 ¥880`），
  把涨幅摆给用户自己判断，**不设"溢价过高"的硬阈值**；涨幅明显时可加一句
  "可同时考虑同片区备选"。价格须来自实际查询并标"参考价，以平台实时价格为准"。
- 明确不出现高端餐厅/咖啡/酒吧/连锁；也不做预订入口。
- **评分来源必须标注**：境内餐厅=大众点评、境内酒店=携程；境外餐厅与酒店=Google 评分。
- 若某家店/酒店是经小红书笔记佐证（来源 `xhs`，见 `xhs-research.md`），卡片评分来源标为
  **"小红书口碑"**，通常不写分值，且仍需保留官方地址与地图链接。
- **点名核实不到时的例外**：具体门店的排队/营业/口碑变化很快。只有当确实核不到可靠具名门店时，
  才降级为"方向性推荐"——写清推荐哪种业态/口味、去哪片找、怎么判断好坏，**并在卡片上标明
  「未能核实到具体门店」**，提示"在地图/点评按'离你最近的分店'选择、以到店为准"。
  这是例外而非常态；**不得为凑格式编造店名或酒店名**。
- **评分**：得分可省略（无评分的卡片仍完整）；只给来源标签即可，切勿编造当前分值。

### 购物 Shopping
- 购物区/商圈卡片 + 特色伴手礼列表。伴手礼:是什么、去哪买、怎么挑、携带/托运注意。

### 当地贴士 Local Tips
- 分区/卡片式实用信息：交通、文化礼仪、天气与穿搭、支付、安全。用真实、决策导向的短句。
- **境外（含中国港澳台）必加两项**：
  - **签证**：是否需办签证、签证形式（免签/落地签/电子签/提前送签等）、关键材料与办理时长，
    附官方来源并注明"出行前再次核实最新政策"。
  - **公共假期**：该国主要公共假期；若行程同时落在中国节假日窗口（元旦/过年/清明/端午/五一/
    中秋/十一/圣诞），提示提前预订机票/酒店/火车。
- **境内**：若行程落在上述中国节假日窗口，提醒提前预订机票/酒店/火车；自驾段另按 §3.1 标注
  路程 ×1.5 倍拥堵预留（写在行程卡片里）。
- **中国港澳台**：提示所需证件（港澳通行证及签注 / 入台证等），以官方最新规定为准。

### 未安排的景点清单 Unscheduled（第 7 模块）
- 用途：把"很好、但没能排进每天行程"的景点整理出来，给用户留一个"还能去哪 / 我漏了什么"的
  收口视图。**来源限定在每天行程锚点 30 km 半径内**——超出太远、或与既定景点重复的内容不收录。
- 每张卡至少包含：名称(+当地名)、一句话为何值得去、**距它最近那天的锚点约 xx km**、
  建议时长、地址 + 精确地图链接（境内=百度/境外=Google）、未排入的原因（一句话，如"Day2 已满 /
  顺路度不高 / 与已选重复"）；**若取到内容贴切的图则附图**（无图可整洁不放，遵守 §5.1）。
- 若某一天 30 km 内确实没有值得补充的未收录景点，该天可不出卡，不硬凑。
- 详见 `itinerary-selection-logic.md` 的候选筛选规则与 `research-data-shapes.md` Module 7 结构。

### 交互契约（编辑行程 → 复制 AI 提示词）
第 7 模块是**静态 HTML + 少量内联 JS**，不接后端。每张未安排景点卡有一个 **checkbox**；模块底部
有一个 **「生成编辑行程文字」按钮**（或每卡旁的「编辑行程」入口）。逻辑如下：

1. 勾选若干张卡（可跨天，勾选时卡片高亮）。
2. 点击按钮后，页面用内联 JS **生成一段结构化、纯文本、AI 可识别的"行程调整请求"**，放进一个
   只读 `<textarea>`（并自动 focus/全选，方便复制），旁边提供「复制」按钮。
3. 这段文字**必须自包含**，能让一个全新 AI 会话据此重新生成一份含这些景点的行程 HTML，至少包含：
   - 目的地、天数、默认受众/时间盒（见 §4 行程的默认档）与是否含老人小孩；
   - 当前每日主题与各天大致时间轴摘要；
   - 用户在 7 模块里勾选的全部景点清单，每个带：名称、距当日锚点距离、建议时长、地址/地图链接；
   - 明确指令：「把以上景点合理安排进某一天。若原行程时间不够，请提示『可在第 X 天增加一日安排』，
     或建议压缩/调整其他某天的哪些景点，再重新生成完整的 7 模块 HTML。」
4. 复制提示词写明是从哪份手册来的、作者可把结果粘回 AI 再生成。

## 5. Cross-cutting data rules

### 5.1 Image rule（地点配本地图）

**目标：让手册尽量带真实配图，但不要为了凑数放错图。** 取到的图一律下载到本地、以相对路径引用
（见 §1），保证 100% 显示、不裂图。取不到贴切图时允许整洁无图。

**默认取图路径（先执行这个）：用本 skill 自带的 Pexels 脚本**
1. 在生成 HTML 前，为每个需配图的地点调一次 `scripts/fetch_pexels_image.py`：
   - 它读取本地配置的 Pexels key（`scripts/.pexels_key` 或环境变量 `PEXELS_API_KEY`），
     按英文关键词在 Pexels 搜索 → 打印候选（id + alt 描述）→ 下载到
     `{city}-guide_files/`，并给出可写进卡片的 `src` 相对路径。
   - 例：`python scripts/fetch_pexels_image.py "成都大熊猫繁育研究基地" "giant panda bamboo china" --out chengdu-guide_files --filename panda-base.jpg`
   - 批量：建一份 `plan.csv`（`地点,英文关键词,文件名` 每行一个），
     `python scripts/fetch_pexels_image.py --batch plan.csv --out chengdu-guide_files`
   - 想对比多张再挑：加 `--preview-only` 只看候选，满意后再用 `--pick N` 下载第 N 张。
2. 依据脚本返回的 **alt 描述 + 你的常识**判断是否贴切；不贴切就换更准的关键词重试
   （宁可多试一次，也不要放一张内容不符的图）。
3. 每张下载到本地的图写进对应卡片：`<img class="card-img" src="{city}-guide_files/{fname}" alt="简短中文描述" loading="lazy">`。

**图片归属范围**
- 每个景点 / 体验 / 值得专程去的餐厅 **尽量配图**：能取到内容贴切的图就放，页面观感更好。
- **住宿卡不作配图要求**：酒店实拍难以从 Pexels 稳定取到贴切画面，硬配一张通用房间图属于张冠李戴。
  酒店卡靠排版与信息密度撑住（名称、片区、评分、参考价、理由），可整洁无图。
- **不是硬性底线**：若某个“必去”景点确实取不到贴切、可授权的图（搜不到、或图明显不符），
  **可以不放图**——保持卡片整洁、靠排版撑住即可，不要为了凑数硬塞一张不相关的图，
  也不要放会裂的远程图或强行画占位块。
- 判断标准：宁可整洁无图，也不要张冠李戴。

**稳定性与可授权要求**
- 只使用**长期稳定、可商用、无 Referer 防盗链**的图。Pexels License ≈ CC0：可商用、可修改、无需署名。
- 拒绝会裂图的图源：需要登录态/签名/Referer 的图床（如部分国内图床、小红书图床）一律不用。
- 每张本地图在 footer 注明“配图来源：Pexels（License 可商用）”。

**图源/网络不可得时的诚实处理**
- 若运行环境的 Pexels API 或图片 CDN 不可达、或找不到 key：**不要随便塞一张或硬放会裂的远程图**。
- 向用户说明“取图通道在此环境不可用”，并提供可选方案（提供图库 key、或由用户本地给图/直链、或接受占位顶位）。
- 兜底永远是：干净整洁 + 诚实说明，而不是一张内容错误或会裂的图。

### 5.2 导航 button（App 深链唤起）

Every venue card renders a small **「导航」button** next to its map web link:

- Tap behavior follows the region-aware app priority chain — **境内: 高德 > 百度 > 苹果原生；
  境外: Google 地图 > 苹果原生** — attempting each native app in order, then the first
  provider's web version as the all-fail fallback.
- WebView（微信/抖音等）与桌面端跳过 scheme 尝试，直接开链首供应商网页版；无坐标时退回卡片
  自身的地图网页链接。
- "装没装 App" 由 scheme 尝试 + 页面可见性超时判定（浏览器无法真正查询已装应用）——
  诚实边界见 `references/app-deeplink-nav.md`。
- Requires per-venue coordinates (GCJ-02 境内 / WGS-84 境外, 见
  `research-data-shapes.md` → Coordinates field)；取不到坐标的卡片只保留网页链接，不硬造坐标。
- Inline the ready JS module from `references/app-deeplink-nav.md` once at the end of `<body>`,
  hard-coding `NAV_REGION` per guide. Button target ≥ 44 px touch height.


- **Every venue/location** carries a precise **map action** — a Baidu Maps (domestic) / Google
  Maps (international) link, plus a **「导航」button** implementing the app deep-link chain
  (高德→百度→苹果 for domestic, Google→苹果 for international, with WebView/desktop/no-coords
  fallbacks). Region is fixed per guide (see SKILL.md §1); behavior contract and the
  copy-paste inline JS module live in `references/app-deeplink-nav.md` — follow §5.2 below.
- **Every restaurant and hotel score** shows its **source label**（境内餐厅 大众点评：x.x /
  境内酒店 携程：x.x / 境外 Google：x.x）, and a score is optional — a guide with zero ratings is
  complete. Never invent a score.
- **No fabricated facts**: opening hours, prices, ratings and map coordinates must be from research.
  If unverifiable, omit or clearly mark as approximate — never invent.
- No content copied from another destination; no placeholder venues; no filler like “注意安全/记得打卡”.
- See **§8 Dynamic facts & honesty convention** for how to handle prices/hours/ratings that go stale
  and when to signal “以官方实时公示为准”.

## 6. Accessibility & polish checklist (before delivery)

- Text/background contrast is readable in both light areas; no pale-on-pale.
- Touch targets and tap links are usable on a phone (≥ ~44 px interactive height where it matters).
- Nav works with anchor scroll; sections reachable.
- The cover hero does not visually collide/clip its text; cover text is inside the image/surface.
- At ~390 px and ~1440 px there is no horizontal overflow.
- Respect `prefers-reduced-motion` (keep animations minimal anyway).
- **一致性自检（§2.1）**：时间 / 价格 / 地点 / 链接每类信息全页只有一种颜色、一种写法、一个位置；
  同一模块内没有表格与卡片混用；横排元素只有 chips 与导航条；
  文字底色高亮全页 ≤ 3 处且只标硬约束；红色只出现在警示用途。
- **模块 4 点名自检**：餐饮与住宿的每张卡都有**具体、可在平台搜到的名称**，没有用"XX 片区"代替；
  境内酒店标了**携程评分（含点评数）**，境外酒店与餐厅标了 **Google 评分**；
  节假日窗口内的酒店卡同时有平日与节假日参考价，且标了"以平台实时价格为准"。
- **行程不点名自检**：模块 1 的餐食与住宿只出现范围（片区 / 地铁站一带），
  没有把模块 4 的具体店名搬进行程。

## 7. Definition of done

Write the guide to its **own standalone file** (not inside the skill repo) — name it after the
destination, e.g. `chengdu-guide.html`, and keep its images in the sibling
`chengdu-guide_files/` folder. Do a mental pass over §6, then **present the `.html` to the user for
preview** with a one-line summary (destination, duration, the seven modules delivered) and note
that it ships together with its image folder.

> Filename hint: `{destination-slug}-guide.html` + `{destination-slug}-guide_files/`,
> e.g. `chengdu-guide.html` + `chengdu-guide_files/`, `tokyo-guide.html` + `tokyo-guide_files/`.
> Deliver the pair together (same folder); do not send the HTML without its images.

## 8. Dynamic facts & honesty convention

Dates, prices, opening hours and platform ratings go stale fast. Do **not** treat a single look-up
as permanent truth:

- Where you state a hard fact (price / hours / score), prefer adding a light qualifier such as
  “以官方/门店实时公示为准” near price-or-hours lines or in the footer.
- If a venue's official booking flow exists (e.g. China: 官方微信实名预约 for 熊猫基地 / museums),
  say so — it is high-value practical advice and usually more useful than a price.
- If you cannot verify a venue's current score/rating at build time, **omit the number** (a guide
  with zero ratings is complete) or keep only the source label; never invent a score.
- If a fact cannot be verified but the item is still worth recommending, either omit it or mark it
  clearly approximate — never fabricate.
