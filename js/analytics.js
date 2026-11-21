/* ============================================================
 * analytics.js —— 匿名访问上报（可选，默认关闭）
 * ------------------------------------------------------------
 * 【默认关闭】ENDPOINT 为空时不发起任何网络请求，离线版零外联不变。
 * 部署 Cloudflare Worker 后，把 ENDPOINT 改成你的 Worker 地址即可启用，
 * 例如：var ENDPOINT = 'https://suixue-analytics.<你的子域>.workers.dev';
 *
 * 【隐私】只上报：匿名访客ID（本机随机生成）、访问时间、页面路径、
 *   年级/学科/册次/模块、设备与浏览器大类、来源域名。
 *   不采集：IP、姓名、账号、输入内容、课文原文、任何键盘输入。
 * ============================================================ */
(function () {
  'use strict';

  /* ===== 配置：部署后改这里 ===== */
  var ENDPOINT = '';                 // Worker 地址；留空 = 关闭上报
  var SAMPLE = 1;                    // 采样率 1 = 全部上报；0.1 = 10%
  /* ============================== */

  function log() {}                  // 静默：上报失败绝不干扰学习

  function trimSlash(s) { return String(s || '').replace(/\/+$/, ''); }
  if (!ENDPOINT || typeof fetch !== 'function') { window.SuiXueAnalytics = { enabled: false }; return; }
  // file:// 打开时通常是离线单文件，不联网上报
  if (location.protocol === 'file:') { window.SuiXueAnalytics = { enabled: false, reason: 'local-file' }; return; }
  if (SAMPLE < 1 && Math.random() > SAMPLE) { window.SuiXueAnalytics = { enabled: true, sampled: true }; return; }

  ENDPOINT = trimSlash(ENDPOINT);
  var VID_KEY = 'suixue_anon_vid';

  function visitorId() {
    var v = '';
    try { v = localStorage.getItem(VID_KEY) || ''; } catch (e) {}
    if (!v) {
      try {
        if (window.crypto && crypto.randomUUID) v = crypto.randomUUID();
        else v = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(VID_KEY, v);
      } catch (e) { v = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
    }
    return v;
  }
  function eid() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }
  /** 从界面读取当前学习上下文（只读 DOM，不碰用户输入内容） */
  function context() {
    function active(sel) {
      var n = document.querySelector(sel + '.on');
      return n ? (n.getAttribute('data-v') || n.textContent || '').trim() : '';
    }
    return {
      grade: active('.grade-btn'),
      subject: active('.subject-btn'),
      volume: active('.vol-btn'),
      module: active('.module-tab')
    };
  }

  function send(ev) {
    var payload = {
      v: visitorId(),
      eid: eid(),
      ev: ev || 'visit',
      path: location.pathname || '/',
      grade: '', subject: '', volume: '', module: ''
    };
    var c = context();
    payload.grade = c.grade; payload.subject = c.subject;
    payload.volume = c.volume; payload.module = c.module;

    var body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon(ENDPOINT + '/api/track', blob)) return;
      }
      fetch(ENDPOINT + '/api/track', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: body, keepalive: true, mode: 'cors'
      }).then(log).catch(log);
    } catch (e) { log(); }
  }

  // 首次访问上报一次
  function boot() {
    setTimeout(function () { send('visit'); }, 800);
    // 监听模块/年级/学科切换，节流上报（1 秒内最多一次）
    var last = 0;
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest('[data-act]');
      if (!btn) return;
      var act = btn.getAttribute('data-act');
      if (act !== 'module' && act !== 'grade' && act !== 'subject' && act !== 'volume' && act !== 'unit') return;
      var now = Date.now();
      if (now - last < 1000) return;
      last = now;
      setTimeout(function () { send('action'); }, 300);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.SuiXueAnalytics = { enabled: true, endpoint: ENDPOINT };
})();
