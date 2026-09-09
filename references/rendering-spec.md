# HTML Rendering Spec (6-module single-page guide)

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

- **Fixed blue/teal editorial theme** (do not offer a color picker). A refined palette such as:
  deep ink/teal headings (`#0d3b40`–`#0b3a45` range), a teal accent for links/underlines
  (`#12657c`–`#0f766e` range), soft warm paper background (`#f6f4ee`–`#f5f2ea` range), generous
  whitespace, hairline rules (`rgba(...)~8–12%` borders) instead of heavy boxes.
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

## 3. Navigation & page order

Exactly six numbered sections, always in this order, with a **sticky top nav / in-page TOC** of the
six Chinese titles at the very top:

1. 行程 Itinerary
2. 景点 Attractions
3. 购物 Shopping
4. 体验 Experiences
5. 餐饮 Dining (two subgroups only)
6. 当地贴士 Local Tips

Each section gets `<section id="itinerary|attractions|shopping|experiences|dining|tips">` so the
nav anchors work. Keep section titles short and consistent between the nav and the section heading.

## 4. Per-section content shape

### 行程 Itinerary
- A short overview paragraph, then one block **per day**: date/相对(第 N 天)、当日主题、上午/中午/下午的
  按时间线安排(时间 · 地点 · 活动 · 简短说明)、餐食建议。可用 `details/summary` 收起长日。
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

### 购物 Shopping
- 购物区/商圈卡片 + 特色伴手礼列表。伴手礼:是什么、去哪买、怎么挑、携带/托运注意。

### 体验 Experiences
- 有真实本地身份的文化活动/工坊/演出/季节活动。卡片含名称、时长、价格、地点+地图链接、如何预约、
  “为什么在这里做、适合谁”。

### 餐饮 Dining — 只两类
- 当地小吃/街头小吃：每项解释是什么、口感、常见于何处、怎么点，给出价格与地标；可点名一家代表店。
- 值得专程去：招牌菜、人均区间、营业时间、地图链接，并写明“值得专程去的理由”。
- 明确不出现高端餐厅/咖啡/酒吧/连锁。每张餐厅卡标注评分来源（境内=大众点评、境外=Google）。
- **门店时效弹性**：具体门店的排队/营业/口碑变化很快。能核实到可靠且具代表性的具名门店（如
  老字号）就直接点名；否则可用“方向性推荐”——写清推荐哪种业态/口味、去哪片找、怎么判断好坏，并提示
  “在地图/点评按‘离你最近的分店’选择、以到店为准”。这样做优于硬塞一个可能已过时的门店名。
- **评分**：得分可省略（无评分的餐饮卡仍完整）；只给来源标签即可，切勿编造当前分值。

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


- **Every venue/location** carries a precise **map action** — a Baidu Maps (domestic) / Google
  Maps (international) link. Region is fixed per guide (see SKILL.md §1).
- **Every restaurant score** shows its **source label**（大众点评：x.x / Google：x.x）, and a
  score is optional — a guide with zero ratings is complete. Never invent a score.
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

## 7. Definition of done

Write the guide to its **own standalone file** (not inside the skill repo) — name it after the
destination, e.g. `chengdu-guide.html`, and keep its images in the sibling
`chengdu-guide_files/` folder. Do a mental pass over §6, confirm every must-see card has a local
image that exists on disk, then **present the `.html` to the user for preview** with a one-line
summary (destination, duration, the six modules delivered) and note that it ships together with
its image folder.

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
