# Research Data Shapes

This document defines the data structures that the research phase should produce for each of the seven core modules. These shapes are guidance for collecting destination records; they are not a mandate to emit intermediate JSON files or run any script. Gather the fields listed below and render them directly into the final single-page HTML guide.

## Global Context

Every research session starts from a global context object:

```json
{
  "destination": "Chengdu",
  "days": 4,
  "travelers": 2,
  "styles": ["culture", "food"],
  "region": "domestic" | "international",
  "preferences": "optional user notes"
}
```

### Region Determination

- `region = "domestic"` — Destination is within mainland China (Beijing, Shanghai, Chengdu, Xi'an, etc.).
  - Maps: Baidu Maps
  - Official Info: WeChat Official Accounts
  - Restaurant Ratings: Dianping (大众点评) — high-rated venues
  - Lodging Ratings: Ctrip (携程) — high-rated hotels
  - Photos: Pexels script (`scripts/fetch_pexels_image.py`) → local download
- `region = "international"` — Destination is outside mainland China (Tokyo, Paris, New York, etc.).
  - Maps: Google Maps
  - Official Info: Official websites
  - Restaurant Ratings: Google Maps ratings — high-rated venues
  - Lodging Ratings: Google Maps ratings — high-rated hotels
  - Photos: Pexels script (`scripts/fetch_pexels_image.py`) → local download

**港澳台**: 中国香港 / 中国澳门 / 中国台湾虽属中国领土，但涉及出入境证件与货币，
一律按 `region = "international"` 处理（Google Maps + 官网 + Google 评分），
并在当地贴士中提示港澳通行证 / 入台证等所需证件（以官方最新规定为准）。

### Coordinates field (deeplink-ready)

Venue locations may carry `coordinates: { "lat": 39.913, "lng": 116.397, "sys": "gcj02" }` —
`sys` is `"gcj02"` for domestic venues and `"wgs84"` for international ones. Coordinates power
the card's 导航 deep-link button (see `app-deeplink-nav.md`); collect them from the venue's
Baidu/Amap POI page or share link while researching the map link, converting BD-09 → GCJ-02
when needed (converter in `app-deeplink-nav.md`). A venue without coordinates simply falls back
to its map web link — never estimate or fabricate coordinates.

## Module 1: Itinerary (行程)

```json
{
  "module": "itinerary",
  "data": {
    "overview": "string — brief summary of the trip",
    "days": [
      {
        "day": 1,
        "date": "optional date string",
        "theme": "string — e.g., 'Historical Sites'",
        "activities": [
          {
            "time": "09:00",
            "activity": "string",
            "location": "string",
            "notes": "optional string",
            "transfer_note": "optional string — 自驾时标注路程时间；若行程落在中国节假日窗口(元旦/过年/清明/端午/五一/中秋/十一/圣诞)，需在时间后括号标注×1.5倍拥堵预留，如 '车程约1.5小时（节假日建议按×1.5倍预留）'"
          }
        ],
        "meals": {
          "breakfast": "string — 只写范围：去哪个片区/哪条街吃，或 'included'",
          "lunch": "string — 只写范围：当日动线顺路的一片区域，如 'XX 片区'、'XX 地铁站附近'",
          "dinner": "string — 只写范围，同上"
        },
        "lodging_hint": "string — 只写范围：建议住哪一片/哪个地铁站一带，如 '住 XX 站一带，每天换乘一次可达'"
      }
    ],
    "pace_notes": "string — e.g., 'Moderate pace with afternoon breaks'"
  }
}
```

**模块 1 与模块 4 的分工（不要互相串）**：行程里的 `meals` 与 `lodging_hint` 只写**范围**，
为的是让当天动线顺；**具体餐厅名与酒店名一律写在模块 4**。不要把模块 4 的具名门店搬进行程，
也不要在模块 4 用"XX 片区"代替店名——模块 4 的标准就是点名（见 Module 4 的 Naming rule）。

## Module 2: Attractions (景点)

```json
{
  "module": "attractions",
  "data": {
    "must_see": [
      {
        "name": "string — attraction name",
        "name_local": "string — local language name",
        "description": "string — brief description",
        "location": {
          "address": "string",
          "map_link": "string — Baidu Maps (domestic) or Google Maps (international) link",
          "coordinates": "optional {lat, lng, sys:'gcj02'|'wgs84'} — powers the 导航 deep-link button, see 'Coordinates field' above"
        },
        "official_info": {
          "type": "wechat" | "website",
          "value": "string — WeChat Official Account name (domestic) or website URL (international)"
        },
        "opening_hours": "string",
        "ticket_price": "string — e.g., '¥60' or 'Free'",
        "best_time_to_visit": "string — e.g., 'Morning'",
        "photo_url": "string — optional",
        "photo_source": "string — e.g., 'Baidu Maps POI' or 'Official Website'"
      }
    ],
    "hidden_gems": [
      {
        "name": "string",
        "description": "string",
        "location": { "address": "string", "map_link": "string" },
        "why_visit": "string — why it's worth visiting"
      }
    ]
  }
}
```

## Module 3: Experiences (体验)

```json
{
  "module": "experiences",
  "data": {
    "activities": [
      {
        "name": "string — experience name",
        "type": "string — e.g., 'Cooking class', 'Tea ceremony', 'Workshop'",
        "description": "string",
        "location": { "address": "string", "map_link": "string" },
        "duration": "string — e.g., '2 hours'",
        "price": "string — e.g., '¥200/person'",
        "booking_info": "string — how to book",
        "why_unique": "string — what makes this special"
      }
    ]
  }
}
```

## Module 4: Dining & Lodging (餐饮住宿)

IMPORTANT: This module is strictly limited to THREE sub-categories only — local snacks, signature
restaurants, and lodging. No fine dining, cafes, bars, or chains.

**Naming rule**: every venue in this module carries a real, specific, searchable name — 餐厅名与
酒店名。A district-level answer（"推荐 XX 片区"）fails here; areas belong to module 1. Cards must
carry the name, the address and the map link so the traveler can search it and navigate to it.
The only exception: when a named venue genuinely cannot be verified, ship a directional
recommendation, mark the card 「未能核实到具体门店」, and never invent a name.

### 4a. Local Snacks / Street Food (当地小吃推荐)

```json
{
  "module": "dining",
  "subsection": "local_snacks",
  "data": [
    {
      "snack_name": "string — e.g., 'Mapo Tofu'",
      "snack_name_local": "string — local language name",
      "recommended_shop": "string — stall or shop name",
      "location": {
        "address": "string",
        "map_link": "string — Baidu Maps (domestic) or Google Maps (international)",
        "nearby_landmark": "string"
      },
      "price": "string — e.g., '¥15'",
      "rating": {
        "source": "dianping" | "google" | "xhs" | "none",
        "score": "number — optional, e.g., 4.5 (omit when only a 'xhs' word-of-mouth tag exists)",
        "display": "string — e.g., '大众点评：4.5/5' or 'Google：4.6/5'; for a xhs-sourced venue use '小红书口碑'"
      },
      "description": "string — what makes it special, how to eat it"
    }
  ]
}
```

### 4b. Signature Restaurants Worth a Detour (值得专程去)

```json
{
  "module": "dining",
  "subsection": "worth_a_detour",
  "data": [
    {
      "restaurant_name": "string",
      "restaurant_name_local": "string — local language name",
      "signature_dishes": ["string — e.g., 'Kung Pao Chicken'"],
      "location": {
        "address": "string",
        "map_link": "string — Baidu Maps (domestic) or Google Maps (international)"
      },
      "price_range": "string — e.g., '¥80-150/person'",
      "rating": {
        "source": "dianping" | "google" | "xhs" | "none",
        "score": "number — optional",
        "display": "string — e.g., '大众点评：4.7/5'; for a xhs-sourced venue use '小红书口碑'"
      },
      "why_worth_detour": "string — the story, reputation, or unique factor",
      "reservation_needed": "boolean",
      "reservation_info": "string — optional"
    }
  ]
}
```

### 4c. Lodging (住宿推荐)

原则：**先顺路，再评分**——住宿区域要落在当天动线上（或一城一个基地，每天换乘一次可达），
再在这个范围里挑平台高分酒店。境内取**携程**高分酒店；境外取 **Google Maps** 高分酒店。

```json
{
  "module": "lodging",
  "subsection": "lodging",
  "data": [
    {
      "hotel_name": "string — 酒店名（真实、可在平台搜到；必填）",
      "hotel_name_local": "string — 当地语言名（境外时）",
      "type": "string — 档次/业态，如 '精品设计酒店' / '连锁中档' / '民宿'",
      "area": "string — 所在片区/最近地铁站，用来说明为何顺路",
      "location": {
        "address": "string",
        "map_link": "string — 百度（境内）/ Google（境外）",
        "coordinates": "optional {lat, lng, sys} — 见上方 Coordinates field"
      },
      "rating": {
        "source": "ctrip" | "google",
        "score": "number — 携程评分（境内）/ Google 评分（境外）",
        "review_count": "string — 点评数，如 '3200 条'",
        "display": "string — 如 '携程：4.7/5（3200 条）'"
      },
      "price": {
        "weekday_ref": "string — 平日参考价，如 '¥420/晚'",
        "holiday_ref": "string — 节假日参考价，如 '¥880/晚'；行程不在节假日窗口时省略",
        "note": "string — '参考价，以平台实时价格为准'"
      },
      "why_stay_here": "string — 具体理由：位置/交通/安静度/亲子友好/含早等",
      "holiday_note": "string — optional：节假日上浮明显时提示可考虑同片区备选"
    }
  ]
}
```

**价格纪律**：不得编造房价。查不到就只留评分与片区，并说明"价格以平台实时价格为准"。
行程落在节假日窗口（元旦/过年/清明/端午/五一/中秋/十一/圣诞）时，平日与节假日参考价**两个都写**，
把涨幅摆给用户自己判断——不替用户设"溢价过高"的阈值。

## Module 5: Shopping (购物)

```json
{
  "module": "shopping",
  "data": {
    "districts": [
      {
        "name": "string — shopping district name",
        "location": { "address": "string", "map_link": "string" },
        "vibe": "string — e.g., 'Luxury malls', 'Local markets'",
        "best_for": ["string — e.g., 'Clothing', 'Souvenirs'"]
      }
    ],
    "souvenirs": [
      {
        "item": "string — souvenir name",
        "where_to_buy": "string",
        "price_range": "string",
        "cultural_note": "string — optional"
      }
    ]
  }
}
```

## Module 6: Local Tips (当地贴士)

```json
{
  "module": "local_tips",
  "data": {
    "transportation": {
      "getting_around": "string — overview",
      "tips": ["string — specific transport tips"]
    },
    "cultural_etiquette": {
      "overview": "string",
      "dos_and_donts": ["string — do's", "string — don'ts"]
    },
    "weather": {
      "best_season": "string",
      "current_season_notes": "string",
      "what_to_wear": "string"
    },
    "money": {
      "currency": "string",
      "payment_methods": ["string — e.g., 'WeChat Pay', 'Credit Card'"],
      "tipping_culture": "string"
    },
    "safety": {
      "general_safety": "string",
      "emergency_numbers": "string — e.g., '110 for police'"
    },
    "visa": {
      "required": "boolean — 境外才填：是否需要办理签证",
      "visa_type": "string — 签证形式，如 免签 / 落地签 / 电子签e-Visa / 提前送签贴纸签 / 过境签",
      "key_documents": ["string — 关键材料"],
      "processing_time": "string — 办理时长",
      "source": "string — 官方使领馆/移民部门来源",
      "note": "string — 提示出行前再次核实最新政策"
    },
    "public_holidays": {
      "country": "string — 目的地国家/地区",
      "holidays": ["string — 该国公共假期名称与日期"],
      "source": "string — 来源"
    },
    "holiday_booking_alert": {
      "in_china_holiday_window": "boolean — 行程是否落在元旦/过年/清明/端午/五一/中秋/十一/圣诞窗口",
      "overlaps_local_holiday": "boolean — 境外：是否同时与该国公共假期重叠",
      "message": "string — 提醒提前预订机票/酒店/火车票"
    },
    "other": ["string — any additional practical advice"]
  }
}
```

## Module 7: Unscheduled (未安排的景点清单)

The reservoir of worthwhile places that did NOT make the daily plan but sit within 30 km of a day's
anchor. Filtering rules: see `itinerary-selection-logic.md` → "Unscheduled candidates". Build it
during itinerary assembly (track near-miss candidates), not as a separate research sweep.

```json
{
  "module": "unscheduled",
  "data": [
    {
      "name": "string — 景点名称",
      "name_local": "string — 当地/中文名",
      "why_matters": "string — 一句话为何值得去",
      "nearest_day": 2,
      "distance_from_anchor_km": "string — 距当天锚点约 x km",
      "suggested_duration": "string — e.g., '约2小时'",
      "location": {
        "address": "string",
        "map_link": "string — Baidu (domestic) / Google (international)"
      },
      "reason_not_scheduled": "string — 为何未排入，如 'Day2已满' / '对Day3不顺路'",
      "photo": "string — optional，本地图相对路径 {city}-guide_files/xxx.jpg",
      "photo_alt": "string — optional 中文描述"
    }
  ]
}
```

### 复制提示词数据（供 JS 生成"编辑行程"文字）

为让第 7 模块的「生成编辑行程文字」按钮能拼出 AI 可识别的请求，页面需内联携带最小上下文
（无需单独文件）：

```json
{
  "trip": { "destination": "string", "days": 4,
            "audience": "中国年轻视觉型旅客 | 含老人/小孩",
            "time_box": "默认档或老人小孩档（见 itinerary-selection-logic）" },
  "day_themes": [ { "day": 1, "theme": "抵达·老城烟火" } ],
  "selected_candidates": [ { "name": "string", "distance_km": "string",
                             "duration": "string", "map_link": "string",
                             "reason": "string" } ]
}
```
