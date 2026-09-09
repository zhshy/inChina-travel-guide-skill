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

- **One self-contained `.html`** file: all CSS inline in a single `<style>`, only the JS that is
  genuinely needed (e.g. the top-nav scroll/active state) inline in a single `<script>` at the end
  of `<body>`.
- No external CSS/JS/font/asset files, no CDN, no framework. Must open from disk via `file://`
  and be servable as a static file.
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

### 景点 Attractions
- 必去 (must-see) + 小众 (hidden gems). Each card: 名称(+中文/当地名)、一句话为何值得去、地址、
  **精确地图链接**(境内=百度/境外=Google)、开放时间、票价(若有)、建议时长/最佳时段、来源或公众号/官网。
- One evocative image per featured place when you can source an exact one; otherwise a styled
  placeholder/icon is fine — never a wrong/stock photo pretending to be the place.

### 购物 Shopping
- 购物区/商圈卡片 + 特色伴手礼列表。伴手礼:是什么、去哪买、怎么挑、携带/托运注意。

### 体验 Experiences
- 有真实本地身份的文化活动/工坊/演出/季节活动。卡片含名称、时长、价格、地点+地图链接、如何预约、
  “为什么在这里做、适合谁”。

### 餐饮 Dining — 只两类
- 当地小吃/街头小吃：每项解释是什么、口感、常见于何处、怎么点，给出价格与地标；可点名一家代表店。
- 值得专程去：招牌菜、人均区间、营业时间、地图链接，并写明“值得专程去的理由”。
- 明确不出现高端餐厅/咖啡/酒吧/连锁。每张餐厅卡标注评分来源（境内=大众点评、境外=Google）。

### 当地贴士 Local Tips
- 分区/卡片式实用信息：交通、文化礼仪、天气与穿搭、支付、安全。用真实、决策导向的短句。

## 5. Cross-cutting data rules

- **Every venue/location** carries a precise **map action** — a Baidu Maps (domestic) / Google
  Maps (international) link. Region is fixed per guide (see SKILL.md §1).
- **Every restaurant score** shows its **source label**（大众点评：x.x / Google：x.x）, and a
  score is optional — a guide with zero ratings is complete. Never invent a score.
- **No fabricated facts**: opening hours, prices, ratings and map coordinates must be from research.
  If unverifiable, omit or clearly mark as approximate — never invent.
- No content copied from another destination; no placeholder venues; no filler like “注意安全/记得打卡”.

## 6. Accessibility & polish checklist (before delivery)

- Text/background contrast is readable in both light areas; no pale-on-pale.
- Touch targets and tap links are usable on a phone (≥ ~44 px interactive height where it matters).
- Nav works with anchor scroll; sections reachable.
- The cover hero does not visually collide/clip its text; cover text is inside the image/surface.
- At ~390 px and ~1440 px there is no horizontal overflow.
- Respect `prefers-reduced-motion` (keep animations minimal anyway).

## 7. Definition of done

Save as a `.html` file (filename should identify destination, e.g. `chengdu-guide.html`), open a
quick mental pass over §6, then **present the file to the user for preview** with a one-line
summary (destination, duration, the six modules delivered).
