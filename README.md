# 🧳 China Travel Guide Skill

一个基于 AI 的智能旅行手册生成器，专为**中国境内旅行**深度优化，同时完美支持境外目的地。

本 Skill 是 [personalized-travel-guide-skill](https://github.com/TokenHungryMash/personalized-travel-guide-skill) 的增强分支，针对中国旅行场景进行了全面改造。

---

## ✨ 主要特性

### 🗺️ 智能区域识别（核心升级）
- **自动判断**目的地在中国境内还是境外
- **境内**：自动切换至百度地图、微信公众号、大众点评（餐厅评分）、携程（酒店评分）
- **境外**：使用 Google Maps、官方网站、Google 评分（餐厅与酒店）
- 用户也可在问卷中手动修正区域判断

### 🧭 导航按钮 · App 深链唤起
- 每张地点卡片带「导航」按钮，按区域优先级唤起原生地图 App：**境内 高德 > 百度 > 苹果原生**；
  **境外 Google 地图 > 苹果原生**（见 `references/app-deeplink-nav.md`）
- "装没装 App" 用 scheme 尝试 + 可见性超时判定，全失败回落链首网页版；无坐标回落卡片地图链接
- 微信/抖音等 WebView 内自动跳过 scheme，直接开网页版；桌面端直接开网页版

### 🧠 跨行程记忆
- 首次生成后，把长期有效的旅行偏好（节奏、饮食忌口、预算习惯、支付/导航偏好、常同行人）沉淀到
  `~/.inchina-travel-guide/MEMORY.md`（见 `references/trip-memory.md`）
- 再次使用时自动预填偏好并告知用户，免去重复问卷
- 严格不存敏感信息：截图、证件号、订单号、完整聊天记录一律不入库

### 📦 精简的 7 大模块
相比原版的 8 大模块，移除了冗余内容，聚焦核心旅行信息，并新增「未安排的景点清单」：

| # | 模块 | 说明 |
|---|------|------|
| 1 | 行程 (Itinerary) | 每日时间线安排 |
| 2 | 景点 (Attractions) | 必去景点 + 小众宝藏 |
| 3 | 体验 (Experiences) | 文化体验 / 特色活动 |
| 4 | 餐饮住宿 (Dining & Lodging) | **仅三类**：当地小吃 + 值得专程去的餐厅 + 住宿推荐；餐厅与酒店都**给出具体名称** |
| 5 | 购物 (Shopping) | 购物区 + 特色伴手礼 |
| 6 | 当地贴士 (Local Tips) | 交通、文化、安全等实用信息 |
| 7 | 未安排的景点清单 (Unscheduled) | 每天行程 30 km 内未排入的景点，勾选后生成可复制的 AI 编辑行程文字 |

**已移除模块**：~~语言锦囊~~ · ~~出发前准备~~

### 🍜🏨 餐饮住宿全新定位
- **当地小吃推荐**：夜市、早餐摊、传统小吃，附带价格和地标，**点名一家代表店**
- **值得专程去**：有招牌特色菜的本地名店，**给出具体店名**，附带专程前往的理由
- **住宿推荐**：**给出具体酒店名**（境内取携程高分酒店、境外取 Google 高分酒店），
  含所在片区/最近地铁站、评分与点评数、平日参考价与节假日参考价
- **分工**：行程模块只写"范围"（顺路的一片区域 / 地铁站一带），具体店名与酒店名一律在第 4 模块
- **不再包含**：高端餐厅、咖啡馆、酒吧、连锁快餐；也不做预订入口

### 🎨 固定配色方案
- 统一使用蓝/青绿色系，无需用户选择，开箱即用
- **统一语义标注系统**（rendering-spec §2.1）：时间、价格、地点、链接、警示各有专用色与固定形式，
  同一信息全页只有一种颜色与写法；强调分三档、文字底色高亮全页 ≤3 处；同一模块不混用表格与卡片

### 🗂️ 已发布的成品实例
- 收录三份用本 Skill 生成、已上线的真实攻略，可**直接点开看成品**：
  [埃及 13 天](https://zhshy.github.io/Egypt/) ·
  [乌兰布统·多伦 6 日自驾](https://zhshy.github.io/Ulanbutong/) ·
  [北京 3 日游](https://zhshy.github.io/beijing-nationalday-guide/)
- 生成前对照它们的版式与字段，比只读规范更快对齐全貌（详见下文「已发布的成品实例」）

---

## 🚀 快速开始

### 方式一：通过问卷（推荐）
1. 打开 `assets/intake-questionnaire/index.html`（也可部署到 Web 服务）
2. 填写目的地、天数、人数、旅行风格、特别偏好
3. 确认区域（自动判断/中国境内/境外）
4. 点击「生成旅行手册」，将数据发送给 AI 助手
5. 获得一份完整的 HTML 旅行手册

### 方式二：直接对话
直接向 AI 助手发送自然语言请求，例如：
> “帮我生成一份成都 4 天 3 晚的旅行手册，2 人，喜欢美食和文化”

AI 将自动判断区域并启动研究流程。

---

## 📊 数据来源对照表

| 数据类型 | 中国境内 (domestic) | 境外 (international) |
|---------|-------------------|---------------------|
| **位置地图** | 百度地图 | Google Maps |
| **官方信息** | 微信公众号 | 官方网站 |
| **餐厅评分** | 大众点评 | Google 评分 |
| **酒店评分** | 携程（选高分酒店） | Google Maps（选高分酒店） |
| **图片来源** | **Pexels 免费 API（经 `scripts/fetch_pexels_image.py` 下载到本地）** | 同左 |

---

## 🖼️ 配图（每次生成都带图）

为了让**每次生成**都自动配本地图，本分支内建了 Pexels 取图通道：

- 脚本：`scripts/fetch_pexels_image.py`（纯 Python、无第三方依赖）
- 作用：按地点英文关键词搜索 Pexels → 打印候选（id + alt）→ 下载选中图到本地
  `{城市}-guide_files/`，HTML 用相对路径引用，图 100% 本地可显示、不裂图。
- 授权：Pexels License（≈CC0，可商用、可修改、无需署名）。
- 用法：
  ```bash
  # 配置 key（任选其一）
  export PEXELS_API_KEY=你的key
  # 或把 key 写进 scripts/.pexels_key（已 gitignore）

  # 单个地点下载
  python scripts/fetch_pexels_image.py "成都大熊猫基地" "giant panda china" \
      --out chengdu-guide_files --filename panda-base.jpg

  # 批量（plan.csv：地点,英文关键词,文件名）
  python scripts/fetch_pexels_image.py --batch plan.csv --out chengdu-guide_files

  # 先看候选不下载，再 --pick N 选第 N 张
  python scripts/fetch_pexels_image.py "浅草寺" "sensoji asakusa" --preview-only
  ```

> ⚠️ 生成环境（沙盒）访问不了 Wikimedia / 百度 / 小红书等多数图床，也无法逐张目检远程 URL。
> Pexels 是实测唯一可稳定调用、可下载、可商用的免费通道——故作为默认。若某次运行无 key 或
> API 不可达，agent 会向用户说明并提供替代方案，而不是硬放会裂的图。

---

## 🧪 实战示例：发布攻略到独立域名

本 Skill 的交付物是 **一个 HTML + 同级 `{城市}-guide_files/` 本地图片目录**。若想把某份生成好的攻略
分享给他人，推荐给它配一个 **独立的 GitHub Pages 域名**，让攻略有专属的、可永久访问的链接。

以「北京·国庆 3 日游」为例，完整流程如下：

| 步骤 | 说明 |
|------|------|
| 1️⃣ 用本 Skill 生成攻略 | 产出目录 `beijing-nationalday-guide/`，内含 `beijing-nationalday-3days.html` + `beijing-nationalday-guide_files/`（8 张本地图，HTML 用相对路径引用） |
| 2️⃣ 为攻略建独立仓库 | 新建 GitHub 仓库，命名与攻略同名，如 `zhshy/beijing-nationalday-guide`，获得独立 Pages 子路径 `/beijing-nationalday-guide/` |
| 3️⃣ 放入并配置 Pages | `main` 分支直接放 HTML + 图目录 + `index.html`（跳转到攻略页）+ `.nojekyll`，仓库 Settings→Pages 开启，Source 选 `main` / root |
| 4️⃣ 上线 | 得到专属链接 `https://zhshy.github.io/beijing-nationalday-guide/`（根入口）与 `.../beijing-nationalday-3days.html`（攻略本体） |

> ✅ **要点**：攻略自身的 `beijing-nationalday-guide_files/` 图片用**相对路径**引用、与 HTML 一起分发，
> 因此整套文件直接放进任何静态托管（GitHub Pages / Vercel / 网盘）都能正常显示、不裂图。
>
> ✅ **独立域名的意义**：不要把攻略塞进本 Skill 仓库的 `gh-pages` 分支——那会让链接长成
> `…/inChina-travel-guide-skill/beijing-nationalday-3days.html`，且把生成物与 Skill 源码混在一起。
> 新建同名独立仓库后，攻略拥有干净短链 `https://zhshy.github.io/beijing-nationalday-guide/`，
> Skill 仓库也保持纯净（只含源码，无需 `gh-pages` 分支）。

---

## 📚 已发布的成品实例

用本 Skill 生成、已上线可公开访问的攻略。想快速看清「成品长什么样」，直接打开这几个链接比读规范更快。

| 成品 | 链接 | 区域 / 类型 | 可重点参考 |
|------|------|-------------|-----------|
| **埃及 13 天 · 红海潜水 + 尼罗河人文** | <https://zhshy.github.io/Egypt/> | 境外（埃及）· 单人自由行 · 潜水 + 人文 | 境外分支的完整形态：Google 地图链接与评分来源标注、航站楼 / 检查站类风险提示、13 张逐日卡的时间轴密度、模块 7 未安排清单（10 项）与结构化调整请求 |
| **乌兰布统 · 多伦 6 日自驾** | <https://zhshy.github.io/Ulanbutong/> | 境内（内蒙古）· 2 人自驾 · 国庆窗口 | 境内分支 + 节假日：×1.5 拥堵系数写法、酒店卡的平日 / 节假日参考价并列、携程与大众点评评分标注、门票首次检票与动线咬合的处理 |
| **北京 · 国庆 3 日游** | <https://zhshy.github.io/beijing-nationalday-guide/> | 境内（北京）· 城市游 | 城市密集动线的「一天一个主区域」排法与主动删点说明 |

每个实例的源码形态一致：独立仓库的 `main` 分支根部放 `index.html` + `{dest}-guide_files/` + `.nojekyll`。

| 成品 | 仓库 | 规模 |
|------|------|------|
| 埃及 13 天 | <https://github.com/zhshy/Egypt> | 7 模块 · 13 张逐日卡 · 55 张场馆卡 · 20 张本地图 |
| 乌兰布统 · 多伦 6 日 | <https://github.com/zhshy/Ulanbutong> | 7 模块 · 6 天行程 · 12 张本地图 |
| 北京 3 日游 | `zhshy/beijing-nationalday-guide` | 7 模块 · 3 天行程 · 8 张本地图 |

> ⚠️ 这三个实例是 **参考，不是模板**。照抄其中的目的地内容（餐厅名、酒店名、路线）会违反渲染规范里的
> 「no reference-destination copy」——请只借鉴版式、字段与语义标注的用法。

---

## 📁 项目结构

```
inChina-travel-guide-skill/
├── SKILL.md                 # Agent 核心规则（入口，含区域判断与 7 模块定义）
├── README.md                # 本文件
├── assets/
│   ├── intake-questionnaire/
│   │   └── index.html       # 用户问卷（含区域确认，无配色选择）
│   └── canonical/product/   # 视觉风格参考（仅供参考，不作渲染驱动）
├── scripts/
│   └── fetch_pexels_image.py # 取本地配图的 Pexels 脚本（读取 .pexels_key）
│   └── .pexels_key          # 本地私密 key（gitignore，不入库）
└── references/
    ├── first-use-intake.md          # 问卷/默认输入引导 + 四拍交互格式（Re-ground→Simplify→Recommend→Options）
    ├── trip-memory.md               # 跨行程记忆协议（预填规则、可存/禁存清单、更新规则）
    ├── research-data-shapes.md      # 7 大模块字段结构（含区域分支）
    ├── image-and-source-policy.md   # 图片与来源策略（Pexels 为主 + 事实核验来源）
    ├── itinerary-selection-logic.md # 行程与地点选择逻辑 + 主动删减原则
    ├── app-deeplink-nav.md          # 导航按钮 App 深链唤起（高德>百度>苹果 / Google>苹果）与降级
    ├── xhs-research.md              # 小红书口碑调研（可选增强，沙盒有 CDP 时启用）
    └── rendering-spec.md            # 单页 HTML 渲染规范（HTML + 本地图目录交付）
```

---

## 🔧 修改记录（相对于原版）

| 修改项 | 说明 |
|--------|------|
| ✅ 新增境内/境外自动判断 | 基于目的地城市/国家自动识别 |
| ✅ 数据源切换 | 百度地图 / 微信公众号 / 大众点评 (境内) |
| ✅ 删除语言锦囊模块 | 不再生成语言翻译内容 |
| ✅ 删除出发前准备模块 | 不再生成签证/打包清单 |
| ✅ 餐饮缩减为 2 类 | 仅保留「当地小吃」和「值得专程去」（后续已升级为 3 类，见下方「模块 4 升级为『餐饮住宿』」） |
| ✅ 删除配色选择 | 固定使用蓝/青绿主题 |
| ✅ 问卷界面优化 | 新增区域确认下拉菜单 |
| ✅ 清理原版渲染流水线 | 移除 34 个 Python 脚本 / agents 配置 / 冲突的 8 模块 references |
| ✅ 新增渲染规范 | `references/rendering-spec.md` 固化单页 HTML 结构与视觉契约 |
| ✅ canonical 定位为视觉参考 | 仅作观感参考，不驱动任何脚本，不复制其 Bali 内容与 8 章结构 |
| ✅ **新增 Pexels 本地配图通道** | `scripts/fetch_pexels_image.py` 下载景点图到本地 `_guide_files/`，保证每次生成都带图 |
| ✅ **交付改为 HTML + 本地图目录** | 放宽“单文件”约束，配图 100% 本地可显示、不裂图 |
| ✅ **Image rule 可执行化** | rendering-spec §5.1 从“要求有图”升级为“先跑取图脚本→下载→本地引用→兜底”的完整流程 |
| ✅ **新增第 7 模块（未安排的景点清单）** | 每天行程 30 km 内未排入的景点，附图；勾选后生成可复制、AI 可识别的“编辑行程”文字 |
| ✅ **配图降级** | “必须配图”→尽量配图，取不到可整洁无图（见“注意事项”） |
| ✅ **7 模块重排** | 顺序改为 行程→景点→体验→餐饮住宿→购物→当地贴士→未安排清单（Shopping 与 Experiences/Dining 换位） |
| ✅ **新增跨行程记忆** | `references/trip-memory.md` + `~/.inchina-travel-guide/MEMORY.md`：生成后沉淀长期偏好，复用自动预填，敏感信息禁存 |
| ✅ **四拍交互格式** | 所有追问统一 Re-ground→Simplify→Recommend→Options 节奏，附反模式表与 Smart skip 原则（见 first-use-intake.md） |
| ✅ **主动删减原则** | 行程装不下时替用户删点并明说"删了什么、为什么删"，交付时输出删减说明（见 itinerary-selection-logic.md） |
| ✅ **导航按钮 App 深链唤起** | 卡片级「导航」按钮：境内 高德>百度>苹果原生、境外 Google>苹果原生优先唤起 App，未安装自动回落；WebView/桌面/无坐标三级降级（见 app-deeplink-nav.md） |
| ✅ **统一语义标注系统** | 修复页面一致性：时间/价格/地点/链接/警示各有专用色与固定形式，同类信息全页同色同形式；强调三档 + ≤3 处底色高亮；禁止表格与卡片混用、横竖混排（rendering-spec §2.1） |
| ✅ **模块 4 升级为「餐饮住宿」** | 新增「住宿推荐」子类（当地小吃 / 值得专程去 / 住宿推荐），7 模块编号不变；餐饮与住宿**必须给出具体名称**，"只给片区"不合格（范围属于行程模块） |
| ✅ **行程与模块 4 分工** | 行程模块的餐食与住宿只写「范围」（顺路的一片区域 / 地铁站一带），具体店名与酒店名放模块 4，让动线先服从地理而不是服从某家店 |
| ✅ **住宿取值口径** | 境内从携程选高分酒店（默认 ≥4.5，优先 4.7+ 且有足量点评数），境外查 Google Maps（默认 ≥4.3）；优先一城一个住宿基地，半天不浪费在搬酒店上 |
| ✅ **节假日价格语境** | 境内节假日窗口内，酒店卡同时标出**平日参考价**与**节假日参考价**，把涨幅摆给用户自己判断；不设"溢价过高"的硬阈值，标注"以平台实时价格为准" |
| ✅ **新增「已发布的成品实例」** | README 与 SKILL.md 各增一节，收录埃及 13 天、乌兰布统·多伦 6 日、北京 3 日游三个上线实例的**可访问链接**，供生成前对照版式与结构（同时注明「参考非模板」，禁止照抄目的地内容） |

---

## 🛠️ 技术依赖

- 本 Skill 为 AI Agent 指令集，兼容任何支持 Skill/技能包调用的 AI 平台（如 WorkBuddy、Claude、GPT 等）。
- 使用方式是让 AI 加载 `SKILL.md`，再按需读取 `references/` 下的规范；无需任何运行时、依赖或构建
  （配图脚本为可选辅助，纯 Python 标准库）。
- 前端问卷（`assets/intake-questionnaire/index.html`）为纯静态 HTML + CSS + JavaScript，可本地双击打开或部署到任意静态托管。
- 评分、开放时间与地图链接由 AI 在生成期间通过联网检索获取，并按境内/境外自动切换事实来源；
  配图通过 Pexels 脚本下载到本地 `{城市}-guide_files/`。
- 产出为**一个 HTML + 同级本地图片目录**，可离线用浏览器打开（两者需一起分发）。

---

## 📝 注意事项

- 所有地点卡片**必须**包含精确的位置链接（百度地图或 Google Maps）
- 每个**景点卡尽量配一张本地图**（经 Pexels 脚本下载，见上“配图”小节）
- 配图**非硬性底线**：取不到贴切图时可整洁无图，不硬塞不相关图、不放会裂的远程图
- 餐厅评分**必须**标注来源（大众点评或 Google）；境内酒店标**携程**评分，境外酒店标 **Google** 评分
- 境内景点优先搜索**微信公众号**作为官方信息来源
- 境外景点优先搜索**官方网站**作为官方信息来源
- 餐饮住宿模块**严格限制**为三类，不得生成其他餐饮/住宿推荐；也不做预订入口
- 模块 4 的餐厅与酒店**必须给出具体名称**（可在平台搜到）；核不到具名门店时才可降级为方向性推荐并在卡片标明
- 行程模块的餐食与住宿**只写范围**（顺路片区 / 地铁站一带），不把具体店名搬进去
- 第 7 模块（未安排的景点清单）：仅收录每天行程 30 km 内的未排入景点；勾选后生成的文字须
  自包含、可直接粘回任意 AI 重新生成

---

## 📄 许可证

本 Skill 基于原项目修改，遵循原项目的许可证条款。

---

## 🙏 致谢

- 原项目：[personalized-travel-guide-skill](https://github.com/TokenHungryMash/personalized-travel-guide-skill)
- 所有贡献者和使用者
