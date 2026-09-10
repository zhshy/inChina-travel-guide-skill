# First-use intake

Use the bundled questionnaire as the default intake for a new or preference-light request. Open or attach `assets/intake-questionnaire/index.html`, ask whether the user wants to complete it or use mainstream defaults, and continue from the prompt it generates when completed. Do not replace this page with the host application's native multiple-choice UI.

Before offering the questionnaire, read the shared trip memory (`~/.inchina-travel-guide/MEMORY.md`, see `trip-memory.md`) and pre-fill every stable preference it holds — pace, food, budget, payment/navigation, companions. Tell the user in one line what was pre-filled; when the current brief contradicts memory, the brief wins. The questionnaire output or current written brief remains the single intake authority for this trip's specifics. Do not add a decision list, host-native choice widget or improvised questions. Once the brief includes preferences/constraints, start immediately and resolve any remaining optional fields with the skill defaults. Do not cite an earlier destination, a previous guide's content, or any other old project unless the user explicitly asks. Do not proactively explain legacy issues, exclusions or internal workflow.

If the user supplied a complete brief (destination, dates or duration, travelers, rhythm/default permission, interests and constraints), skip the questionnaire and start immediately. If the brief supplies only destination, dates/duration and travelers, show the questionnaire and ask exactly once: `其他内容要填一下问卷，还是全部按主流默认方案安排？如果不需要问卷，直接回复“按默认”即可。` A refusal or default permission completes intake and must start work without another question. A destination-only request is also valid without a questionnaire when the user explicitly asks the Agent to choose sensible defaults. If the host cannot open local HTML, provide the same one-question choice and use a short conversational fallback only when the user elects to provide preferences.

The only user-facing transport/accommodation note should be: booked transport or accommodation can be supplied as screenshots or text; otherwise those sections remain pending. Do not explain edition boundaries, excluded modules, internal architecture or comparison features unless the user asks.

The public questionnaire contains only core handbook inputs: destination; dates or days; travelers and relationship; broad budget; pace; interests; must-go places; exclusions; food/accessibility/special requirements. It never asks for flight or hotel selection criteria and never triggers commercial recommendations.

Every optional field has a neutral default. Missing fields do not block generation. Use mainstream first-visit defaults, label material assumptions and keep unprovided transport or accommodation pending.

Suggested first response:

> 我可以为你制作一份完整的个性化旅行手册，包括每日行程、景点、购物、当地体验、特色餐饮和当地贴士，并生成适合手机与电脑查看的网页。
>
> 这是 1–3 分钟的旅行需求问卷，填完后把它生成的提示词发给我即可。如果不想填，直接回复“按默认”，其他内容会按保守、主流的方案安排，不再追问。

Link `assets/intake-questionnaire/index.html` when local file links are supported. Do not paste its HTML into conversation.

## 四拍交互格式

Whenever the agent needs a user decision — questionnaire offer, region confirmation, cut
approval, delivery sign-off — ask in the four-beat rhythm: **Re-ground → Simplify → Recommend →
Options**. All four beats, in this order, every time.

| 拍 | 做什么 | 为什么 |
|----|--------|--------|
| **Re-ground** | 先告诉用户"你在哪"：当前阶段 + 正在决定什么 | 用户可能离开了一会儿，打开窗口第一眼必须是定位 |
| **Simplify** | 用大白话说清在问什么，不用术语、不说内部阶段名 | 问题本身要能被一句话理解 |
| **Recommend** | 给一个明确推荐 + 理由 | 降低决策负担，没异议直接点 |
| **Options** | 2–4 个选项，label 自解释 | 遮住说明也能选；比让用户打字摩擦小得多 |

示例（问卷二选一）：

```
Re-ground:  旅行手册 · 需求收集
Simplify:   先确认一下基本信息怎么给。
Recommend:  建议直接聊天说，你说"成都 4 天 3 晚，2 人，喜欢美食"这种一句话就够，
            其他我按默认安排。
Options:
  A) 我打字说 — 直接发一句话需求（推荐）
  B) 填问卷 — 打开 1–3 分钟的问卷，选项更全
  C) 按默认 — 什么都说，全按主流方案安排
```

示例（删点确认）：

```
Re-ground:  旅行手册 · 成都 4 天行程取舍
Simplify:   4 天放不下清单里的 14 个点，需要砍几个。
Recommend:  建议砍都江堰+青城山：往返半天起步，和市区的节奏冲突，留给二刷专程去。
Options:
  A) 按建议砍远郊（推荐）
  B) 我一定要去都江堰，砍别的
  C) 先看完整清单再决定
```

### 关键原则

- **Smart skip** — 用户指令或已预填记忆里有的信息，跳过对应问题。用户说了"两人、不要酒吧、
  带老人"，就别再问这三个。
- **问题合并** — 没有依赖关系的问题合并到一次交互，能一次解决的不拆三次。
- **不问就默认** — 非必要的探索性问题，用户没提就按默认替他决定，只问 agent 自己无法决定的事。
- **严格区分 will 和 is** — 还没执行的用"接下来会"，已完成的用"已经"。把未执行的说成已完成，信任直接崩。

### 反模式

| 反模式 | 问题 | 正确做法 |
|--------|------|----------|
| 没有 Re-ground 直接问 | 用户不知道自己在哪 | 先说「旅行手册 · Day 2 取舍」再问 |
| 列了选项没推荐 | 选择瘫痪 | 推荐一个并说清为什么 |
| 要求用户打长句回答 | 摩擦大 | 提供 A/B/C 选项 |
| 用户已说清楚 / 记忆已预填还问 | 浪费时间 | Smart skip |
| 把未执行的说成已完成 | 摧毁信任 | 严格区分 will/is |
