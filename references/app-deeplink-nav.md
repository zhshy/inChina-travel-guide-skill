# App deep-link navigation (导航按钮 · App 唤起与降级)

Defines the **导航 button** rendered on venue cards: it opens the venue in a native map app
when one is installed, with a region-aware priority chain, and degrades gracefully when it is
not. This is a behavior contract plus a copy-paste inline-JS module — no dependencies, no
external script.

## UX contract

Every venue card (景点 / 体验 / 餐饮 / 购物区 / 未安排清单) carries a **「导航」button** next to
its existing map web link. Tapping it, in order:

1. **Region-aware priority chain** — try each provider in order; the first one that opens wins:
   - `region = domestic`（境内）: **高德地图 → 百度地图 → 苹果地图**
   - `region = international`（境外，含港澳台）: **Google 地图 → 苹果地图**
2. **All-fail fallback** — if no provider's app opens, fall back to the web version of the
   chain's first provider (高德 web / Google web).
3. **No coordinates fallback** — if the venue has no collected coordinates, the button opens the
   card's existing map web link (百度/Google) directly.

## How "installed or not" actually works (honest limitation)

**Web JS cannot query which apps are installed.** The practical pattern is: attempt the
provider's URL scheme via `location.href`, then watch for the page being hidden within a short
timeout — if the page is still visible after ~1.8 s, the app did not open, so try the next
provider. Known caveats, stated up front:

- On iOS Safari, an unregistered scheme may briefly show a "无法打开页面" system alert before the
  timeout resolves; tap through and the chain continues. (If a product wants zero alerts, render
  a small provider chooser instead — optional variant, not the default.)
- The **苹果地图 entry needs no scheme**: `https://maps.apple.com/?…` opens the native Maps app
  on iOS/macOS and the web version elsewhere, so it doubles as the always-works terminal entry.
  On Android the Apple entry gracefully degrades to its web version.

## Environment branches (before any scheme attempt)

- **In-app WebView** (微信 / 抖音 / 小红书 / 微博 / QQ / 钉钉 / 飞书 / UC / 百度 App / 头条 …):
  custom schemes are intercepted or blocked — **skip the chain entirely**, open the first
  provider's **web** URL (`window.open`). 高德 web (`uri.amap.com`) will itself offer to open the
  app where the WebView allows it.
- **Desktop** (no mobile UA): skip the chain, open the first provider's web URL in a new tab.
- **Mobile browser**: run the chain as described above.

WebView detection (UA regex, proven pattern):

```js
const IN_WEBVIEW = /micromessenger|xhs|xhsdiscover|discover\/|tiktok|aweme|weibo|qq\/|qqbrowser|alipayclient|dingtalk|lark|feishu|ucbrowser|baiduboxapp|toutiao|newsarticle/i.test(navigator.userAgent || '');
```

## Coordinates (collected during research)

Deep links need `lat,lng` per venue, in the coordinate system of the region:

| Region | Store as | Used by |
|--------|----------|---------|
| domestic | **GCJ-02**（火星坐标） | 高德 `dev=0`；百度 `coord_type=gcj02`；苹果(中国底图为 GCJ 对齐) |
| international | **WGS-84** | Google；苹果 |

- Collect coords while researching the venue's map link (Baidu/Amap POI pages and their share
  URLs expose coordinates). Tag the field `sys: "gcj02" | "wgs84"` — see
  `research-data-shapes.md` → Coordinates field.
- If the only source is a Baidu link (BD-09), convert with the snippet below. If the source is
  WGS-84 (rare for domestic), convert with `wgs2gcj`.

Converters (well-known algorithms, inline both when needed):

```js
function bd2gcj(lat, lng) { // BD-09 → GCJ-02, returns [lat, lng]
  const x = lng - 0.0065, y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * Math.PI * 3000 / 180);
  const t = Math.atan2(y, x) - 0.000003 * Math.cos(y * Math.PI * 3000 / 180);
  return [z * Math.sin(t), z * Math.cos(t)];
}
function wgs2gcj(lat, lng) { // WGS-84 → GCJ-02, returns [lat, lng]; identity outside China
  const a = 6378245.0, ee = 0.00669342162296594323;
  function tLat(x, y) { let r = -100 + 2*x + 3*y + 0.2*y*y + 0.1*x*y + 0.2*Math.sqrt(Math.abs(x));
    r += (20*Math.sin(6*x*Math.PI) + 20*Math.sin(2*x*Math.PI)) * 2/3;
    r += (20*Math.sin(y*Math.PI) + 40*Math.sin(y/3*Math.PI)) * 2/3;
    r += (160*Math.sin(y/12*Math.PI) + 320*Math.sin(y*Math.PI/30)) * 2/3; return r; }
  function tLng(x, y) { let r = 300 + x + 2*y + 0.1*x*x + 0.1*x*y + 0.1*Math.sqrt(Math.abs(x));
    r += (20*Math.sin(6*x*Math.PI) + 20*Math.sin(2*x*Math.PI)) * 2/3;
    r += (20*Math.sin(x*Math.PI) + 40*Math.sin(x/3*Math.PI)) * 2/3;
    r += (150*Math.sin(x/12*Math.PI) + 300*Math.sin(x/30*Math.PI)) * 2/3; return r; }
  if (lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271) return [lat, lng];
  let dLat = tLat(lng - 105, lat - 35), dLng = tLng(lng - 105, lat - 35);
  const radLat = lat / 180 * Math.PI; let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic; const sq = Math.sqrt(magic);
  dLat = (dLat * 180) / ((a * (1 - ee)) / (magic * sq) * Math.PI);
  dLng = (dLng * 180) / (a / sq * Math.cos(radLat) * Math.PI);
  return [lat + dLat, lng + dLng];
}
```

## Provider URL formats (verified)

| Provider | Native app URL (scheme) | Web URL |
|----------|--------------------------|---------|
| 高德 | `iosamap://viewMap?sourceApplication=&poiname=&lat=&lon=&dev=0` (iOS)；`androidamap://viewMap?…` (Android) | `https://uri.amap.com/marker?position=<lng>,<lat>&name=&src=&coordinate=gcj02&callnative=0` |
| 百度 | `baidumap://map/marker?location=<lat>,<lng>&coord_type=gcj02&title=&content=&src=` | `https://api.map.baidu.com/marker?location=<lat>,<lng>&coord_type=gcj02&title=&content=&output=html&src=` |
| Google | `comgooglemaps://?q=<query>` | `https://www.google.com/maps/search/?api=1&query=<query>` |
| 苹果 | (none needed) | `https://maps.apple.com/?q=<name>&ll=<lat>,<lng>` — opens native Maps on iOS/macOS |

Sources: 高德开放平台「移动端 API」入门指南（`iosamap` / `androidamap` scheme 与
`uri.amap.com` URI API）；百度地图 URI API（`baidumap://map/...`，`coord_type` 支持
gcj02）；Google Maps URL / iOS URL Scheme 文档；Apple Maps Links（`maps.apple.com`）。
`dev=0` 表示传入坐标已是加密（GCJ-02）坐标。生成时请对 name/query 做 `encodeURIComponent`。

## Copy-paste inline module

Inline this **once** at the end of `<body>` (inside the page's single `<script>`), with
`NAV_REGION` hard-coded per guide. Render each card's 导航 button as:

```html
<button class="nav-btn"
  onclick="openVenueNav('景点名', <gcj02-or-wgs84 lat>, <lng>, '备用网页地图链接')">导航</button>
```

```js
// ── 导航深链模块（整段内联，无依赖）──────────────────────────
var NAV_REGION = 'domestic';            // 'domestic' | 'international'（生成时写死）
var NAV_UA = (navigator.userAgent || '').toLowerCase();
var NAV_IN_WEBVIEW = /micromessenger|xhs|xhsdiscover|discover\/|tiktok|aweme|weibo|qq\/|qqbrowser|alipayclient|dingtalk|lark|feishu|ucbrowser|baiduboxapp|toutiao|newsarticle/.test(NAV_UA);
var NAV_IS_IOS = /ipad|iphone|ipod/.test(NAV_UA);
var NAV_IS_MOBILE = /android|iphone|ipad|ipod|mobile/.test(NAV_UA);

function navAmapApp(n, la, ln) { return (NAV_IS_IOS ? 'iosamap:' : 'androidamap:')
  + '//viewMap?sourceApplication=travelguide&poiname=' + encodeURIComponent(n)
  + '&lat=' + la + '&lon=' + ln + '&dev=0'; }
function navAmapWeb(n, la, ln) { return 'https://uri.amap.com/marker?position=' + ln + ',' + la
  + '&name=' + encodeURIComponent(n) + '&src=travelguide&coordinate=gcj02&callnative=0'; }
function navBaiduApp(n, la, ln) { return 'baidumap://map/marker?location=' + la + ',' + ln
  + '&coord_type=gcj02&title=' + encodeURIComponent(n) + '&content=' + encodeURIComponent(n)
  + '&src=travelguide'; }
function navBaiduWeb(n, la, ln) { return 'https://api.map.baidu.com/marker?location=' + la + ',' + ln
  + '&coord_type=gcj02&title=' + encodeURIComponent(n) + '&content=' + encodeURIComponent(n)
  + '&output=html&src=travelguide'; }
function navApple(n, la, ln) { return 'https://maps.apple.com/?q=' + encodeURIComponent(n)
  + '&ll=' + la + ',' + ln; }
function navGoogleApp(n) { return 'comgooglemaps://?q=' + encodeURIComponent(n); }
function navGoogleWeb(n) { return 'https://www.google.com/maps/search/?api=1&query='
  + encodeURIComponent(n); }

var NAV_PROVIDERS = {
  amap:   { label: '高德地图',   app: navAmapApp,  web: navAmapWeb },
  baidu:  { label: '百度地图',   app: navBaiduApp, web: navBaiduWeb },
  google: { label: 'Google 地图', app: function (n) { return navGoogleApp(n); },
            web: function (n) { return navGoogleWeb(n); } },
  apple:  { label: '苹果地图',   app: null,        web: navApple }
};
var NAV_CHAIN = NAV_REGION === 'domestic' ? ['amap', 'baidu', 'apple'] : ['google', 'apple'];

function navTryScheme(url, timeout) { // 返回 Promise<boolean>：页面被隐藏 = App 已打开
  return new Promise(function (resolve) {
    var settled = false;
    function onHide() { if (!settled) { settled = true; cleanup(); resolve(true); } }
    function cleanup() {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
    }
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    window.location.href = url;                 // 必须在用户点击的同步调用栈里触发
    setTimeout(function () { if (!settled) { settled = true; cleanup(); resolve(false); } },
      timeout || 1800);
  });
}

function openVenueNav(name, lat, lng, webLink) {
  if (!lat || !lng) { window.open(webLink || navApple(name, 0, 0)); return; }   // 无坐标兜底
  var first = NAV_PROVIDERS[NAV_CHAIN[0]];
  if (NAV_IN_WEBVIEW || !NAV_IS_MOBILE) {       // WebView / 桌面：直接走链首网页版
    window.open(first.web(name, lat, lng));
    return;
  }
  (function step(i) {
    if (i >= NAV_CHAIN.length) { window.open(first.web(name, lat, lng)); return; } // 全败兜底
    var p = NAV_PROVIDERS[NAV_CHAIN[i]];
    if (!p.app) { window.open(p.web(name, lat, lng)); return; }   // 苹果：https 直开，必成
    navTryScheme(p.app(name, lat, lng)).then(function (opened) {
      if (!opened) step(i + 1);
    });
  })(0);
}
// ── 导航深链模块结束 ──────────────────────────────────────────
```

Notes for the agent:

- `NAV_REGION`, provider labels and the chain order are the only region-dependent parts —
  hard-code them per guide; do not branch at runtime on anything else.
- 高德/百度 web URLs take `(name, lat, lng)`; Google's take the name only. The snippet above
  already normalizes the signatures.
- Call `window.location.href` only inside the button's synchronous click handler (mobile
  browsers require the user gesture for scheme navigation).
- `callnative=0` keeps the 高德 web page quiet; switch to `callnative=1` if you prefer the page
  to actively offer opening the 高德 app.

## Definition of done (per guide)

- Every venue card has a working 导航 button with `lat,lng` (tagged coord sys) or an explicit
  web-link fallback.
- Chain order matches the region (高德>百度>苹果 / Google>苹果).
- Tested once on desktop (opens web URL) — device-app behavior is inferred from the documented
  schemes, mark it as such when describing the feature to the user.
