# Research Data Shapes

This document defines the data structures that the research phase should produce for each of the six core modules. These shapes are guidance for collecting destination records; they are not a mandate to emit intermediate JSON files or run any script. Gather the fields listed below and render them directly into the final single-page HTML guide.

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
  - Restaurant Ratings: Dianping (大众点评)
  - Photos: Pexels script (`scripts/fetch_pexels_image.py`) → local download
- `region = "international"` — Destination is outside mainland China (Tokyo, Paris, New York, etc.).
  - Maps: Google Maps
  - Official Info: Official websites
  - Restaurant Ratings: Google Maps ratings
  - Photos: Pexels script (`scripts/fetch_pexels_image.py`) → local download

**港澳台**: 中国香港 / 中国澳门 / 中国台湾虽属中国领土，但涉及出入境证件与货币，
一律按 `region = "international"` 处理（Google Maps + 官网 + Google 评分），
并在当地贴士中提示港澳通行证 / 入台证等所需证件（以官方最新规定为准）。

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
          "breakfast": "string — recommendation or 'included'",
          "lunch": "string — recommendation",
          "dinner": "string — recommendation"
        }
      }
    ],
    "pace_notes": "string — e.g., 'Moderate pace with afternoon breaks'"
  }
}
```

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
          "coordinates": "optional {lat, lng}"
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

## Module 3: Shopping (购物)

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

## Module 4: Experiences (体验)

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

## Module 5: Dining (餐饮)

IMPORTANT: This module is strictly limited to TWO sub-categories only. No fine dining, cafes, bars, or chains.

### 5a. Local Snacks / Street Food (当地小吃推荐)

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
        "source": "dianping" | "google" | "none",
        "score": "number — optional, e.g., 4.5",
        "display": "string — e.g., '大众点评：4.5/5' or 'Google：4.6/5'"
      },
      "description": "string — what makes it special, how to eat it"
    }
  ]
}
```

### 5b. Signature Restaurants Worth a Detour (值得专程去)

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
        "source": "dianping" | "google" | "none",
        "score": "number — optional",
        "display": "string — e.g., '大众点评：4.7/5'"
      },
      "why_worth_detour": "string — the story, reputation, or unique factor",
      "reservation_needed": "boolean",
      "reservation_info": "string — optional"
    }
  ]
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
