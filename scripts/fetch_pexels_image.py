#!/usr/bin/env python3
"""
fetch_pexels_image.py — 为旅行手册按地点取本地配图（Pexels 免费 API）。

为什么存在
----------
SKILL 要求"每次生成都带真实图片"。本脚本给 agent 一条在生成环境里真能执行、
结果 100% 本地可显示的取图路径（下载到 {city}-guide_files/，HTML 用相对路径引用）。

用法
----
# 1) 先配置 key（任选其一，见下方 "Key 配置"）：
#    export PEXELS_API_KEY=你的key          # 或用 shell 环境变量

# 2) 单个地点：
python fetch_pexels_image.py "成都大熊猫繁育研究基地" "giant panda bamboo china" \
    --out ../chengdu-guide_files --filename panda-base.jpg

# 3) 批量（CSV：地点中文名,英文搜索词,输出文件名）：
python fetch_pexels_image.py --batch plan.csv --out ../chengdu-guide_files

# 4) 只看候选不下载（挑选用）：
python fetch_pexels_image.py "武侯祠" "chinese ancient temple" --preview-only

Key 配置（三选一，优先级从高到低）
  1. 环境变量 PEXELS_API_KEY
  2. scripts/.pexels_key 文件（首行即 key，已 gitignore）
  3. 脚本内 DEFAULT_KEY（仅当愿意把 key 放进代码时）

授权说明
--------
Pexels License（等价 CC0 风格）：可商用、可修改、无需署名。返回的图内容为"按关键词
匹配的主题图"，不一定是该地点精确实拍的招牌照 —— agent 应靠返回的 alt + 常识判断
是否贴切，必要时换关键词重试或换用 --preview-only 对比多张。

输出：每张候选打印 `ID | alt 描述`，并把选中的图保存为本地 JPEG。
"""
import argparse, csv, json, os, re, sys, urllib.parse, urllib.request

PEXELS_SEARCH = "https://api.pexels.com/v1/search"
PEXELS_IMG = "https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
# 可选默认 key（不推荐硬编码；优先环境变量 / .pexels_key 文件）
DEFAULT_KEY = ""


def _slug(s):
    s = re.sub(r"[^\w\u4e00-\u9fff]+", "-", s.strip()).strip("-").lower()
    return s or "img"


def load_key():
    key = os.environ.get("PEXELS_API_KEY", "").strip()
    if not key:
        here = os.path.dirname(os.path.abspath(__file__))
        p = os.path.join(here, ".pexels_key")
        if os.path.exists(p):
            with open(p) as f:
                key = f.read().strip()
    return key or DEFAULT_KEY


def _req(url, headers=None, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def search(key, query, per=4):
    q = urllib.parse.urlencode({"query": query, "per_page": per})
    raw = _req(PEXELS_SEARCH + "?" + q, {"Authorization": key})
    d = json.loads(raw)
    out = []
    for p in d.get("photos", []):
        out.append({"id": p["id"], "alt": (p.get("alt") or "").strip(),
                    "url": p["src"].get("large2x") or p["src"].get("large") or p["src"].get("original")})
    return out


def download(key, photo_id, dest_path, width=900):
    url = PEXELS_IMG.format(id=photo_id) + f"?auto=compress&cs=tinysrgb&w={width}"
    blob = _req(url)  # images.pexels.com 无 Referer 防盗链
    with open(dest_path, "wb") as f:
        f.write(blob)
    return os.path.getsize(dest_path)


def process_one(key, place, query, out_dir, filename=None, preview_only=False,
                auto_pick="top"):
    hits = search(key, query)
    if not hits:
        print(f"[{place}] 无结果：{query}")
        return None
    print(f"[{place}] 搜索词：{query}  →  {len(hits)} 个候选：")
    for i, h in enumerate(hits):
        mark = "  <-- 默认取此张" if i == 0 else ""
        print(f"   #{i}  id={h['id']}  alt: {h['alt'][:90]}{mark}")
    if preview_only:
        return None
    # 选中：默认第 0（top）。调用方可传 auto_pick=数字 指定。
    idx = 0
    if str(auto_pick).isdigit():
        idx = int(auto_pick)
    idx = max(0, min(idx, len(hits) - 1))
    chosen = hits[idx]
    os.makedirs(out_dir, exist_ok=True)
    fname = filename or (_slug(place) + ".jpg")
    dest = os.path.join(out_dir, fname)
    try:
        size = download(key, chosen["id"], dest)
        print(f"   已下载 #{idx} → {dest}  ({size}B)")
        print(f"   alt 建议：{chosen['alt'][:120]}")
        print(f"   卡片引用：src=\"{os.path.basename(os.path.normpath(out_dir))}/{fname}\"")
        # 相对路径规则：HTML 与图目录 {city}-guide_files 同级，图内 src="{图目录}/{fname}"
        return {"place": place, "file": fname, "path": dest, "size": size,
                "alt": chosen["alt"], "id": chosen["id"]}
    except Exception as e:
        print(f"   下载失败 {place}: {e}")
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("place", nargs="?", help="地点中文名（用于日志/文件名）")
    ap.add_argument("query", nargs="?", help="英文搜索关键词（建议 3–5 个词，最能命中主题）")
    ap.add_argument("--out", default=".", help="图片输出目录（如 {city}-guide_files）")
    ap.add_argument("--filename", default=None, help="保存的文件名（默认取地点 slug）")
    ap.add_argument("--batch", default=None, help="CSV：place,query[,filename] 每行一个地点")
    ap.add_argument("--preview-only", action="store_true", help="只列候选，不下载")
    ap.add_argument("--pick", default="top", help="选第几张（0-based），默认 top")
    ap.add_argument("--per", type=int, default=4, help="每地点候选数")
    a = ap.parse_args()

    key = load_key()
    if not key:
        print("未找到 Pexels key。请 export PEXELS_API_KEY=... 或在 scripts/.pexels_key 写一行。",
              file=sys.stderr)
        sys.exit(2)

    if a.batch:
        os.makedirs(a.out, exist_ok=True)
        with open(a.batch, newline="", encoding="utf-8") as f:
            for row in csv.reader(f):
                row = [c.strip() for c in row if c.strip()]
                if not row:
                    continue
                place, query = row[0], row[1]
                fname = row[2] if len(row) > 2 else None
                process_one(key, place, query, a.out, filename=fname,
                            preview_only=a.preview_only, auto_pick=a.pick)
    else:
        if not a.query:
            ap.error("需要 query（英文关键词）或 --batch")
        process_one(key, a.place or "", a.query, a.out, filename=a.filename,
                    preview_only=a.preview_only, auto_pick=a.pick)


if __name__ == "__main__":
    main()
