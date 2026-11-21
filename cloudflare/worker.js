/* ============================================================
 * 穗学伴 · 匿名访问日志 Worker（Cloudflare Workers + D1）
 * ------------------------------------------------------------
 * 提供：
 *   POST /api/track    公开：接收前端匿名访问事件
 *   POST /api/login    公开：管理员密码校验，签发短期 token
 *   GET  /api/overview 管理员：总体统计
 *   GET  /api/daily    管理员：按天趋势
 *   GET  /api/breakdown 管理员：地区/设备/浏览器/模块分布
 *   GET  /api/recent   管理员：最近访问明细（匿名哈希）
 *   GET  /admin        公开页面 + 前端鉴权：管理看板
 *
 * 安全设计：
 *  - 管理员密码只在服务端环境变量 ADMIN_PASSWORD 中比对；
 *  - 鉴权用 HMAC-SHA256 签名的短期 token（默认 12 小时），密钥用 SESSION_SECRET；
 *  - 前端代码与公开站点中不含任何密码或密钥；
 *  - 不采集 IP/姓名/账号，visitor 为不可逆哈希。
 *
 * 需要绑定的环境变量（Worker → Settings → Variables and Secrets）：
 *   ADMIN_PASSWORD  (secret) 管理员密码
 *   SESSION_SECRET  (secret) 会话签名密钥（一长串随机字符）
 * 需要绑定的资源：
 *   DB  (D1 database) 执行过 schema.sql 的数据库
 * ============================================================ */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Session',
  'Access-Control-Max-Age': '86400'
};

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS }
});

const SESSION_TTL = 12 * 3600 * 1000; // 12 小时

/* ---------- 工具：Web Crypto（Workers 无 Node 模块） ---------- */
function bytesToHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function strToBytes(s) { return new TextEncoder().encode(s); }
function b64urlEncode(str) {
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function b64urlDecode(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(b64 + '==='.slice((b64.length + 3) % 4))));
}
async function hmac(secret, message) {
  const key = await crypto.subtle.importKey('raw', strToBytes(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return bytesToHex(await crypto.subtle.sign('HMAC', key, strToBytes(message)));
}
async function sha256(message) {
  return bytesToHex(await crypto.subtle.digest('SHA-256', strToBytes(message)));
}
/** 恒定时间比较，避免时序侧信道 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------- 会话 token ---------- */
async function issueToken(secret) {
  const payload = { exp: Date.now() + SESSION_TTL, nonce: crypto.randomUUID() };
  const body = b64urlEncode(JSON.stringify(payload));
  const sig = await hmac(secret, body);
  return body + '.' + sig;
}
async function verifyToken(secret, token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  const expect = await hmac(secret, body);
  if (!safeEqual(sig, expect)) return false;
  try {
    const payload = JSON.parse(b64urlDecode(body));
    return payload.exp > Date.now();
  } catch (e) { return false; }
}

/* ---------- 北京时间日期 ---------- */
function beijingDay(ts) {
  return new Date(ts + 8 * 3600 * 1000).toISOString().slice(0, 10);
}
/** 从 UA 推断设备与浏览器大类（不存储完整 UA） */
function parseUA(ua) {
  ua = ua || '';
  let device = 'desktop';
  if (/iPad|Tablet|PlayBook/i.test(ua)) device = 'tablet';
  else if (/Mobile|iPhone|Android.*Mobile|Windows Phone/i.test(ua)) device = 'mobile';
  let browser = 'other';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/MicroMessenger/i.test(ua)) browser = 'WeChat';
  return { device, browser };
}
/** 只取来源域名，不存完整 URL */
function refHost(ref) {
  if (!ref) return '';
  try { return new URL(ref).hostname; } catch (e) { return ''; }
}

/* ---------- 路由处理 ---------- */

async function handleTrack(request, env) {
  let data;
  try { data = await request.json(); } catch (e) { return json({ ok: false, error: 'bad json' }, 400); }

  const vid = String(data.v || '').slice(0, 80);
  const eid = String(data.eid || '').slice(0, 120);
  if (!vid || !eid) return json({ ok: false, error: 'missing v/eid' }, 400);

  const ts = Date.now();
  // visitor 用服务端密钥哈希，不可逆，且每天换盐 → 不可跨天追踪
  const visitor = (await hmac(env.SESSION_SECRET, vid + '|' + beijingDay(ts))).slice(0, 32);
  const ua = request.headers.get('User-Agent') || '';
  const { device, browser } = parseUA(ua);
  const country = request.headers.get('CF-IPCountry') || '';

  const row = {
    ts,
    day: beijingDay(ts),
    visitor,
    ev: String(data.ev || 'visit').slice(0, 20),
    path: String(data.path || '').slice(0, 200),
    grade: String(data.grade || '').slice(0, 20),
    subject: String(data.subject || '').slice(0, 20),
    volume: String(data.volume || '').slice(0, 10),
    module: String(data.module || '').slice(0, 30),
    country: country === 'XX' ? '' : country,
    device,
    browser,
    refhost: refHost(request.headers.get('Referer')).slice(0, 120),
    eid
  };

  try {
    // eid 唯一索引去重：同一事件重复上报只记一次
    await env.DB.prepare(
      `INSERT OR IGNORE INTO visits
       (ts, day, visitor, ev, path, grade, subject, volume, module, country, device, browser, refhost, eid)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(row.ts, row.day, row.visitor, row.ev, row.path, row.grade, row.subject,
      row.volume, row.module, row.country, row.device, row.browser, row.refhost, row.eid).run();
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e && e.message || e) }, 500);
  }
}

async function handleLogin(request, env) {
  let data;
  try { data = await request.json(); } catch (e) { return json({ ok: false }, 400); }
  const pass = String(data.password || '');
  if (!env.ADMIN_PASSWORD || !safeEqual(pass, env.ADMIN_PASSWORD)) {
    return json({ ok: false, error: '密码错误' }, 401);
  }
  const token = await issueToken(env.SESSION_SECRET);
  return json({ ok: true, token, expiresIn: SESSION_TTL });
}

async function requireAdmin(request, env) {
  const token = request.headers.get('X-Session') || '';
  return verifyToken(env.SESSION_SECRET, token);
}

async function handleOverview(request, env) {
  const today = beijingDay(Date.now());
  const todayStart = (Date.parse(today + 'T00:00:00Z') - 8 * 3600 * 1000);
  const queries = [
    env.DB.prepare('SELECT COUNT(*) AS n FROM visits').first(),
    env.DB.prepare('SELECT COUNT(DISTINCT visitor) AS n FROM visits').first(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM visits WHERE ts >= ?').bind(todayStart).first(),
    env.DB.prepare('SELECT COUNT(DISTINCT visitor) AS n FROM visits WHERE ts >= ?').bind(todayStart).first(),
    env.DB.prepare('SELECT MIN(ts) AS first FROM visits').first()
  ];
  const [total, uniq, todayPv, todayUv, firstRow] = await Promise.all(queries);
  return json({
    totalPv: total.n || 0,
    totalUv: uniq.n || 0,
    todayPv: todayPv.n || 0,
    todayUv: todayUv.n || 0,
    firstVisit: firstRow.first || null
  });
}

async function handleDaily(request, env, url) {
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days'), 10) || 14, 1), 90);
  const since = beijingDay(Date.now() - days * 86400000);
  const rs = await env.DB.prepare(
    `SELECT day, COUNT(*) AS pv, COUNT(DISTINCT visitor) AS uv
     FROM visits WHERE day >= ? GROUP BY day ORDER BY day`
  ).bind(since).all();
  return json({ rows: rs.results || [] });
}

async function handleBreakdown(request, env) {
  const dims = {
    country: 'country', device: 'device', browser: 'browser',
    module: 'module', grade: 'grade', subject: 'subject'
  };
  const out = {};
  await Promise.all(Object.entries(dims).map(async ([key, col]) => {
    const rs = await env.DB.prepare(
      `SELECT ${col} AS name, COUNT(*) AS n FROM visits
       WHERE ${col} <> '' GROUP BY ${col} ORDER BY n DESC LIMIT 12`
    ).all();
    out[key] = rs.results || [];
  }));
  return json(out);
}

async function handleRecent(request, env, url) {
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit'), 10) || 50, 1), 200);
  const rs = await env.DB.prepare(
    `SELECT ts, day, ev, path, grade, subject, volume, module, country, device, browser, refhost
     FROM visits ORDER BY ts DESC LIMIT ?`
  ).bind(limit).all();
  return json({ rows: rs.results || [] });
}

/* ---------- 管理页 HTML（内嵌，零外部依赖） ---------- */
const ADMIN_HTML = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>穗学伴 · 访问统计管理</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;background:#f4f6fb;color:#1f2b45;padding:20px;line-height:1.6}
.wrap{max-width:1080px;margin:0 auto}
.card{background:#fff;border:1px solid #e6ebf5;border-radius:16px;padding:24px;box-shadow:0 4px 20px rgba(31,54,96,.05);margin-bottom:18px}
h1{font-size:22px;margin-bottom:4px}
h2{font-size:16px;margin-bottom:14px;color:#3164c8}
.sub{color:#7a869c;font-size:13px;margin-bottom:20px}
label{display:block;font-size:13px;margin-bottom:6px;color:#4a5772}
input[type=password]{width:100%;max-width:360px;padding:11px 14px;border:1.5px solid #d7e0f0;border-radius:10px;font-size:15px}
button{border:0;background:#3a6df0;color:#fff;padding:11px 22px;border-radius:10px;font-size:14px;cursor:pointer;font-weight:600}
button:hover{background:#2c5bd8}
button.ghost{background:#eef3ff;color:#3164c8}
.err{color:#d23f3f;font-size:13px;margin-top:10px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px}
.stat{background:#f7f9ff;border-radius:12px;padding:16px}
.stat b{display:block;font-size:26px;color:#2c5bd8}
.stat span{font-size:12px;color:#6b7891}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media(max-width:720px){.grid2{grid-template-columns:1fr}}
table{width:100%;border-collapse:collapse;font-size:12.5px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #eef1f7;white-space:nowrap}
th{color:#7a869c;font-weight:600}
.scroll{overflow-x:auto}
.bar{display:flex;align-items:center;gap:8px;margin:5px 0;font-size:12.5px}
.bar .name{width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar .track{flex:1;background:#eef2fa;border-radius:6px;height:16px;position:relative}
.bar .fill{background:linear-gradient(90deg,#5b8bff,#3a6df0);height:100%;border-radius:6px}
.bar .num{width:46px;text-align:right;color:#6b7891}
.chart{display:flex;align-items:flex-end;gap:6px;height:150px;padding-top:10px}
.chart .col{flex:1;background:linear-gradient(180deg,#5b8bff,#3a6df0);border-radius:6px 6px 0 0;min-height:2px;position:relative}
.chart .col span{position:absolute;top:-18px;left:0;right:0;text-align:center;font-size:10px;color:#6b7891}
.chart .col i{position:absolute;bottom:-20px;left:0;right:0;text-align:center;font-size:9px;color:#9aa5b8;font-style:normal}
.hidden{display:none}
.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
</style></head>
<body><div class="wrap">

<div id="loginCard" class="card">
  <h1>🔐 穗学伴 · 访问统计管理</h1>
  <p class="sub">管理员入口 · 密码仅在服务端校验，前端不含任何密码</p>
  <label for="pwd">管理员密码</label>
  <input type="password" id="pwd" placeholder="输入管理员密码" autocomplete="current-password">
  <div style="margin-top:14px"><button id="loginBtn">登录</button></div>
  <p class="err" id="loginErr"></p>
</div>

<div id="dash" class="hidden">
  <div class="topbar">
    <div><h1>📊 访问统计看板</h1><p class="sub" id="updated"></p></div>
    <div><button class="ghost" id="refreshBtn">刷新</button> <button class="ghost" id="logoutBtn">退出</button></div>
  </div>

  <div class="card">
    <h2>总览</h2>
    <div class="stats">
      <div class="stat"><b id="s-totalPv">-</b><span>累计访问次数 PV</span></div>
      <div class="stat"><b id="s-totalUv">-</b><span>累计匿名访客 UV</span></div>
      <div class="stat"><b id="s-todayPv">-</b><span>今日访问次数</span></div>
      <div class="stat"><b id="s-todayUv">-</b><span>今日匿名访客</span></div>
    </div>
  </div>

  <div class="card">
    <h2>近 14 天访问趋势</h2>
    <div class="chart" id="chart"></div>
  </div>

  <div class="grid2">
    <div class="card"><h2>地区分布</h2><div id="b-country"></div></div>
    <div class="card"><h2>设备分布</h2><div id="b-device"></div></div>
    <div class="card"><h2>浏览器分布</h2><div id="b-browser"></div></div>
    <div class="card"><h2>常用模块</h2><div id="b-module"></div></div>
    <div class="card"><h2>年级分布</h2><div id="b-grade"></div></div>
    <div class="card"><h2>学科分布</h2><div id="b-subject"></div></div>
  </div>

  <div class="card">
    <h2>最近访问（匿名）</h2>
    <div class="scroll"><table id="recentTable">
      <thead><tr><th>时间</th><th>年级</th><th>学科</th><th>模块</th><th>地区</th><th>设备</th><th>浏览器</th></tr></thead>
      <tbody></tbody>
    </table></div>
    <p class="sub" style="margin-top:12px">说明：为保护隐私，不显示 IP 与具体身份；访客以不可逆哈希区分。</p>
  </div>
</div>
</div>

<script>
var TOKEN = '';
function api(path, opt) {
  opt = opt || {};
  opt.headers = opt.headers || {};
  opt.headers['X-Session'] = TOKEN;
  if (opt.body) opt.headers['Content-Type'] = 'application/json';
  return fetch(path, opt).then(function(r){
    if (r.status === 401) { logout(); throw new Error('登录已过期'); }
    return r.json();
  });
}
function show(id, text) { var e = document.getElementById(id); if (e) e.textContent = text; }
function bars(el, rows) {
  if (!rows || !rows.length) { el.innerHTML = '<p class="sub">暂无数据</p>'; return; }
  var max = rows[0].n || 1, h = '';
  rows.forEach(function(r){
    var name = (r.name === 'XX' || !r.name) ? '未知' : r.name;
    h += '<div class="bar"><span class="name" title="' + name + '">' + name + '</span>' +
         '<div class="track"><div class="fill" style="width:' + Math.max(3, r.n / max * 100) + '%"></div></div>' +
         '<span class="num">' + r.n + '</span></div>';
  });
  el.innerHTML = h;
}
function renderChart(rows) {
  var el = document.getElementById('chart');
  if (!rows || !rows.length) { el.innerHTML = '<p class="sub">暂无数据</p>'; return; }
  var max = 1; rows.forEach(function(r){ if (r.pv > max) max = r.pv; });
  var h = '';
  rows.forEach(function(r){
    var pct = Math.max(2, r.pv / max * 100);
    h += '<div class="col" style="height:' + pct + '%">' +
         '<span>' + r.pv + '</span><i>' + r.day.slice(5) + '</i></div>';
  });
  el.innerHTML = h;
}
function fmtTime(ts) {
  var d = new Date(ts + 8 * 3600 * 1000);
  return d.toISOString().slice(5,16).replace('T',' ');
}
function load() {
  api('/api/overview').then(function(o){
    ['totalPv','totalUv','todayPv','todayUv'].forEach(function(k){ show('s-' + k, o[k]); });
    return api('/api/daily?days=14');
  }).then(function(d){ renderChart(d.rows); return api('/api/breakdown'); })
    .then(function(b){
      ['country','device','browser','module','grade','subject'].forEach(function(k){
        bars(document.getElementById('b-' + k), b[k]);
      });
      return api('/api/recent?limit=60');
    }).then(function(r){
      var tb = document.querySelector('#recentTable tbody'), h = '';
      (r.rows || []).forEach(function(x){
        h += '<tr><td>' + fmtTime(x.ts) + '</td><td>' + (x.grade||'-') + '</td><td>' + (x.subject||'-') +
             '</td><td>' + (x.module||'-') + '</td><td>' + (x.country||'-') + '</td><td>' + (x.device||'-') +
             '</td><td>' + (x.browser||'-') + '</td></tr>';
      });
      tb.innerHTML = h || '<tr><td colspan="7">暂无数据</td></tr>';
      show('updated', '最后更新：' + new Date().toLocaleString('zh-CN'));
    }).catch(function(e){ if (e.message !== '登录已过期') console.error(e); });
}
function logout() {
  TOKEN = '';
  document.getElementById('dash').classList.add('hidden');
  document.getElementById('loginCard').classList.remove('hidden');
}
document.getElementById('loginBtn').onclick = function(){
  var pwd = document.getElementById('pwd').value;
  var err = document.getElementById('loginErr'); err.textContent = '';
  fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({password:pwd}) })
    .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }); })
    .then(function(res){
      if (!res.ok || !res.j.ok) { err.textContent = res.j.error || '登录失败'; return; }
      TOKEN = res.j.token;
      document.getElementById('loginCard').classList.add('hidden');
      document.getElementById('dash').classList.remove('hidden');
      load();
    }).catch(function(){ err.textContent = '网络错误，请重试'; });
};
document.getElementById('pwd').addEventListener('keydown', function(e){ if (e.key === 'Enter') document.getElementById('loginBtn').click(); });
document.getElementById('refreshBtn').onclick = load;
document.getElementById('logoutBtn').onclick = logout;
</script>
</body></html>`;

/* ---------- 主入口 ---------- */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (path === '/api/track' && request.method === 'POST') return handleTrack(request, env);
    if (path === '/api/login' && request.method === 'POST') return handleLogin(request, env);
    if (path === '/admin' || path === '/') {
      return new Response(ADMIN_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
    }

    // 以下接口需管理员鉴权
    if (path.startsWith('/api/')) {
      if (!(await requireAdmin(request, env))) return json({ ok: false, error: '未授权' }, 401);
      if (path === '/api/overview') return handleOverview(request, env);
      if (path === '/api/daily') return handleDaily(request, env, url);
      if (path === '/api/breakdown') return handleBreakdown(request, env);
      if (path === '/api/recent') return handleRecent(request, env, url);
    }

    return new Response('Not found', { status: 404 });
  }
};
