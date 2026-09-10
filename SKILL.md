---
name: personalized-travel-guide-skill
description: |
  Generates a personalized, comprehensive single-page HTML travel guide for any destination.
  It first detects whether the destination is inside mainland China (domestic) or abroad
  (international) and switches data sources accordingly: Baidu Maps + WeChat Official Accounts
  + Dianping (dining) + Ctrip (lodging) for domestic, Google Maps + official websites
  + Google ratings (dining and lodging) for international.
  The final deliverable is a self-contained, mobile-friendly HTML file with exactly seven modules
  (行程/景点/体验/餐饮住宿/购物/当地贴士/未安排的景点清单).
  Trigger on: "帮我做一份 X 的旅行攻略/手册/指南", "X 玩 N 天怎么安排",
  "X travel guide / itinerary", trip planning with destination + duration + traveler profile.
---

# Personalized Travel Guide Skill

## What this skill does

Produces a complete, nicely designed single-page HTML travel guide for a given destination,
duration, and traveler profile. The deliverable is **one `.html` file plus a same-level local image
folder** (`{destination}-guide_files/`) containing downloaded venue photos, so every must-see card
ships with a real image that always displays. Inline styles + minimal inline JS, no build scripts,
no server, no external framework dependency.

> 核心工作流：读取旅行者记忆 → 收集输入 → 判定区域 → 研究 → 生成 7 模块单页 HTML → 交付（说明删减）并更新记忆。

## Shared trip memory

Before intake, read `~/.inchina-travel-guide/MEMORY.md` if it exists, following
`references/trip-memory.md`. Use it only for durable traveler context: pace, food and drink
preferences, budget habits, payment/navigation preferences, companion situation, past-guide index
and open threads. Pre-fill intake defaults from it and say so in one line
（「已按你的常用偏好预填：…，有变化直接说」）.

If the file does not exist, continue normally — never block on memory setup, never ask the user
to create it, never mention the feature.

After each delivered guide, update the memory file with durable facts only (template and update
rules in `references/trip-memory.md`). Never store raw screenshots, ID/passport numbers, booking
codes, full chat logs, or other sensitive material.

## Core Modules (final output — exactly 7)

The final HTML guide contains **these seven sections, and nothing else**:

1. **行程 Itinerary** — day-by-day plan with time slots and activities
2. **景点 Attractions** — must-see landmarks and hidden gems
3. **体验 Experiences** — cultural and unique local experiences
4. **餐饮住宿 Dining & Lodging** — strictly limited to three sub-categories:
   - Local Snacks / Street Food (当地小吃推荐)
   - Signature Restaurants Worth a Detour (值得专程去)
   - Lodging (住宿推荐)
5. **购物 Shopping** — best shopping areas and souvenirs
6. **当地贴士 Local Tips** — practical local advice (transport, culture, weather, payment, safety)
7. **未安排的景点清单 Unscheduled** — worthwhile places that were **not** fitted into the daily
   plan but lie within **30 km of a day's route**; each card can be ticked and turned into a
   copy-paste AI prompt that regenerates the itinerary with those places added.

### Naming rule — module 1 gives areas, module 4 gives names

The two modules split the job on purpose:

- **模块 1 行程只写范围**：餐食与住宿在行程里以**顺路的一片区域**出现（「午餐：XX 片区」
  「住宿建议：住 XX 地铁站一带」），不点名。日程首先服从动线——一家要绕两站的店，不如路口那片
  能解决午饭的区域有用。
- **模块 4 必须点名**：餐饮与住宿的每一条推荐都要给出**真实、可在平台搜到的具体名称**——
  餐厅名与酒店名。这一模块里「推荐 XX 片区」不合格，范围属于行程模块。
- **唯一例外**：确实核实不到可靠具名门店时，才降级为方向性推荐，并在卡片上写明
  「未能核实到具体门店」。绝不为满足规则编造名称。

### Removed modules (do NOT include)
- ❌ Language Tips / 语言锦囊 — removed
- ❌ Before-departure / Preparation / 出发前准备 — removed
- ❌ Flight / hotel **booking engines**（预订入口、比价下单）— never triggered. Lodging
  **recommendations** are not a booking engine and belong in module 4.

Do not add, resurrect, or re-label these removed modules.

---

## 0. Reference documents

Read the references under `references/` **only as needed** (they are small; prefer loading them
rather than guessing their rules):

| File | Load when… |
|------|-----------|
| `references/research-data-shapes.md` | defining the fields to collect for each of the seven modules |
| `references/rendering-spec.md` | **before building the HTML** — the style/structure contract for the final page |
| `references/image-and-source-policy.md` | sourcing images, ratings, and map links (region-aware) |
| `references/itinerary-selection-logic.md` | choosing places / building daily itineraries from traveler interests |
| `references/xhs-research.md` | **(optional)** harvesting traveler word-of-mouth from Xiaohongshu to enrich Dining research when the sandbox has browser/CDP tooling |
| `references/app-deeplink-nav.md` | **before building the HTML** — the 导航 button app deep-link chain (高德>百度>苹果 / Google>苹果), WebView/desktop/no-coords fallbacks, and the copy-paste inline JS module |
| `references/trip-memory.md` | reading/updating the cross-trip traveler memory (`~/.inchina-travel-guide/MEMORY.md`) — what to pre-fill, what to persist, what never to store |
| `references/first-use-intake.md` | handling intake (questionnaire vs. defaults) for a new request, incl. the 四拍 interaction format |

> **Local images (must-do before writing cards)**: run the bundled Pexels fetcher
> `scripts/fetch_pexels_image.py` to download each venue photo into `{destination}-guide_files/`
> (see `rendering-spec.md §5.1` and `image-and-source-policy.md §0` for the exact command and rules).
> It reads a key from `scripts/.pexels_key` or env `PEXELS_API_KEY` (that file is gitignored; it is
> set locally by the skill owner — see `scripts/fetch_pexels_image.py` header for how to configure).

> `assets/canonical/product/index.html` is kept **only as a visual-style reference** (its editorial
> look, card rhythm, typography). Open it in a browser if you need a sense of a premium handbook
> aesthetic. **Never copy its Bali content, never reproduce its 8-chapter structure, and do not try
> to drive it with any script.** You render a fresh 7-module page yourself.

---

## 1. Region detection (automatic)

Before researching, decide `region`:

- **domestic (境内)**: destination is a city in mainland China (Beijing, Shanghai, Chengdu, Xi'an, …)
  or the country is explicitly "China".
- **international (境外)**: everything else (Tokyo, Paris, New York, …).

**港澳台（重要，勿遗漏）**：中国香港、中国澳门、中国台湾虽属中国领土，但旅行场景涉及
出入境证件、货币与语言，其**数据一律按 `international`（境外）规则处理**——即 Google Maps
地图、官方网站、Google 评分。判定时把它们显式归为境外，不要因"属于中国"就套用境内
（百度地图/公众号/大众点评）那套。
- 写法上统一称"中国香港 / 中国澳门 / 中国台湾"，与 Hong Kong China / Macao China / Taiwan China 同义。
- 同时在地贴士中提示所需证件：港澳需**港澳通行证**（及相应签注）；中国台湾需**大陆居民往来台湾通行证
  （入台证）**等，以官方最新规定为准。

Use `region` to pick data sources everywhere:

| Data | domestic (境内) | international (境外) |
|------|-----------------|----------------------|
| Location map | Baidu Maps link | Google Maps link |
| Official info | WeChat Official Account name | Official website URL |
| Restaurant rating | Dianping (大众点评) score | Google Maps rating |
| Lodging rating | Ctrip (携程) score — high-rated hotels only | Google Maps rating |
| Photos | **Pexels via `scripts/fetch_pexels_image.py`** (both regions) — see §4 / rendering-spec §5.1 | same |

The questionnaire lets the user override the auto-detected region.

---

## 2. Intake (input collection)

- Read the shared trip memory first (§ Shared trip memory / `references/trip-memory.md`) and
  pre-fill stable preferences; ask only what neither the brief nor memory can answer.
- Follow `references/first-use-intake.md`.
- Every user-facing question follows the **四拍格式**（Re-ground → Simplify → Recommend → Options）—
  see `references/first-use-intake.md §四拍交互格式` for the rules, examples and anti-patterns.
- Default intake path: offer `assets/intake-questionnaire/index.html` for a preference-light
  request, or accept natural-language briefs directly (e.g. “帮我做一份成都 4 天 3 晚的攻略，
  2 人，喜欢美食和文化”).
- A full brief (destination, days, travelers, pace/interests/constraints) lets you start immediately.
- If only destination + days are given, you may proceed with sensible mainstream defaults for a
  first-time visitor; don’t over-ask.

---

## 3. Research (collect destination facts)

Research each module with accurate, current, verifiable data. Quality gates:

- **Attractions**: name (+ native name), address + precise map link (Baidu/Google per region),
  opening hours, ticket price when any, best time, brief description. WeChat Official Account
  (domestic) / official website (international) preferred as the official source.
- **Experiences**: cultural activities, classes, workshops, performances, seasonal or local events
  with real local identity.
- **Dining**: ONLY local snacks / street food AND restaurants worth a detour. Skip fine dining,
  cafes, bars, and chains. Every entry is a **named venue** carrying its rating source —
  境内搜大众点评高分店，境外搜 Google 高评分餐厅。
- **Lodging**: recommend **named hotels**, chosen by platform score —
  境内从携程评分中选高分酒店，境外查 Google Maps 高分酒店。Default thresholds: 携程 ≥ 4.5
  （优先 4.7+ 且有足量点评数）/ Google ≥ 4.3；小吃摊档可放宽到点评 4.3。Prefer **one stay base
  per city** that sits on the day routes over re-booking hotels. Inside a 中国节假日窗口 (§3.1),
  record **both** the 平日参考价 and the 节假日参考价 on the card so the traveler can judge the
  markup themselves — never hand over a hotel without price context, and never fabricate a price.
- **Shopping**: distinctive local products + best shopping districts; explain what/where/how to
  choose + packing or customs caveats.
- **Local Tips**: transport, cultural etiquette, weather/what-to-wear, payment, safety.
- **Unscheduled (未安排的景点清单)**: while building the itinerary, keep a shortlist of worthwhile
  places that did **not** make the daily plan but sit within **30 km of a day's route**. For each,
  record: why it was dropped, distance to that day's anchor, suggested duration, address + map
  link, and a photo when available. These become module 7, not filler — see
  `itinerary-selection-logic.md` for the filtering rules.

Image/rating/map-source rules and exclusions: see `references/image-and-source-policy.md`.
Do **not** invent opening hours, prices, ratings, or map links. When a fact can’t be verified,
omit it or clearly mark it as approximate rather than fabricating.

> **Optional Dining enrichment (小红书口碑)**: when a Dining venue (esp. `international` street food,
> a niche 老字号, or a hidden-gem shop) has weak 大众点评 / Google coverage **and** the sandbox has a
> working browser/CDP path, you may consult `references/xhs-research.md` to corroborate it from
> traveler notes and tag the card `小红书口碑` (source `xhs`). This is an **optional enhancement,
> never a gate** — if the tooling is unavailable, fall back to the normal sources above and do not
> fabricate note data.

### 3.1 节假日与预订提醒（按 region 分支执行）

先确认行程日期是否落在下列**中国节假日窗口**内：
**元旦、过年（春节）、清明、端午、五一、中秋、十一（国庆）、圣诞**。

**境内行程（domestic）**
- 若行程落在上述窗口内，**且该段行程为自驾**：行程里每个"路程所需时间"都要在后面用括号
  标注一个提示——拥堵系数，例如：`车程约 1.5 小时（节假日拥堵，实际建议按 ×1.5 倍预留）`。
- 同时在贴士/行程显著位置提醒：**提前预订机票、酒店、火车票**（节假日一票难求、房价上浮）。
- 非自驾的境内节假日行程同样建议给出提前预订提醒（机票/酒店/火车），但不强求 ×1.5 标注。
- **酒店溢价上下文（写进模块 4）**：落在窗口内时，每张酒店卡同时标出**平日参考价**与
  **节假日参考价**（如 `平日 ¥420 / 节假日 ¥880`），把涨幅摆出来让用户自己判断——
  **不替用户设"溢价过高"的阈值**。涨幅明显时可加一句「节假日上浮明显，可同时考虑同片区备选」。
  价格须来自实际查询，并标注「参考价，以平台实时价格为准」。

**境外行程（international，含港澳台）**
- **签证**：检索该目的地国家/地区对中国护照是否**需要办理签证**，以及**签证形式**
  （免签 / 落地签 / 电子签 e-Visa / 提前送签贴纸签 / 过境签等），并写明关键材料与办理时长；
  以官方使领馆或官方移民部门最新公告为准，提示"出行前再次核实"。
- **公共假期**：检索该国的**公共假期（public holidays）**日历。
- 若行程日期既落在上述中国节假日窗口内、**又**与该国公共假期重叠，则提醒
  **提前预订机票、酒店、火车**（当地假期会放大客流与涨价）。
- 签证与公共假期结论写进「当地贴士」，签证这类硬信息务必给出来源。

---

## 4. Build the HTML guide

**Before writing any HTML, load `references/rendering-spec.md`** — it is the style/structure
contract (file constraints, layout, seven-section shape, per-card fields, accessibility, definition
of done). Follow it so every guide looks premium and consistent.

Assemble **one HTML file + its sibling local-image folder** that works on phone + desktop:

- **Fetch venue photos** so cards aren't imageless: for each 必去 attraction (and, when
  fitting, each signature experience / worth-a-detour restaurant / representative souvenir) run
  `scripts/fetch_pexels_image.py "<地点名>" "<english keywords>" --out {dest}-guide_files
  --filename {slug}.jpg`. Read the returned `alt`, pick a topic-matching candidate, and keep the
  downloaded file path to reference in the card. See `rendering-spec.md §5.1`.
  **配图不是硬性底线**：某地点取不到贴切图时可整洁无图，不要硬塞不相关的图。
- **7 sections only** (order: Itinerary, Attractions, Experiences, Dining & Lodging, Shopping,
  Local Tips, Unscheduled), each with a clear numbered section and anchor navigation at top.
- Fixed **blue/teal editorial theme** — do not ask the user to pick a color. Follow the
  **统一语义标注系统**（rendering-spec §2.1）：同一类信息（时间/价格/地点/链接/警示）全页同一颜色、
  同一写法、同一形式；强调只有三档且文字底色高亮全页 ≤3 处；同一模块内不得表格与卡片混用。
- Every place/venue card includes: name, description, a **precise location link** (Baidu Maps
  domestic / Google Maps international), a **「导航」button** running the app deep-link chain
  （境内 高德>百度>苹果 / 境外 Google>苹果，含 WebView、桌面与无坐标降级 — see
  `references/app-deeplink-nav.md` and rendering-spec §5.2), and a **local image**
  (`<img class="card-img" ...>` with
  `src="{dest}-guide_files/{file}"`). Restaurant cards must label the **rating source**
  (大众点评 / Google); **hotel cards must label theirs too**（境内 携程：x.x / 境外 Google：x.x）
  together with the 平日/节假日参考价 when the trip falls in a holiday window. In the **行程**
  module, meals and lodging show the **area only** — names live in module 4 (see Naming rule).
- Inline the CSS (and only the JS truly needed); keep the HTML portable so it can be opened from
  disk or served statically **together with its `_files/` image folder**.
- **第 7 模块「未安排的景点清单」**：列出每天行程 **30 km 半径内**、有真实价值但未被排入的景点。
  每张卡带 checkbox 与「编辑行程」按钮：勾选若干景点并点击后，页面生成一段**结构化、AI 可识别的
  调整请求文字**（含原行程概要、每日主题、勾选景点及距离/建议时长、明确指令），用户一键复制后
  粘贴回任意 AI 即可重新生成含这些景点的 HTML。详见 `rendering-spec.md §4.7 / §9`。
- Responsive: readable and non-overflowing at ~390 px and ~1440 px widths.
- Content is for the **target destination only** — no reference-destination copy, no placeholder
  venues, no translated filler.

After generating, save it as `{dest}-guide.html` alongside `{dest}-guide_files/` and **present the
HTML to the user** so they can view the result.

---

## 5. Delivery

Deliver the `.html` **together with its `{destination}-guide_files/` image folder** (keep them side
by side, or zip the pair), with a one-line summary (destination, days, what the modules cover).
State in one short block **删掉了什么、为什么删**（the proactive cuts from
`itinerary-selection-logic.md` — users forgive cuts they can see, not silent ones). Then update the
shared trip memory (§ Shared trip memory). The HTML file is the finished product; present it
directly for preview.
