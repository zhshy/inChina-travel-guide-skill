---
name: personalized-travel-guide-skill
description: |
  Generates a personalized, comprehensive single-page HTML travel guide for any destination.
  It first detects whether the destination is inside mainland China (domestic) or abroad
  (international) and switches data sources accordingly: Baidu Maps + WeChat Official Accounts
  + Dianping for domestic, Google Maps + official websites + Google ratings for international.
  The final deliverable is a self-contained, mobile-friendly HTML file with exactly six modules
  (行程/景点/购物/体验/餐饮/当地贴士).
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

> 核心工作流：收集输入 → 判定区域 → 研究 → 生成 6 模块单页 HTML → 交付并预览。

## Core Modules (final output — exactly 6)

The final HTML guide contains **these six sections, and nothing else**:

1. **行程 Itinerary** — day-by-day plan with time slots and activities
2. **景点 Attractions** — must-see landmarks and hidden gems
3. **购物 Shopping** — best shopping areas and souvenirs
4. **体验 Experiences** — cultural and unique local experiences
5. **餐饮 Dining** — strictly limited to two sub-categories:
   - Local Snacks / Street Food (当地小吃推荐)
   - Signature Restaurants Worth a Detour (值得专程去)
6. **当地贴士 Local Tips** — practical local advice (transport, culture, weather, payment, safety)

### Removed modules (do NOT include)
- ❌ Language Tips / 语言锦囊 — removed
- ❌ Before-departure / Preparation / 出发前准备 — removed
- ❌ Flight / hotel booking engines — never triggered

Do not add, resurrect, or re-label these removed modules.

---

## 0. Reference documents

Read the references under `references/` **only as needed** (they are small; prefer loading them
rather than guessing their rules):

| File | Load when… |
|------|-----------|
| `references/research-data-shapes.md` | defining the fields to collect for each of the six modules |
| `references/rendering-spec.md` | **before building the HTML** — the style/structure contract for the final page |
| `references/image-and-source-policy.md` | sourcing images, ratings, and map links (region-aware) |
| `references/itinerary-selection-logic.md` | choosing places / building daily itineraries from traveler interests |
| `references/first-use-intake.md` | handling intake (questionnaire vs. defaults) for a new request |

> **Local images (must-do before writing cards)**: run the bundled Pexels fetcher
> `scripts/fetch_pexels_image.py` to download each venue photo into `{destination}-guide_files/`
> (see `rendering-spec.md §5.1` and `image-and-source-policy.md §0` for the exact command and rules).
> It reads a key from `scripts/.pexels_key` or env `PEXELS_API_KEY` (that file is gitignored; it is
> set locally by the skill owner — see `scripts/fetch_pexels_image.py` header for how to configure).

> `assets/canonical/product/index.html` is kept **only as a visual-style reference** (its editorial
> look, card rhythm, typography). Open it in a browser if you need a sense of a premium handbook
> aesthetic. **Never copy its Bali content, never reproduce its 8-chapter structure, and do not try
> to drive it with any script.** You render a fresh 6-module page yourself.

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
| Photos | **Pexels via `scripts/fetch_pexels_image.py`** (both regions) — see §4 / rendering-spec §5.1 | same |

The questionnaire lets the user override the auto-detected region.

---

## 2. Intake (input collection)

- Follow `references/first-use-intake.md`.
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
- **Dining**: ONLY local snacks / street food AND restaurants worth a detour. Skip fine dining,
  cafes, bars, and chains.
- **Shopping**: distinctive local products + best shopping districts; explain what/where/how to
  choose + packing or customs caveats.
- **Experiences**: cultural activities, classes, workshops, performances, seasonal or local events
  with real local identity.
- **Local Tips**: transport, cultural etiquette, weather/what-to-wear, payment, safety.

Image/rating/map-source rules and exclusions: see `references/image-and-source-policy.md`.
Do **not** invent opening hours, prices, ratings, or map links. When a fact can’t be verified,
omit it or clearly mark it as approximate rather than fabricating.

### 3.1 节假日与预订提醒（按 region 分支执行）

先确认行程日期是否落在下列**中国节假日窗口**内：
**元旦、过年（春节）、清明、端午、五一、中秋、十一（国庆）、圣诞**。

**境内行程（domestic）**
- 若行程落在上述窗口内，**且该段行程为自驾**：行程里每个"路程所需时间"都要在后面用括号
  标注一个提示——拥堵系数，例如：`车程约 1.5 小时（节假日拥堵，实际建议按 ×1.5 倍预留）`。
- 同时在贴士/行程显著位置提醒：**提前预订机票、酒店、火车票**（节假日一票难求、房价上浮）。
- 非自驾的境内节假日行程同样建议给出提前预订提醒（机票/酒店/火车），但不强求 ×1.5 标注。

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
contract (file constraints, layout, six-section shape, per-card fields, accessibility, definition
of done). Follow it so every guide looks premium and consistent.

Assemble **one HTML file + its sibling local-image folder** that works on phone + desktop:

- **Fetch venue photos** so cards aren't imageless: for each 必去 attraction (and, when
  fitting, each signature experience / worth-a-detour restaurant / representative souvenir) run
  `scripts/fetch_pexels_image.py "<地点名>" "<english keywords>" --out {dest}-guide_files
  --filename {slug}.jpg`. Read the returned `alt`, pick a topic-matching candidate, and keep the
  downloaded file path to reference in the card. See `rendering-spec.md §5.1`.
  **配图不是硬性底线**：某地点取不到贴切图时可整洁无图，不要硬塞不相关的图。
- **6 sections only** (order: Itinerary, Attractions, Shopping, Experiences, Dining, Local Tips),
  each with a clear numbered section and anchor navigation at top.
- Fixed **blue/teal editorial theme** — do not ask the user to pick a color.
- Every place/venue card includes: name, description, a **precise location link** (Baidu Maps
  domestic / Google Maps international), and a **local image** (`<img class="card-img" ...>` with
  `src="{dest}-guide_files/{file}"`). Restaurant cards must label the **rating source**
  (大众点评 / Google).
- Inline the CSS (and only the JS truly needed); keep the HTML portable so it can be opened from
  disk or served statically **together with its `_files/` image folder**.
- Responsive: readable and non-overflowing at ~390 px and ~1440 px widths.
- Content is for the **target destination only** — no reference-destination copy, no placeholder
  venues, no translated filler.

After generating, save it as `{dest}-guide.html` alongside `{dest}-guide_files/` and **present the
HTML to the user** so they can view the result.

---

## 5. Delivery

Deliver the `.html` **together with its `{destination}-guide_files/` image folder** (keep them side
by side, or zip the pair), with a one-line summary (destination, days, what the 6 modules cover).
The HTML file is the finished product; present it directly for preview.
