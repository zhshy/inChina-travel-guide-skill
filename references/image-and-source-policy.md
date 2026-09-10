# Image and Source Policy

This document defines where and how to obtain images and source references for venues, attractions, and dining.

---

## 0. Primary executable image channel — Pexels API (use this for venue photos)

The research/venue sources below (WeChat articles, Baidu POI, Google Maps …) describe where to
*fact-check* opening hours, prices, and ratings. But for the **actual photo files** you embed in the
HTML, the reliable, executable path in the generation sandbox is the bundled Pexels script:

- Script: `scripts/fetch_pexels_image.py`
- It reads a local Pexels key from `scripts/.pexels_key` or env `PEXELS_API_KEY`, searches by an
  English keyword, lets you pick from candidates (via returned `alt` descriptions), and **downloads
  the chosen image locally** into `{city}-guide_files/`. That local file is what your `<img>` points
  to — it is 100% stable, offline-friendly, never breaks.
- Pexels License ≈ CC0: free to use commercially, to modify, no attribution required. No watermark.
- **Do NOT rely on remote image hotlinks** (WeChat/百度/小红书/Google/Wikimedia URLs) inside the
  HTML — those need login, have Referer anti-hotlink protection, or aren't reachable from the
  generation sandbox; they will break or can't be verified. Local download is the default.
- If Pexels is unreachable or has no key in a given run: tell the user honestly and offer options
  (provide a key / user-supplied image / styled placeholder), never force a broken remote image.

---

## Region-Based Sourcing

All research must respect the `region` flag set at the start of the build.

### Domestic (境内)

| Content Type | Preferred Source | Fallback |
|--------------|------------------|----------|
| **Venue photos (embed in HTML)** | **Pexels script (§0) → local download** | styled placeholder |
| Fact-check hours/tickets | WeChat Official Account or Baidu Maps info | Local travel blogs |
| Map location | Baidu Maps static image or embed link | - |
| Restaurant score | **Dianping (大众点评) — high-rated venues** | - |
| Hotel score & price | **Ctrip (携程) listing — high-rated hotels** | Hotel official site |

### International (境外)

| Content Type | Preferred Source | Fallback |
|--------------|------------------|----------|
| **Venue photos (embed in HTML)** | **Pexels script (§0) → local download** | styled placeholder |
| Restaurant/food fact-check | Official website or Google Maps | TripAdvisor |
| Map location | Google Maps static image or embed link | - |
| Opening hours / tickets | Official website | Google Maps |
| Restaurant / hotel score | **Google Maps — high-rated venues** | TripAdvisor / Booking (if more relevant) |

---

## Photo Requirements

- Each place card SHOULD include a local photo downloaded via the §0 Pexels script when a
  topic-matching one is available — images make the guide considerably more appealing.
- **Not mandatory**: if no suitable, correctly-licensed photo can be found for a place, ship the
  card **without an image** and keep it tidy. Do not pad with an unrelated photo and do not add a
  fake placeholder block.
- Photo should **match the venue's theme** — for a famous landmark prefer the actual landmark when
  Pexels returns it; a generic unrelated photo is NOT acceptable (better to omit). A
  close-but-not-exact representative photo is acceptable if labeled “主题示意图” in the footer.

### Photo Credit
- In the page footer note the source once, e.g. “配图来源：Pexels（License 可商用，主题示意图）”.

---

## Image Acquisition Steps (per venue)

1. **Default**: run `python scripts/fetch_pexels_image.py "<地点名>" "<english keywords>" --out {city}-guide_files --filename {slug}.jpg`.
   - Read the printed `alt` of each candidate; pick the one whose description best matches the venue
     (default is candidate #0; use `--pick N` to choose another, or `--preview-only` to compare first).
   - Keywords matter: try `"giant panda china"` for 熊猫基地, `"sensoji asakusa"` for 浅草寺, etc.
2. **No good match**: change the English keywords and retry up to a couple of times. Still poor →
   label the card “主题示意图” and use the closest topic image, or fall back to a styled placeholder
   and tell the user.
3. **Region-based sources** (the tables below) are for **fact-checking** hours/prices/ratings and for
   finding official accounts/websites — not for embedding photo files, since those channels can't be
   reliably fetched/hotlinked from the generation sandbox.

---

## Map Link Format

- Domestic: `https://api.map.baidu.com/staticimage?center={lat},{lng}&width=...`
  - Or simply provide a link to the Baidu Maps search result: `https://j.map.baidu.com/xxxx`
- International: `https://www.google.com/maps/place/{venue_name}`

---

## Rating Sources

| Region | Content | Primary Rating | Secondary Rating |
|--------|---------|---------------|------------------|
| Domestic | Restaurant | **Dianping (大众点评)** score — high-rated venues | - |
| Domestic | Hotel | **Ctrip (携程)** score + review count — high-rated hotels | Hotel official site |
| International | Restaurant | **Google Maps** rating — high-rated venues | TripAdvisor (if more relevant) |
| International | Hotel | **Google Maps** rating — high-rated hotels | Booking / Agoda (if more relevant) |
| Either (optional) | Restaurant | Xiaohongshu word-of-mouth (`xhs`) | — use only to corroborate a venue whose official/score coverage is weak, not as the primary rating |

When displaying ratings, always label the source clearly (e.g., "大众点评：4.5/5"、"携程：4.7/5
（3200 条）" or "Google：4.6/5").

**Hotel picks** default to a high platform score — 境内 携程 ≥ 4.5（优先 4.7+ 且有足量点评数），
境外 Google ≥ 4.3 — inside a lodging area that sits on the day routes. Inside a China holiday
window (元旦/过年/清明/端午/五一/中秋/十一/圣诞), record **both** the weekday reference price and the
holiday reference price on the card and label them 参考价（以平台实时价格为准）: surface the markup,
do not decide for the traveler and do not impose a markup threshold. Never fabricate a price — if
the price cannot be checked, keep the score and the area and say so.
A venue corroborated via Xiaohongshu notes shows the tag **"小红书口碑"** (`rating.source: "xhs"`) and
normally carries **no numeric score** unless a specific, sourced one exists. The optional
Xiaohongshu harvesting workflow is in `references/xhs-research.md`; it is an enhancement, never a
gate — with no browser/CDP tooling, fall back to the primary/secondary sources above and do not
invent note data.

---

## Exclusions

- Do NOT hotlink images from Wikipedia / Wikimedia `upload.wikimedia.org` URLs into the HTML — not
  reachable/verifiable from the sandbox. (Local Pexels downloads are the supported path.)
- Do NOT embed images from WeChat articles, Baidu/Google Maps, Xiaohongshu, or other sites that
  require login, signed URLs, or Referer anti-hotlink — they will break or can't be fetched.
- Do NOT use a Pexels/stock photo that clearly shows a *different* venue or wrong subject; the photo
  must at least match the venue's theme. Judge by the returned `alt`; retry with a better keyword if
  unsure. A photo that merely resembles the place should be labeled “主题示意图” in the footer.
- A place card with no suitable photo is acceptable — omit the image rather than misrepresenting the
  venue.
