/* ============================================================
 * tools/split-hanzi.js —— 从现有字库按年级生成小包
 * 用法：node tools/split-hanzi.js
 * 不修改任何教学数据源文件，只生成 js/hanzi-g*.js。
 * ============================================================ */
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
function load(rel) {
  global.window = global.window || {};
  require(path.join(root, rel));
}
['js/config.js', 'js/data-core.js', 'js/data-english.js', 'js/data-text.js',
 'js/data-text-init.js', 'js/hanzi-extra.js', 'js/hanzi-grade56.js', 'js/hanzi-junior.js'].forEach(load);

const C = window.APP_CONFIG, U = window.UNIT_DATA;
const PY = window.HANZI_PINYIN || {}, WD = window.HANZI_WORDS || {};
const SD = window.STROKE_DATA || {}, HM = window.HANZI_META || {};
const FALLBACK = '天地人日月水火土山石田禾木林虫云雨风花草树叶春夏秋冬大小多少上下左右人口手足书本笔纸门窗爸妈哥姐弟妹';

function charsOfGrades(grades) {
  const set = {};
  const add = function (s) {
    String(s || '').split('').forEach(function (c) { if (/[\u4e00-\u9fa5]/.test(c)) set[c] = 1; });
  };
  grades.forEach(function (g) {
    ['上', '下'].forEach(function (v) { C.getCatalog(g, 'chinese', v).forEach(add); });
    Object.keys(U).forEach(function (k) {
      if (k.indexOf(g + '|chinese|') !== 0) return;
      String((U[k] || {}).words || '').split(';').forEach(function (w) { add(w.split('|')[0]); });
    });
  });
  FALLBACK.split('').forEach(function (c) { set[c] = 1; });
  return Object.keys(set);
}

function pick(obj, chars) {
  const out = {};
  chars.forEach(function (c) { if (obj[c] !== undefined) out[c] = obj[c]; });
  return out;
}

function writePack(name, grades) {
  const chars = charsOfGrades(grades);
  const p = pick(PY, chars), w = pick(WD, chars), s = pick(SD, chars), m = pick(HM, chars);
  const js = [
    '/* 自动生成：按年级裁剪的离线字库包（源数据未改动） */',
    '(function () {',
    '  var P = window.HANZI_PINYIN || (window.HANZI_PINYIN = {});',
    '  var W = window.HANZI_WORDS || (window.HANZI_WORDS = {});',
    '  var S = window.STROKE_DATA || (window.STROKE_DATA = {});',
    '  var M = window.HANZI_META || (window.HANZI_META = {});',
    '  var py = ' + JSON.stringify(p) + ';',
    '  var wd = ' + JSON.stringify(w) + ';',
    '  var sd = ' + JSON.stringify(s) + ';',
    '  var hm = ' + JSON.stringify(m) + ';',
    '  Object.keys(py).forEach(function (k) { if (P[k] === undefined) P[k] = py[k]; });',
    '  Object.keys(wd).forEach(function (k) { if (W[k] === undefined) W[k] = wd[k]; });',
    '  Object.keys(sd).forEach(function (k) { if (S[k] === undefined) S[k] = sd[k]; });',
    '  Object.keys(hm).forEach(function (k) { if (M[k] === undefined) M[k] = hm[k]; });',
    '})();'
  ].join('\n');
  const out = path.join(root, 'js', name);
  fs.writeFileSync(out, js, 'utf8');
  console.log(name, 'chars=' + chars.length, 'py=' + Object.keys(p).length,
    'words=' + Object.keys(w).length, 'strokes=' + Object.keys(s).length,
    'size=' + (fs.statSync(out).size / 1024).toFixed(1) + 'KB');
}

writePack('hanzi-g1.js', [1]);
writePack('hanzi-g2.js', [2]);
writePack('hanzi-g3.js', [3]);
writePack('hanzi-g4.js', [4]);
