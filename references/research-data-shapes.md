# Research pack data shapes

Use these minimal shapes when authoring research packs. Add researched fields required by the generated task, but do not change these container types.

The machine-readable authority is `assets/research-pack-contract.json`. Generated research tasks, early pack validation, compilation and consistency auditing all read that file. The examples below are explanatory views of the same contract.

## Framing roots and itinerary periods

`destination`, `display_name`, `country` and required string `year` are four separate root fields. They are not nested inside a `destination` object. Dates and trip preferences live under `trip`:

```json
{
  "destination": "Sample City",
  "display_name": "示例城市",
  "country": "Sample Country",
  "year": "2026",
  "trip": {"start_date": "2026-11-10", "end_date": "2026-11-14", "days": 5, "rhythm": "relaxed", "travelers": "2", "interests": [], "constraints": []}
}
```

Every itinerary day has one `periods` object. Morning, afternoon and evening are children of that object, never three root fields:

```json
{
  "date": "2026-11-10",
  "theme": "老城与河岸",
  "summary": "上午进入老城，下午沿河步行，晚间在同区用餐。",
  "periods": {
    "morning": {"title": "老城", "description": "从中央市场步行到古城门。"},
    "afternoon": {"title": "河岸", "description": "沿河参观寺院并预留咖啡休息。"},
    "evening": {"title": "夜市", "description": "在河岸夜市用餐后返回住宿区。"}
  }
}
```

## Place references and groups

Module groups never contain a bare string ID. Wrap every reference:

```json
{
  "title": "温泉与入浴",
  "subtitle": "日归泡汤",
  "items": [{"place_id": "onsen-01"}, {"place_id": "onsen-02"}]
}
```

The referenced place exists exactly once in a `places/*.json` array and owns its description, links, hours and images. Itinerary stops also use an object with `place_id`; they are not strings.

## Pending and confirmed transport

Unknown transport is:

```json
{"status": "pending", "legs": []}
```

Confirmed transport is `{"status":"confirmed","legs":[...]}`. Each leg is an object containing `direction`, `date`, `service_number`, `origin`, `destination`, `departure_time` and `arrival_time`; add terminals only when verified. Never mix pending placeholders with confirmed legs.

## Pending and confirmed stays

Unknown accommodation is represented by one status object and no property place:

```json
[{"status": "pending", "place_id": null, "check_in": null, "check_out": null, "notes": "住宿待确认"}]
```

A confirmed stay uses `status: "confirmed"`, a real hotel `place_id`, `check_in` and `check_out`. That hotel must exist once in the places pack and carry two verified image declarations. Do not create a hotel-area record for a pending stay.

This public edition does not import a flight/hotel decision product. Put only user-supplied booked transport or stay facts directly into the framing pack. Never scrape or reconstruct another product's HTML; missing facts remain in the neutral pending state.

## Daily shopping and photography guidance

Every itinerary stop also supplies `practical_note` and `time_guard`. `practical_note` says what to do, what to notice and how to use the stop without generic filler. `time_guard` gives one useful decision boundary: latest sensible departure, maximum queue, a shortening rule or a transfer buffer. Write both while the route is authored; Trip Mode reuses them without another research or generation pass. Every scheduled place records verified `latitude` and `longitude` (or an equivalent `coordinates` pair) during the normal exact-place lookup so the offline hand-drawn route keeps correct relative geography. Never guess coordinates.

Every itinerary day has `shopping_advice` (`title`, `description`, `url`, `link_label`) for Trip Mode only. An intentionally shopping-free day still supplies an honest route-specific reason and links back to the full shopping guide. Never render this block in the main itinerary and never retain legacy island copy for a city destination.

Every day also has `photo_advice` with `title`, `lighting`, at least two non-empty `suitable_shots` entries, `portrait_tip`, and a compact `shooting_plan` of two or three `{time,title,note}` cards tied to scheduled places. These are protected authored fields: name scheduled places, lighting direction/time, subject/viewpoint/composition and a route-specific portrait or etiquette constraint. They must differ across days; do not seed them with reusable generic prose. The main itinerary renders the canonical two-column text card; Trip Mode reuses the same payload and keeps direct local sample upload. Optional `samples` may be injected only when every item is verified. If no verified local sample exists, omit `samples`; never render a broken placeholder. The generic bottom “小红书找人像样片” action is intentionally absent, while exact-place Xiaohongshu buttons on Trip Mode stop cards remain.

## Restaurant names, dishes and ratings

The food module uses `local_snacks` (exactly four authored food entries), `dedicated_trip` (six or more restaurant references) and `reliable_chains` (two to four exact restaurant-branch references). Do not emit `near_stay` or `delivery`. For trips of three or more days, at least three IDs from `dedicated_trip` also occur in itinerary stops; their times and branches must be compatible with the route. A chain fallback is locally characteristic and established across multiple branches, not merely a famous independent restaurant.

`signature_dishes` is concise researched display copy naming two or more specific dishes, not a raw JSON array, generic phrase, or placeholder:

```json
{
  "local_name": "店舗の現地語名",
  "english_name": "Official English Name",
  "signature_dishes": "dish one · dish two",
  "ratings": [
    {"platform": "Google", "status": "verified", "rating": 4.4, "review_count": 1280, "source_url": "https://…", "verified_at": "YYYY-MM-DD"}
  ]
}
```

`ratings` is optional and may be omitted or an empty array. At the start of place research, open one ordinary exact-place Google result as the run-level capability probe. If it opens, Google is available: look up every rating-bearing sight and restaurant and attempt to capture both score and review count. Full venue coverage is required when the channel is available. If one venue cannot open because of timeout, access or blocking failure, retry that same venue once with a shorter exact query or alternate canonical Google entry; after a second failure, continue to another real venue. Stop remaining rating work only after two different venues fail to open consecutively. Any opened venue resets the consecutive-failure count, and all ratings already found remain valid. A page that opens without a reliable score affects only that venue and is not an access failure. `review_count` is optional: show it when Google exposes it reliably, otherwise omit only the count and keep the verified score. A focused rating-repair pass may patch venues skipped by an earlier erroneous stop-loss, followed by recompile/render/dependent gates. Do not create an `unavailable` record merely to prove that a search failed. A verified record includes `rating`, its exact source URL and retrieval date. Never use zero as a substitute.
