/* ============================================================
 * speech.js —— 语音引擎（Web Speech API 语音合成）
 * ------------------------------------------------------------
 * 完全基于浏览器内置能力：无需联网、无需 API Key、无调用费用。
 * 中文使用 zh-CN 音色，英文使用 en-US 音色，可在设置中切换。
 * 提供：单条朗读、批量连读（可中断）、暂停/继续、语速调节。
 * ============================================================ */
(function () {
  'use strict';

  var synth = window.speechSynthesis;
  var Utter = window.SpeechSynthesisUtterance;
  var supported = !!(synth && Utter);

  var voices = [];
  var listeners = [];
  var seqToken = 0;
  var speakToken = 0;   // 每次新朗读/停止自增，用于作废尚未真正播放的延迟任务
  var playing = false;

  var settings = {
    rate: (window.APP_CONFIG && window.APP_CONFIG.speech.rate) || 0.85,
    pitch: (window.APP_CONFIG && window.APP_CONFIG.speech.pitch) || 1.0,
    gap: (window.APP_CONFIG && window.APP_CONFIG.speech.gap) || 480,
    zhVoice: '',
    enVoice: ''
  };

  var LANGS = {
    zh: (window.APP_CONFIG && window.APP_CONFIG.speech.zh) || 'zh-CN',
    en: (window.APP_CONFIG && window.APP_CONFIG.speech.en) || 'en-US'
  };

  function emit() { listeners.forEach(function (f) { try { f(playing); } catch (e) {} }); }
  function setPlaying(v) { playing = v; emit(); }

  function refreshVoices() {
    if (!supported) return;
    try { voices = synth.getVoices() || []; } catch (e) { voices = []; }
    if (voices.length) notifyVoices();
  }

  var voiceListeners = [];
  function notifyVoices() { voiceListeners.forEach(function (f) { try { f(voices); } catch (e) {} }); }
  function onVoicesReady(f) {
    voiceListeners.push(f);
    if (voices.length) f(voices);
  }

  if (supported) {
    refreshVoices();
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', refreshVoices);
    } else {
      synth.onvoiceschanged = refreshVoices;
    }
    // 部分浏览器首次不触发 voiceschanged，做一次轻量兜底轮询
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (!voices.length) refreshVoices();
      if (voices.length || tries > 12) clearInterval(timer);
    }, 400);
  }

  function voiceList(langKey) {
    var want = LANGS[langKey] || LANGS.zh;
    var prefix = want.slice(0, 2).toLowerCase();
    var hit = voices.filter(function (v) {
      return (v.lang || '').toLowerCase().replace('_', '-').indexOf(prefix) === 0;
    });
    return hit.length ? hit : voices.slice();
  }

  function pickVoice(langKey) {
    var list = voiceList(langKey);
    if (!list.length) return null;
    var wanted = settings[langKey + 'Voice'];
    if (wanted) {
      for (var i = 0; i < list.length; i++) if (list[i].name === wanted) return list[i];
    }
    // 优先本地音色，其次名称中包含语言提示的音色
    var local = list.filter(function (v) { return v.localService; });
    var pool = local.length ? local : list;
    var want = (LANGS[langKey] || '').toLowerCase();
    for (var j = 0; j < pool.length; j++) {
      if ((pool[j].lang || '').toLowerCase().replace('_', '-') === want) return pool[j];
    }
    return pool[0];
  }

  function normalizeLang(lang) {
    if (lang === 'en' || lang === LANGS.en) return 'en';
    return 'zh';
  }

  /* ---- 朗读预热（关键）----
   * Chrome / Edge 首次调用 speak() 前会惰性初始化语音服务，常常卡 2~5 秒；
   * 页面加载后用一个「静音的空语句」先把引擎唤醒，之后点击即时响应。
   * 必须在用户手势/加载早期触发，且不能影响正在播放的内容。 */
  var primeStarted = false;
  function prime() {
    if (!supported || primeStarted) return;
    try {
      var p = new Utter(' ');
      p.volume = 0; p.rate = 1; p.lang = LANGS.zh;
      p.onstart = function () { primeStarted = true; };
      /* 只在还没有任何真实朗读请求时清场；若用户已点击，绝不能 cancel 掉真实语句 */
      p.onend = function () { if (speakToken === 0) { try { synth.cancel(); } catch (e) {} } };
      synth.speak(p);
    } catch (e) {}
  }
  if (supported) {
    prime();
    // 有些浏览器要求用户手势后才能发声，补一次手势触发的预热
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (evt) {
      document.addEventListener(evt, prime, { once: true, passive: true });
    });
  }

  /**
   * 朗读一段文本
   * @param {string} text
   * @param {object} opt { lang:'zh'|'en', rate, onstart, onend, onerror, quiet }
   */
  function speak(text, opt) {
    opt = opt || {};
    if (!supported || !text) {
      if (opt.onend) opt.onend();
      return false;
    }
    var langKey = normalizeLang(opt.lang);
    var token = ++speakToken;
    try {
      /* 关键：Chrome/Edge 里 cancel() 之后「同步」再 speak() 会被内核排队，
       * 通常要等上一个语句的终止流程走完（几秒）才出声。
       * 做法：先 cancel，再把真正的 speak 放进下一个定时器（脱离当前任务栈）。
       * 这样既立刻响应点击，又避免与上一次朗读的 cancel 竞态。 */
      if (synth.speaking || synth.pending || synth.paused) {
        try { synth.cancel(); } catch (e) {}
      }
      var u = new Utter(String(text));
      var v = pickVoice(langKey);
      if (v) u.voice = v;
      u.lang = LANGS[langKey];
      u.rate = Number(opt.rate || settings.rate);
      u.pitch = settings.pitch;
      u.volume = 1;
      if (opt.onstart) u.onstart = opt.onstart;
      u.onend = function () { if (token === speakToken) setPlaying(false); if (opt.onend) opt.onend(); };
      u.onerror = function (e) {
        if (token === speakToken) setPlaying(false);
        if (opt.onerror) opt.onerror(e); else if (opt.onend) opt.onend();
      };
      setPlaying(true);
      setTimeout(function () {
        if (token !== speakToken) return;   // 期间又点了停止/别的朗读，作废
        try {
          // Chrome 有时在 cancel() 后把引擎留在 paused 状态，显式 resume 兜底
          if (synth.paused) { try { synth.resume(); } catch (e) {} }
          synth.speak(u);
        } catch (e) {
          setPlaying(false);
          if (opt.onerror) opt.onerror(e); else if (opt.onend) opt.onend();
        }
      }, 30);
      return true;
    } catch (e) {
      setPlaying(false);
      if (opt.onend) opt.onend();
      return false;
    }
  }

  function stop() {
    seqToken++;
    speakToken++;   // 作废尚未进入 synth 队列的 speak，避免停止后又冒出声音
    if (supported) { try { synth.cancel(); } catch (e) {} }
    setPlaying(false);
  }

  function pause() { if (supported) { try { synth.pause(); } catch (e) {} } }
  function resume() { if (supported) { try { synth.resume(); } catch (e) {} } }

  /**
   * 批量连读：逐条播放，支持随时停止与高亮回调
   * @param {Array} items [{text, lang}] 或字符串数组
   * @param {object} opt { lang, rate, gap, onItem(index,item), onDone(stopped), onStart }
   */
  function speakSequence(items, opt) {
    opt = opt || {};
    stop();
    var token = ++seqToken;
    var list = (items || []).filter(function (x) { return x && (typeof x === 'string' ? x : x.text); });
    if (!list.length) { if (opt.onDone) opt.onDone(false); return; }
    var i = 0;
    var gap = typeof opt.gap === 'number' ? opt.gap : settings.gap;
    if (opt.onStart) opt.onStart();

    function next() {
      if (token !== seqToken) { if (opt.onDone) opt.onDone(true); return; }
      if (i >= list.length) { setPlaying(false); if (opt.onDone) opt.onDone(false); return; }
      var item = list[i];
      var text = typeof item === 'string' ? item : item.text;
      var lang = typeof item === 'string' ? opt.lang : (item.lang || opt.lang);
      if (opt.onItem) opt.onItem(i, item);
      var idx = i;
      speak(text, {
        lang: lang,
        rate: opt.rate,
        onend: function () {
          if (token !== seqToken) return;
          i = idx + 1;
          setTimeout(next, gap);
        }
      });
    }
    next();
  }

  function setRate(r) { settings.rate = Math.max(0.5, Math.min(1.5, Number(r) || 0.85)); }
  function setVoice(langKey, name) { settings[langKey + 'Voice'] = name || ''; }
  function getSettings() { return settings; }
  function onChange(f) { listeners.push(f); }
  function getVoices(langKey) { return voiceList(langKey); }
  function langOf(subjectId) { return subjectId === 'english' ? 'en' : 'zh'; }

  window.Speech = {
    supported: supported,
    speak: speak,
    speakSequence: speakSequence,
    stop: stop,
    pause: pause,
    resume: resume,
    setRate: setRate,
    setVoice: setVoice,
    getSettings: getSettings,
    getVoices: getVoices,
    onVoicesReady: onVoicesReady,
    onChange: onChange,
    langOf: langOf,
    isPlaying: function () { return playing; },
    langLabel: function (k) { return LANGS[k] || LANGS.zh; }
  };
})();
