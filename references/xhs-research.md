# Xiaohongshu Research Workflow (小红书调研 — optional enhancement)

> **Purpose & scope.** Xiaohongshu (小红书) notes are a high-value, traveler-written signal for
> **Dining (当地小吃 / 值得专程去)** and sometimes Experiences/Shopping — especially for
> `international` destinations where 大众点评 coverage is weak or absent, and where official
> sites/Google ratings are thin. This document defines when and how to harvest that signal.
>
> **It is an OPTIONAL channel, never a hard gate.** This skill runs inside AI Agent sandboxes where
> the browser-automation tooling below may or may not exist. Treat it as *a way to enrich* Dining
> research when the environment supports it, **and fall back to the existing sources
> (微信公众号 / 官网 / 大众点评 / Google) the moment it does not.** Do not fabricate note data, do not
> claim a run used Xiaohongshu when it could not.

---

## When to consider Xiaohongshu research

Use it when **all** of these hold:

1. You are researching the **Dining module** (both 当地小吃 and 值得专程去), or occasionally a local
   Experience/Shop where word-of-mouth matters more than the official listing.
2. The venue has **weak structured sources** — e.g. `international` street food / a niche 老字号 /
   a hidden-gem shop whose 大众点评 or Google page is sparse, outdated, or missing.
3. The generation environment actually has a working **browser-automation / CDP path** (see §Prereq).

Skip it (use the normal sources) when any is true: the venue already has solid official/rating data,
the sandbox lacks the tooling, or the task is under time/network pressure.

---

## Prereq — you need a real browser to read Xiaohongshu

Xiaohongshu is heavily anti-scraping. The web search page itself can be reached by direct URL, but
its data is protected by login walls, per-account rate limits, double/transparent inputs, an
autocomplete layer, and 风控 (risk) logic. **A generic HTTP `fetch` to its API will usually be
blocked** (e.g. a `code:300011` style account-switch error) and must not be relied on.

Reliable reading therefore needs a real Chrome instance driven over the **Chrome DevTools Protocol
(CDP)**. The exact driver (OpenCLI, Playwright, Puppeteer, a local CDP script, etc.) is up to the
environment. The important, reusable rules are:

- Start a **debuggable Chrome with a dedicated profile and remote-debugging port**, and let it open
  `https://www.xiaohongshu.com/explore` once so login/cookies are warm.
- Connect to that Chrome's CDP endpoint (`http://127.0.0.1:<port>`) from the automation tool.
- Confirm the tooling first (`doctor`/probe) before spending time; if the browser bridge or CDP is
  offline, **stop and fall back** rather than guessing.

> The reference implementation this pattern is based on used the `@jackwener/opencli` CLI plus a
> Chrome **Browser Bridge** extension (npm `-g` install, a manual unpacked-extension load, PATH
> export). That is only an example driver; your sandbox may offer Playwright/Puppeteer instead. The
> technique below is driver-agnostic.

---

## Search by URL route, not by typing

**Do not simulate typing into the search box.** Xiaohongshu's search UI has double/transparent
inputs and a suggest layer; simulated keystrokes often *appear* to succeed without returning real
results. The robust entry point is navigating straight to the results route:

```
https://www.xiaohongshu.com/search_result?keyword=<URL-encoded query>
```

## Read the results API the page fires

After that navigation, watch the network for the notes-search call:

```
POST https://edith.xiaohongshu.com/api/sns/web/v1/search/notes
```

Typical body (shape, not a contract):

```json
{ "keyword": "<your query>", "page": 1, "page_size": 20,
  "sort": "general", "note_type": 0 }
```

The response carries each hit's `id`, `xsec_token`, title, author, and engagement (likes / collects /
comments). **For a first pass you usually need only the search results** — they are enough to judge
signal strength; do not open detail pages for everything.

## Two-phase read (fast + low risk)

1. Harvest the top **10–20** notes from the search results page.
2. Open detail pages for only the **2–3 most relevant** notes.

This keeps the run quick, minimises 风控 exposure, and yields cleaner `.md` output.

To open a specific note, compose its detail URL from the search hit:

```
https://www.xiaohongshu.com/explore/<id>?xsec_token=<token>&xsec_source=
```

On the detail page, prefer semantic selectors (e.g. a title element, a description/body element, an
author-name element) and fall back to the page's visible text if a selector is missing.

---

## Filter — keep real-shop signals, drop noise

**Keep** a note when it shows a real-shop signal:
- Shop name, address, **and** dish are explicit.
- The writer gives their own first-hand experience.
- A specific high-value cue repeats across several notes (queue, must-order dish, timing).

**Drop**:
- A venue mentioned only in passing inside a broad "all of <city>" roundup.
- A title about hotel/walk that happens to mention the shop later.
- Clearly copied/re-posted content.

**Decision-useful cues to prioritise** when writing back:
- Do you queue? How bad?
- Main meal or an end-of-meal coda?
- Better day or night?
- More "check-in/photo" spot vs a proper solid meal?
- Easy to be disappointed (踩空) or not?

Deprioritise: pure emotion, pretty-but-useless adjectives, "great vibe" repeated three times.

---

## Write back — one layer of conclusion, not note dumps

Do **not** paste note text. Per recommended venue, record only:

- Shop name
- **One** representative note link (the strongest source)
- Two or three compressed judgment lines (what/why it fits this traveler, the queue/timing caveat)

---

## Auto-suggest API (low priority)

There is also a recommend/suggest endpoint that returns related search terms. It is rarely worth the
effort for itinerary research; treat it as last resort only.

---

## Known pitfalls

1. **A working `agent-reach`/generic connector ≠ Xiaohongshu availability.** Verify the browser/CDP
   path is actually live before investing time.
2. **The search box is hostile** — the results URL is the reliable entry.
3. **Direct API `fetch` is likely blocked** (account-switch/risk codes). Prefer a real page + captured
   response over raw API calls.
4. **Results mix regional/tag noise.** That noise is informative about the neighbourhood but must not
   be treated as single-shop reputation.

---

## How this feeds the guide

- When a Dining recommendation is **corroborated or originated** via Xiaohongshu, record it into the
  card's source/rating field using `rating.source: "xhs"` (see `research-data-shapes.md`) and show a
  short source tag like `小红书口碑` on the card if a score isn't authoritative.
- Keep the venue's official contact/address/map link (百度/Google per region) unchanged — the XHS note
  is a **word-of-mouth corroboration**, not the primary location source.
- Never let a fabricated or stale note become the reason a venue appears; a venue still needs the
  normal fact-check gates (see `image-and-source-policy.md`).
