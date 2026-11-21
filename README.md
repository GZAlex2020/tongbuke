# 穗学伴

广州中小学同步学习资料。纯静态、零外联：语音使用浏览器 Web Speech API，笔顺使用本地矢量数据，不含任何音频、图片或网络字体。

## 入口与构建

- `index.template.html`：唯一入口模板，手工编辑这个文件。
- `index.html`：由构建脚本生成，GitHub Pages 实际服务的分文件入口。
- `dist/穗学伴.html`：自包含离线单文件，CSS、JS 与全部字库已内联，可直接双击打开。

```bash
node build.js
```

构建脚本会计算所有资源的 MD5 内容 hash（取前 8 位）并替换模板中的 `__VER__`。任一资源变化都会生成新的 URL 版本，避免浏览器混用新旧脚本。

离线字库按年级拆包：`js/hanzi-g1~g4.js`、原有的 `hanzi-grade56.js` 与 `hanzi-junior.js`。首屏只加载笔顺引擎，空闲时仅预取当前年级小包；切换年级时按需补包。若增删了教学用字库源数据，运行 `node tools/split-hanzi.js` 重新生成年级包，再执行 `node build.js`。

## 版本回溯

历史单文件快照不再留在仓库根目录。使用 git tag 与 Release 管理版本：

```bash
git tag -a v1.6.1 -m "首屏懒加载改造"
git push --tags
# 如需对外分发离线单文件：
gh release create v1.6.1 dist/穗学伴.html
```

## 红线

1. 不得修改 `js/data-core.js`、`js/data-text.js`、`hanzi-*.js` 中的教学内容；只改加载方式。
2. 不得引入 Vite/webpack 等构建期重依赖，保持 `node build.js` 单命令可用。
3. 页脚免责声明、教材非原文标注、analytics 默认零外联（`ENDPOINT = ''`）不得删除。
4. 不得把课本扫描图、PDF、MP3、视频塞进仓库；不得用 Pages 跑收费、报名或收集手机号表单。
5. 不得把 `穗学伴-v*.html` 历史快照重新堆回根目录。
