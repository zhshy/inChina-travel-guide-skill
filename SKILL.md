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
duration, and traveler profile. The HTML is the deliverable — deliver one self-contained `.html`
file (inline styles + minimal inline JS), no build scripts, no server, no external framework
dependency.

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

Use `region` to pick data sources everywhere:

| Data | domestic (境内) | international (境外) |
|------|-----------------|----------------------|
| Location map | Baidu Maps link | Google Maps link |
| Official info | WeChat Official Account name | Official website URL |
| Restaurant rating | Dianping (大众点评) score | Google Maps rating |
| Photos | Official WeChat article / Baidu Maps POI | Official website / Google Maps |

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

---

## 4. Build the HTML guide

**Before writing any HTML, load `references/rendering-spec.md`** — it is the style/structure
contract (file constraints, layout, six-section shape, per-card fields, accessibility, definition
of done). Follow it so every guide looks premium and consistent.

Assemble **one self-contained HTML file** that works on phone + desktop:

- **6 sections only** (order: Itinerary, Attractions, Shopping, Experiences, Dining, Local Tips),
  each with a clear numbered section and anchor navigation at top.
- Fixed **blue/teal editorial theme** — do not ask the user to pick a color.
- Every place/venue card includes: name, description, and a **precise location link** (Baidu Maps
  domestic / Google Maps international). Restaurant cards must label the **rating source**
  (大众点评 / Google).
- Inline the CSS (and only the JS truly needed); keep the file portable so it can be opened from
  disk or served statically.
- Responsive: readable and non-overflowing at ~390 px and ~1440 px widths.
- Content is for the **target destination only** — no reference-destination copy, no placeholder
  venues, no translated filler.

After generating, save it as a `.html` file and **present/preview it to the user** so they can
view the result.

---

## 5. Delivery

Deliver the single HTML file with a one-line summary (destination, days, what the 6 modules cover).
The HTML file is the finished product; present it directly for preview.
