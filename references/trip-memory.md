# Trip memory

A cross-trip memory of durable traveler preferences, stored at `~/.inchina-travel-guide/MEMORY.md`.
It turns a repeat user's "make me a Beijing guide" into a pre-filled request instead of a cold
questionnaire round. It is an input to intake, never a substitute for the current brief.

## Read rules (before intake)

- If the file exists, read it **before** offering the questionnaire or asking any question.
- Use it only for durable traveler context: pace, food and drink preferences, budget habits,
  payment/navigation preferences, companion situation, past-guide index, open threads.
- Pre-fill the intake defaults from it and say so in one line, e.g.
  「已按你的常用偏好预填：慢节奏、不吃内脏、地铁优先——有变化直接说」.
- Memory never overrides the current brief. When this trip's input contradicts memory,
  the current input wins, and the update step below reconciles the file.
- If the file does not exist, continue normally. Never block on memory setup, never ask the
  user to create it, and never mention that the feature exists.
- Do not cite an earlier destination or a previous guide's **content** unless the user asks;
  reuse preferences, not history.

## What may be stored (durable facts only)

Keep: pace preference; food and drink preferences / aversions; budget habits; payment and
navigation preferences; typical companions (e.g. "usually travels with elderly parent");
recurring constraints (mobility, dietary); the index of past guides (destination, dates, output
path); unresolved follow-ups the user explicitly left open.

Never store: raw screenshots, passport/ID numbers, booking codes, order numbers, full chat logs,
hotel/flight specifics of a finished trip, or any other sensitive or one-off material.

## Update rules (after delivery)

After each delivered guide, update the memory file once:

- add the trip to the Past Guides table (destination, dates, output path, one-line note);
- fold in any preference the user expressed during this run that is durable
  (「不吃辣」「带老人要慢」), not one-off details of this destination;
- resolve open threads that this run answered;
- keep the file compact — merge duplicates, drop anything stale.

If nothing durable changed, skip the update. Never store secrets (see the exclusion list above).

## File template

```md
# Traveler Memory

## Preferences
- Pace:
- Food / drink (likes, aversions):
- Budget habits:
- Payment preference:
- Navigation preference:
- Typical companions / constraints:

## Past Guides
| Destination | Dates | Output | Note |
|-------------|-------|--------|------|

## Open Threads
-
```
