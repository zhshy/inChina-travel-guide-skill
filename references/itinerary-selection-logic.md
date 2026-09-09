# Itinerary selection logic

Use this logic while choosing places and assembling days. It is a selection pass over the normal research pool, not an additional research stage.

## Preference order

Apply inputs in this order:

1. explicit must-go, avoidance, health, dietary, mobility and time constraints;
2. selected questionnaire interests;
3. first-visit essentials and destination identity;
4. route quality, opening hours, rest and weather resilience;
5. the default audience tendency below.

Never override an explicit preference with a demographic assumption.

Treat explicit subculture tags literally. `二次元、动漫与游戏文化` may raise the rank of destination-relevant animation districts, game culture, official stores, exhibitions or themed events. `K-pop、偶像与韩流文化` may raise the rank of official or established music, performance, album, agency-area and fan-culture destinations. Do not merge these into generic shopping or generic “internet-famous” places, and do not apply either tag when the user did not select it or the destination lacks a credible scene.

## Default audience tendency

**默认受众（未指定时按此假设）：中国年轻视觉型旅客** — 偏好出片、节奏偏满、愿意为特色体验与
夜景/夜市投入时间；作息与结束时间按下方「Daily time budget」的默认档执行。

When preferences are missing or delegated to the Agent, assume a visually discerning young adult traveler from China who values recognizable highlights plus contemporary city life. Favor a balanced mix of:

- one or two genuinely iconic anchors rather than an exhaustive landmark checklist;
- food, cafes or desserts that are locally meaningful rather than famous only online;
- walkable contemporary neighborhoods, design/creative districts and attractive streets;
- destination-relevant fashion, beauty, select shops or markets;
- selected contemporary subcultures such as animation/games or K-pop when the destination genuinely supports them;
- sunset, skyline, riverside or an approachable evening scene when the city supports it;
- one or two signature cultural experiences with clear local identity.

Do not force nightlife, shopping, cafes or photography onto users who excluded them. Do not use “young” as permission for unsafe, exhausting, expensive or purely viral choices.

## Daily time budget (default audience)

Unless the traveler profile says otherwise, assume the **default audience above** and schedule each
full day inside this envelope:

| Slot | Default (young / no elderly or kids) | With elderly (老人) or children (小孩) |
|------|--------------------------------------|----------------------------------------|
| 出发 | **08:00** 出发 | **09:00 以后**出发（不早于 9 点） |
| 午餐 | **13:00–14:30** 之间任取一个时间，时长 **1 小时** | 同左（13:00–14:30，1 小时） |
| 晚餐 / 夜市 | 可安排夜市、夜游等夜间项目 | 可安排，但收尾更早（见下行） |
| 一天结束 | 最晚可到 **22:00–24:00** | 最晚 **21:00–22:00** 结束当天行程 |

Rules:
- 这些是**默认时间盒**，不是硬性钟点——在盒内按景点开放时间、路程与预约时段排布即可。
- 含老人或小孩时整体放缓：早上不早于 9 点出发、晚间 21:00–22:00 前收尾，
  并在半天里留出更明确的休息/用餐缓冲，避免连续高强度步行。
- 抵达日与返程日一律更轻，不适用最晚收尾时间（以航班/车次为准）。
- 若用户明确给了时间偏好（如“每天睡到自然醒”），以用户为准，覆盖本默认。

## Candidate selection

Shortlist before deep research. For every candidate, judge only five reusable dimensions: preference match, destination distinctiveness, route fit, practical confidence and time cost. Reject a candidate early when it fails two of the first four or consumes disproportionate travel time.

Avoid low-interest filler: generic workshops available in any city, repetitive museums/temples, remote photo spots with little else nearby, commercial “traditional experiences” with weak local identity, and activities selected only to fill a category. A featured experience must answer both “why here?” and “why for this traveler?” in one concrete sentence.

The researched experiences in the Experience module should directly match the traveler's selected interests where possible. With no selected interests, draw them from the destination's strongest contemporary, food/design, evening, wellness or signature-culture scenes; do not default to craft classes or formal cultural activities merely because they are easy to source. If an experience cannot be verified truthfully, replace it rather than shipping a filler card.

## Day construction

Build each full day around one geographic area and one primary anchor. Add one or two compatible secondary places, a meal/rest window and at most one optional evening extension. Arrival and departure days remain lighter.

Across the trip:

- roughly two thirds of scheduled discretionary stops should directly support selected interests;
- include first-visit essentials without letting them occupy every day;
- avoid more than two same-type attractions in one day unless explicitly requested;
- avoid cross-city backtracking for a single weak candidate;
- alternate dense and lighter periods, and preserve at least one realistic rest/meal buffer per half day;
- place shopping, cafes, nightlife and optional experiences where they are already on the route;
- keep unselected niche experiences in the Experience module rather than forcing them into the daily itinerary.

## Final coherence check

Before writing prose, review the ordered stops once: preference coverage, repeated attraction types, geographic backtracking, opening-hours conflicts, meal/rest gaps and overly late-to-early transitions. Fix those six issues from existing candidates. Do not launch a fresh broad search unless a required day has no viable anchor.
