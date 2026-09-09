# 🧳 China Travel Guide Skill

一个基于 AI 的智能旅行手册生成器，专为**中国境内旅行**深度优化，同时完美支持境外目的地。

本 Skill 是 [personalized-travel-guide-skill](https://github.com/TokenHungryMash/personalized-travel-guide-skill) 的增强分支，针对中国旅行场景进行了全面改造。

---

## ✨ 主要特性

### 🗺️ 智能区域识别（核心升级）
- **自动判断**目的地在中国境内还是境外
- **境内**：自动切换至百度地图、微信公众号、大众点评评分
- **境外**：使用 Google Maps、官方网站、Google 评分
- 用户也可在问卷中手动修正区域判断

### 📦 精简的 6 大模块
相比原版的 8 大模块，移除了冗余内容，聚焦核心旅行信息：

| # | 模块 | 说明 |
|---|------|------|
| 1 | 行程 (Itinerary) | 每日时间线安排 |
| 2 | 景点 (Attractions) | 必去景点 + 小众宝藏 |
| 3 | 购物 (Shopping) | 购物区 + 特色伴手礼 |
| 4 | 体验 (Experiences) | 文化体验 / 特色活动 |
| 5 | 餐饮 (Dining) | **仅两类**：当地小吃 + 值得专程去的餐厅 |
| 6 | 当地贴士 (Local Tips) | 交通、文化、安全等实用信息 |

**已移除模块**：~~语言锦囊~~ · ~~出发前准备~~

### 🍜 餐饮指南全新定位
- **当地小吃推荐**：夜市、早餐摊、传统小吃，附带价格和地标
- **值得专程去**：有招牌特色菜的本地名店，附带专程前往的理由
- **不再包含**：高端餐厅、咖啡馆、酒吧、连锁快餐

### 🎨 固定配色方案
- 统一使用蓝/青绿色系，无需用户选择，开箱即用

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

## 📁 项目结构

```
inChina-travel-guide-skill/
├── SKILL.md                 # Agent 核心规则（入口，含区域判断与 6 模块定义）
├── README.md                # 本文件
├── assets/
│   ├── intake-questionnaire/
│   │   └── index.html       # 用户问卷（含区域确认，无配色选择）
│   └── canonical/product/   # 视觉风格参考（仅供参考，不作渲染驱动）
├── scripts/
│   └── fetch_pexels_image.py # 取本地配图的 Pexels 脚本（读取 .pexels_key）
│   └── .pexels_key          # 本地私密 key（gitignore，不入库）
└── references/
    ├── first-use-intake.md          # 问卷/默认输入引导
    ├── research-data-shapes.md      # 6 大模块字段结构（含区域分支）
    ├── image-and-source-policy.md   # 图片与来源策略（Pexels 为主 + 事实核验来源）
    ├── itinerary-selection-logic.md # 行程与地点选择逻辑
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
| ✅ 餐饮缩减为 2 类 | 仅保留「当地小吃」和「值得专程去」 |
| ✅ 删除配色选择 | 固定使用蓝/青绿主题 |
| ✅ 问卷界面优化 | 新增区域确认下拉菜单 |
| ✅ 清理原版渲染流水线 | 移除 34 个 Python 脚本 / agents 配置 / 冲突的 8 模块 references |
| ✅ 新增渲染规范 | `references/rendering-spec.md` 固化单页 HTML 结构与视觉契约 |
| ✅ canonical 定位为视觉参考 | 仅作观感参考，不驱动任何脚本，不复制其 Bali 内容与 8 章结构 |
| ✅ **新增 Pexels 本地配图通道** | `scripts/fetch_pexels_image.py` 下载景点图到本地 `_guide_files/`，保证每次生成都带图 |
| ✅ **交付改为 HTML + 本地图目录** | 放宽“单文件”约束，配图 100% 本地可显示、不裂图 |
| ✅ **Image rule 可执行化** | rendering-spec §5.1 从“要求有图”升级为“先跑取图脚本→下载→本地引用→兜底”的完整流程 |

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
- 餐厅评分**必须**标注来源（大众点评或 Google）
- 境内景点优先搜索**微信公众号**作为官方信息来源
- 境外景点优先搜索**官方网站**作为官方信息来源
- 餐饮模块**严格限制**为两类，不得生成其他餐饮推荐

---

## 📄 许可证

本 Skill 基于原项目修改，遵循原项目的许可证条款。

---

## 🙏 致谢

- 原项目：[personalized-travel-guide-skill](https://github.com/TokenHungryMash/personalized-travel-guide-skill)
- 所有贡献者和使用者
