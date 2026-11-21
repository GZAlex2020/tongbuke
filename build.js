/* ============================================================
 * build.js —— 生成自包含单文件版「穗学伴.html」
 * 用法：node build.js
 * ------------------------------------------------------------
 * index.template.html 是唯一入口模板；本脚本：
 *   1) 计算全部资源的内容 hash，替换模板里的 __VER__
 *   2) 生成根目录 index.html（GitHub Pages 用的分文件入口）
 *   3) 生成 dist/穗学伴.html（CSS/JS/字库全内联，零外联）
 * 修改 css/ 或 js/ 下任意文件后，重新运行本脚本即可同步。
 * ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const tplPath = path.join(root, 'index.template.html');
const distDir = path.join(root, 'dist');
let html = fs.readFileSync(tplPath, 'utf8');

function read(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error('找不到资源: ' + rel);
  return fs.readFileSync(p, 'utf8');
}
/* 防止脚本内容里的 </script 提前截断内联块 */
function safeJs(s) { return s.replace(/<\/script/gi, '<\\/script'); }

/* ---------- 1. 收集模板中引用的静态资源与动态字库 ---------- */
const cssRefs = [];
const jsRefs = [];
html = html.replace(/<link rel="stylesheet" href="([^"?]+)(?:\?[^"]*)?">/g, function (m, href) {
  cssRefs.push(href); return m;
});
html = html.replace(/<script[^>]*\bsrc="([^"?]+)(?:\?[^"]*)?"[^>]*><\/script>/g, function (m, srcPath) {
  jsRefs.push(srcPath); return m;
});
const baseMatch = html.match(/window\.HZ_BASE\s*=\s*\[([\s\S]*?)\];/);
const packsMatch = html.match(/window\.HZ_PACKS\s*=\s*\{([\s\S]*?)\};/);
if (!baseMatch || !packsMatch) throw new Error('模板缺少 HZ_BASE / HZ_PACKS 定义');
const hzLibs = [];
baseMatch[1].replace(/'([^']+)'/g, function (m, p) { hzLibs.push(p); });
packsMatch[1].replace(/'([^']+)'/g, function (m, p) { hzLibs.push(p); });

const uniqueHz = Array.from(new Set(hzLibs));
const allRefs = Array.from(new Set(cssRefs.concat(jsRefs, uniqueHz))).sort();
if (!cssRefs.length || !jsRefs.length || uniqueHz.length < 6) {
  throw new Error('资源清单异常：css=' + cssRefs.length + ' js=' + jsRefs.length + ' hz=' + uniqueHz.length);
}
allRefs.forEach(read); /* 提前校验存在性 */

/* ---------- 2. 内容 hash 版本（任一文件变化 → 全部 URL 变化） ---------- */
const hash = crypto.createHash('md5');
allRefs.forEach(function (rel) { hash.update(rel).update('\0').update(read(rel)).update('\0'); });
const VER = hash.digest('hex').slice(0, 8);
const entryHtml = html.replace(/__VER__/g, VER);

/* ---------- 3. 写入 Pages 入口（分文件版） ---------- */
const entryBanner = '<!-- 由 build.js 从 index.template.html 生成；资源版本 ' + VER + '；请勿直接编辑 -->\n';
fs.writeFileSync(path.join(root, 'index.html'), entryBanner + entryHtml, 'utf8');

/* ---------- 4. 内联为自包含单文件 ---------- */
let out = entryHtml;
let cssCount = 0, jsCount = 0;
out = out.replace(/<link rel="stylesheet" href="([^"?]+)(?:\?[^"]*)?">/g, function () {
  cssCount++; return '<style>\n' + read(cssRefs[cssCount - 1]) + '\n</style>';
});
out = out.replace(/<script[^>]*\bsrc="([^"?]+)(?:\?[^"]*)?"[^>]*><\/script>/g, function () {
  jsCount++; return '<script>\n' + safeJs(read(jsRefs[jsCount - 1])) + '\n</' + 'script>';
});

/* 动态字库：以字符串表内联，加载器优先从 __HZ_INLINE__ 执行 */
const inlineMap = {};
uniqueHz.forEach(function (rel) { inlineMap[rel] = safeJs(read(rel)); });
const inlineJson = JSON.stringify(inlineMap).replace(/</g, '\\u003c');
const anchor = '  window.__HZ_VER__ = ';
if (out.indexOf(anchor) < 0) throw new Error('模板缺少 window.__HZ_VER__ 锚点');
out = out.replace(anchor, '  window.__HZ_INLINE__ = ' + inlineJson + ';\n' + anchor);

if (cssCount !== cssRefs.length || jsCount !== jsRefs.length) {
  throw new Error('内联数量异常：css=' + cssCount + '/' + cssRefs.length + ' js=' + jsCount + '/' + jsRefs.length);
}
if (/<script src=|<link rel="stylesheet"/.test(out)) {
  throw new Error('仍存在外部资源引用，已中止');
}
if (out.indexOf('window.__HZ_INLINE__ = {"vendor/hanzi-writer.min.js"') < 0) {
  throw new Error('字库内联失败，已中止');
}

const banner = [
  '<!--',
  '  穗学伴 · 自包含离线版（构建产物）',
  '  CSS 与全部 JS、离线字库已内联，零外部请求。',
  '  源文件在 css/ 与 js/ 下；修改后运行 node build.js 重新生成。',
  '  资源版本：' + VER,
  '  构建时间：' + new Date().toISOString(),
  '-->'
].join('\n');
out = out.replace(/^<!DOCTYPE html>/, '<!DOCTYPE html>\n' + banner);

fs.mkdirSync(distDir, { recursive: true });
const outFile = path.join(distDir, '穗学伴.html');
fs.writeFileSync(outFile, out, 'utf8');
console.log('已生成: index.html（资源版本 ' + VER + '）');
console.log('已生成: ' + outFile);
console.log('内联 CSS ' + cssCount + ' / 静态 JS ' + jsCount + ' / 动态字库包 ' + uniqueHz.length +
  '，大小 ' + (fs.statSync(outFile).size / 1024).toFixed(1) + ' KB');
