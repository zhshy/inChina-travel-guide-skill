/* 问卷回归测试：验证「填写 → 提交 → 生成提示词 → 复制 → 关闭」全链路。
 *
 * 用法：node scripts/test-intake-questionnaire.js assets/intake-questionnaire/index.html
 * 依赖：无（纯 Node，自建最小 DOM 桩）
 *
 * 为什么不用 jsdom：部分受限环境在 require('jsdom') 阶段即被系统 kill。
 * 本脚本以最小 DOM 桩执行页面里的真实 <script>（原样提取，不做任何改写），
 * 覆盖 33 条断言：弹窗开关、提示词内容、摘要 chips、剪贴板成功/降级/失败三条路径、
 * Esc 与遮罩关闭、必填校验与错误态清除。
 */
const fs = require('fs');
const vm = require('vm');

const FILE = process.argv[2];
const html = fs.readFileSync(FILE, 'utf8');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  \x1b[32mPASS\x1b[0m  ' + name); }
  else { fail++; console.log('  \x1b[31mFAIL\x1b[0m  ' + name + (extra ? '  -> ' + extra : '')); }
}

/* ---------------- 最小 DOM ---------------- */
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);

class Ev {
  constructor(type, opts) {
    opts = opts || {};
    this.type = type;
    this.bubbles = !!opts.bubbles;
    this.cancelable = !!opts.cancelable;
    this.defaultPrevented = false;
    this.target = null;
  }
  preventDefault() { this.defaultPrevented = true; }
  stopPropagation() {}
}

class ClassList {
  constructor(el) { this.el = el; }
  _set() { return new Set((this.el.className || '').split(/\s+/).filter(Boolean)); }
  _write(s) { this.el.className = Array.from(s).join(' '); }
  add(c) { const s = this._set(); s.add(c); this._write(s); }
  remove(c) { const s = this._set(); s.delete(c); this._write(s); }
  contains(c) { return this._set().has(c); }
  toggle(c, force) {
    const s = this._set();
    const want = force === undefined ? !s.has(c) : !!force;
    if (want) s.add(c); else s.delete(c);
    this._write(s);
    return want;
  }
}

class El {
  constructor(tag) {
    this.tagName = tag;
    this.attrs = {};
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.value = '';
    this.checked = false;
    this._text = '';
    this._listeners = {};
    this.classList = new ClassList(this);
  }
  get id() { return this.attrs.id || ''; }
  get className() { return this._cn || ''; }
  set className(v) { this._cn = v; }
  get textContent() {
    if (this.children.length === 0) return this._text;
    return this.children.map(c => c._text !== undefined && c.children
      ? c._text + c.children.map(x => x.textContent).join('')
      : String(c.textContent)).join('');
  }
  set textContent(v) { this.children = []; this._text = String(v); }
  set innerHTML(v) { if (v === '') { this.children = []; this._text = ''; } }
  get innerHTML() { return ''; }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  addEventListener(t, fn) { (this._listeners[t] = this._listeners[t] || []).push(fn); }
  dispatchEvent(e) {
    e.target = e.target || this;
    const run = (node) => {
      (node._listeners[e.type] || []).forEach(fn => fn.call(node, e));
    };
    run(this);
    if (e.bubbles) {
      let p = this.parentNode;
      while (p) { run(p); p = p.parentNode; }
      if (document._listeners[e.type]) {
        e.target = this;
        document._listeners[e.type].forEach(fn => fn.call(document, e));
      }
    }
    return !e.defaultPrevented;
  }
  focus() { document.activeElement = this; }
  blur() { if (document.activeElement === this) document.activeElement = null; }
  select() {}
  setSelectionRange() {}
  _descendants(out) {
    for (const c of this.children) { out.push(c); c._descendants(out); }
    return out;
  }
  querySelectorAll(sel) {
    const all = this._descendants([]);
    const sels = sel.split(',').map(s => s.trim()).filter(Boolean);
    return all.filter(el => sels.some(s => matchesSelector(el, s)));
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}

function matchSimple(el, s) {
  s = s.trim();
  let checked = false;
  if (s.endsWith(':checked')) { checked = true; s = s.slice(0, -8); }
  let type = null;
  const tm = s.match(/\[type\s*=\s*"?([^"\]]+)"?\]/);
  if (tm) { type = tm[1]; s = s.replace(tm[0], ''); }
  let id = null;
  const im = s.match(/#([A-Za-z0-9_\-]+)/);
  if (im) { id = im[1]; s = s.replace(im[0], ''); }
  const classes = [];
  s = s.replace(/\.([A-Za-z0-9_\-]+)/g, (_, c) => { classes.push(c); return ''; });
  const tag = s.trim().toLowerCase();
  if (tag && el.tagName.toLowerCase() !== tag) return false;
  if (id && el.id !== id) return false;
  if (classes.some(c => !el.classList.contains(c))) return false;
  if (type && (el.attrs.type || '') !== type) return false;
  if (checked && el.checked !== true) return false;
  return true;
}

function matchesSelector(el, sel) {
  const parts = sel.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return false;
  if (!matchSimple(el, parts[parts.length - 1])) return false;
  let node = el.parentNode;
  for (let k = parts.length - 2; k >= 0; k--) {
    let found = false;
    while (node) {
      if (matchSimple(node, parts[k])) { found = true; node = node.parentNode; break; }
      node = node.parentNode;
    }
    if (!found) return false;
  }
  return true;
}

/* ---------------- 解析 HTML ---------------- */
function parseAttrs(str) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*"([^"]*)")?/g;
  let m;
  while ((m = re.exec(str))) attrs[m[1].toLowerCase()] = m[2] === undefined ? '' : m[2];
  return attrs;
}

function buildTree(src) {
  const root = new El('#root');
  const stack = [root];
  let i = 0;
  const clean = src
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  while (i < clean.length) {
    const lt = clean.indexOf('<', i);
    if (lt === -1) break;
    if (lt > i) {
      const text = clean.slice(i, lt);
      if (text.trim()) stack[stack.length - 1]._text += text.replace(/\s+/g, ' ').trim();
    }
    const gt = clean.indexOf('>', lt);
    if (gt === -1) break;
    const raw = clean.slice(lt + 1, gt).trim();
    i = gt + 1;
    if (!raw || raw.startsWith('!') || raw.startsWith('?')) continue;
    if (raw.startsWith('/')) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const selfClose = raw.endsWith('/');
    const body = selfClose ? raw.slice(0, -1).trim() : raw;
    const sp = body.search(/\s/);
    const tag = (sp === -1 ? body : body.slice(0, sp)).toLowerCase();
    const attrStr = sp === -1 ? '' : body.slice(sp + 1);
    const el = new El(tag);
    el.attrs = parseAttrs(attrStr);
    if (el.attrs.class !== undefined) el.className = el.attrs.class;
    if (el.attrs.value !== undefined) el.value = el.attrs.value;
    if (el.attrs.type === 'checkbox' || el.attrs.type === 'radio') el.checked = 'checked' in el.attrs;
    stack[stack.length - 1].appendChild(el);
    if (!selfClose && !VOID.has(tag)) stack.push(el);
  }
  return root;
}

/* ---------------- document ---------------- */
function makeDocument(root) {
  const find = (node, id) => {
    if (node.id === id) return node;
    for (const c of node.children) { const r = find(c, id); if (r) return r; }
    return null;
  };
  const byTag = (node, tag) => {
    if (node.tagName === tag) return node;
    for (const c of node.children) { const r = byTag(c, tag); if (r) return r; }
    return null;
  };
  const doc = {
    _listeners: {},
    activeElement: null,
    documentElement: root,
    body: null,
    head: null,
    getElementById(id) { return find(root, id); },
    createElement(tag) { return new El(tag); },
    querySelectorAll(sel) { return root.querySelectorAll(sel); },
    querySelector(sel) { return root.querySelector(sel); },
    addEventListener(t, fn) { (this._listeners[t] = this._listeners[t] || []).push(fn); },
    dispatchEvent(e) {
      e.target = e.target || this;
      (this._listeners[e.type] || []).forEach(fn => fn.call(this, e));
      return !e.defaultPrevented;
    },
    execCommand() { return sandbox.__execCommandReturns; },
  };
  doc.body = byTag(root, 'body');
  doc.head = byTag(root, 'head');
  return doc;
}

const tree = buildTree(html);
let document = makeDocument(tree);

/* ---------------- 沙箱 ---------------- */
let copied = null;
const sandbox = {
  document,
  window: null,
  navigator: { clipboard: { writeText(t) { copied = t; return Promise.resolve(); } } },
  localStorage: { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; } },
  console: { log() {}, warn() {}, error() {} },
  setTimeout, clearTimeout, setInterval, clearInterval,
  URLSearchParams,
  Event: Ev, MouseEvent: Ev, KeyboardEvent: Ev,
  parseInt, parseFloat, isNaN, JSON, Math, Date, Array, Object, String, Number, Boolean, RegExp, Error,
  __execCommandReturns: true,
};
sandbox.window = sandbox;
vm.createContext(sandbox);

/* ---------------- 执行页面真实脚本 ---------------- */
const scripts = html.match(/<script>([\s\S]*?)<\/script>/gi) || [];
if (scripts.length !== 1) { console.log('提取到 ' + scripts.length + ' 个 script 块，预期 1'); process.exit(2); }
const code = scripts[0].replace(/^<script>/i, '').replace(/<\/script>$/i, '');
vm.runInContext(code, sandbox, { filename: 'questionnaire-inline.js' });
console.log('（页面脚本已在 DOM 桩中执行，未作修改）\n');

const doc = sandbox.document;
const modal = doc.getElementById('resultModal');
const box = doc.getElementById('promptBox');
const copyBtn = doc.getElementById('copyBtn');
const form = doc.getElementById('travelForm');

/* ---------------- 断言 ---------------- */
console.log('[1] 提交前');
ok('弹窗初始关闭', !modal.classList.contains('open'));

console.log('\n[2] 填表并提交');
doc.getElementById('destination').value = '成都';
doc.getElementById('days').value = '4';
doc.getElementById('travelers').value = '2';
doc.getElementById('preferences').value = '喜欢逛本地市场，想体验茶文化';
doc.getElementById('regionConfirm').value = 'domestic';
doc.querySelectorAll('#styleGroup input[type="checkbox"]').forEach(cb => {
  if (['文化历史', '美食探索'].includes(cb.attrs.value)) cb.checked = true;
});
form.dispatchEvent(new Ev('submit', { bubbles: true, cancelable: true }));

const prompt = box.value;
ok('弹窗已打开', modal.classList.contains('open'));
console.log('\n----- 生成的提示词 -----\n' + prompt + '\n------------------------\n');
ok('提示词非空', prompt.length > 100, 'len=' + prompt.length);
ok('含目的地', prompt.includes('目的地：成都'));
ok('含天数', prompt.includes('4 天'));
ok('含人数', prompt.includes('2 人'));
ok('含风格两项', prompt.includes('文化历史') && prompt.includes('美食探索'));
ok('含特别偏好', prompt.includes('喜欢逛本地市场'));
ok('区域=境内', prompt.includes('中国境内'));
ok('含 7 模块契约', prompt.includes('7 个模块') && prompt.includes('餐饮住宿'));
ok('含「行程只写片区」规则', prompt.includes('行程模块只写片区'));
ok('含默认放行说明', prompt.includes('不必回头追问'));
ok('未误报校验错误', !doc.getElementById('err-destination').classList.contains('show'));
ok('body 滚动已锁定', doc.body.style.overflow === 'hidden');

console.log('\n[3] 摘要 chips');
const chips = doc.querySelectorAll('#summaryChips .chip').map(e => e.textContent);
ok('chip 基础 3 项 + 风格 + 区域', chips.length === 5, JSON.stringify(chips));
ok('chip 含目的地', chips.some(c => c.includes('成都')));
ok('chip 含天数', chips.some(c => c.includes('4 天')));
ok('chip 含人数', chips.some(c => c.includes('2 人')));
ok('chip 含风格', chips.some(c => c.includes('美食探索')), JSON.stringify(chips));
ok('chip 含区域', chips.some(c => c.includes('境内')));

console.log('\n[4] 复制（走 clipboard API）');
sandbox.__execCommandReturns = true;
copyBtn.dispatchEvent(new Ev('click', { bubbles: true }));
setTimeout(() => {
  ok('剪贴板收到完整提示词', copied === prompt, copied ? 'len=' + copied.length : 'null');
  ok('按钮反馈「已复制」', copyBtn.textContent.includes('已复制'), copyBtn.textContent);

  console.log('\n[5] 复制降级（clipboard 不可用 → execCommand）');
  const realClipboard = sandbox.navigator.clipboard;
  sandbox.navigator.clipboard = undefined;
  copied = null;
  sandbox.__execCommandReturns = true;
  copyBtn.dispatchEvent(new Ev('click', { bubbles: true }));
  setTimeout(() => {
    ok('无 clipboard 时仍成功（execCommand 兜底）', copyBtn.textContent.includes('已复制'), copyBtn.textContent);
    sandbox.navigator.clipboard = realClipboard;

    console.log('\n[6] 复制彻底失败时的提示');
    sandbox.navigator.clipboard = undefined;
    sandbox.__execCommandReturns = false;
    copyBtn.dispatchEvent(new Ev('click', { bubbles: true }));
    setTimeout(() => {
      ok('两条路都失败时提示手动复制', copyBtn.textContent.includes('Ctrl/Cmd'), copyBtn.textContent);
      sandbox.navigator.clipboard = realClipboard;
      sandbox.__execCommandReturns = true;

      console.log('\n[7] Esc 关闭');
      const escEv = new Ev('keydown', { bubbles: true }); escEv.key = 'Escape';
      doc.dispatchEvent(escEv);
      ok('Esc 后弹窗关闭', !modal.classList.contains('open'));
      ok('body 滚动已恢复', doc.body.style.overflow !== 'hidden');

      console.log('\n[8] 必填校验：目的地为纯空格');
      doc.getElementById('destination').value = '   ';
      form.dispatchEvent(new Ev('submit', { bubbles: true, cancelable: true }));
      ok('校验失败时弹窗不打开', !modal.classList.contains('open'));
      ok('显示行内错误', doc.getElementById('err-destination').classList.contains('show'));
      ok('输入框标记 invalid', doc.getElementById('destination').classList.contains('invalid'));

      console.log('\n[9] 修正后清除错误态');
      const dest = doc.getElementById('destination');
      dest.value = '西安';
      dest.dispatchEvent(new Ev('input', { bubbles: true }));
      ok('错误提示已清除', !doc.getElementById('err-destination').classList.contains('show'));

      console.log('\n[10] 点遮罩关闭');
      form.dispatchEvent(new Ev('submit', { bubbles: true, cancelable: true }));
      ok('二次提交弹窗打开', modal.classList.contains('open'));
      ok('二次提交内容已更新', box.value.includes('西安'));
      modal.dispatchEvent(new Ev('click', { bubbles: true }));
      ok('点遮罩后关闭', !modal.classList.contains('open'));

      console.log('\n===== ' + pass + ' passed, ' + fail + ' failed =====');
      process.exit(fail ? 1 : 0);
    }, 10);
  }, 10);
}, 10);
