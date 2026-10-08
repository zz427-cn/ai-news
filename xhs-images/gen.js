// 小红书配图生成器：HTML 精确排版 → chromium 截图 1080x1440
const { chromium } = require('playwright');
const path = require('path');

const OUT = '/Users/zz/WorkBuddy/2026-10-07-15-21-30/ai-news/xhs-images';

const BASE = `
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; }
.page { width:1080px; height:1440px; position:relative; overflow:hidden; display:flex; flex-direction:column; }
`;

// 图1 封面
const cover = `
<div class="page" style="background:#191428;">
  <div style="position:absolute; top:-140px; right:-140px; width:520px; height:520px; border-radius:50%; background:#ff3868; opacity:.16;"></div>
  <div style="position:absolute; bottom:-120px; left:-120px; width:440px; height:440px; border-radius:50%; background:#7b5cff; opacity:.2;"></div>
  <div style="position:absolute; top:64px; left:64px; font-size:30px; color:#ff7ba0; font-weight:600; letter-spacing:2px;">✦ AI 玩法分享</div>
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding:0 76px;">
    <div style="font-size:150px; font-weight:900; color:#ff3868; line-height:1;">0元</div>
    <div style="font-size:76px; font-weight:900; color:#ffffff; margin-top:18px; line-height:1.35;">搭了个网站<br>它自己会更新</div>
    <div style="margin-top:34px; font-size:38px; color:#cfc6e8; line-height:1.75;">
      <div style="margin-bottom:10px;">⚡ 每天 09:30 自动抓 AI 热点</div>
      <div style="margin-bottom:10px;">📦 全程托管 · 不用服务器</div>
      <div>🕐 10 分钟跟做 · 不会代码也能行</div>
    </div>
  </div>
  <div style="padding:0 76px 70px;">
    <div style="display:inline-block; background:#ff3868; color:#fff; font-size:34px; font-weight:700; padding:18px 42px; border-radius:999px;">保姆级教程 👉 翻页看</div>
  </div>
</div>`;

// 图2 三步总览
const steps = `
<div class="page" style="background:#fff7f0;">
  <div style="padding:70px 70px 40px;">
    <div style="font-size:26px; color:#ff3868; font-weight:700; letter-spacing:3px;">TUTORIAL · 跟做</div>
    <div style="font-size:62px; font-weight:900; color:#2a2233; margin-top:12px;">只要 3 步，真的</div>
  </div>
  <div style="flex:1; padding:10px 70px; display:flex; flex-direction:column; justify-content:space-evenly;">
    ${[['1', 'Fork 仓库', '把整套网站代码复制到自己账号，点一个按钮的事'],
       ['2', '打开 Pages 开关', 'Settings → Pages → 选 main，网站就上线了'],
       ['3', '启用定时更新', 'Actions 页开启，每天自动抓新闻自动发布']]
      .map(([n, t, d]) => `
      <div style="background:#fff; border-radius:28px; padding:40px 44px; box-shadow:0 8px 30px rgba(255,56,104,.08); display:flex; gap:34px; align-items:center;">
        <div style="width:96px; height:96px; border-radius:50%; background:#ff3868; color:#fff; font-size:52px; font-weight:900; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${n}</div>
        <div>
          <div style="font-size:44px; font-weight:800; color:#2a2233;">${t}</div>
          <div style="font-size:30px; color:#8a8090; margin-top:8px;">${d}</div>
        </div>
      </div>`).join('')}
  </div>
  <div style="padding:0 70px 60px; font-size:28px; color:#b0a8b8; text-align:center;">每一步都有截图，往后翻 →</div>
</div>`;

// 图3-5 通用步骤截图占位框架（后期替换为真实截图区域 + 红框标注说明）
function stepShot(n, title, tipLines) {
  return `
<div class="page" style="background:#f4f6fb;">
  <div style="padding:66px 70px 36px;">
    <div style="font-size:26px; color:#185fa5; font-weight:700; letter-spacing:3px;">STEP ${n}</div>
    <div style="font-size:58px; font-weight:900; color:#1c2333; margin-top:10px;">${title}</div>
  </div>
  <div style="flex:1; margin:0 70px; background:#fff; border-radius:28px; box-shadow:0 10px 36px rgba(24,95,165,.10); display:flex; align-items:center; justify-content:center; border:5px dashed #c3d3ec;">
    <div style="text-align:center; color:#9aa8c0;">
      <div style="font-size:60px;">📸</div>
      <div style="font-size:32px; margin-top:14px; font-weight:600;">此处放你的真实截图</div>
      <div style="font-size:26px; margin-top:8px;">（${title}页面截图）</div>
    </div>
  </div>
  <div style="padding:36px 70px 64px;">
    ${tipLines.map(([mark, txt]) => `
    <div style="background:#e8f0fc; border-radius:18px; padding:22px 30px; margin-bottom:16px; font-size:31px; color:#24425e; display:flex; gap:16px; align-items:flex-start;">
      <span style="color:#e02020; font-weight:900; flex-shrink:0;">${mark}</span><span>${txt}</span>
    </div>`).join('')}
  </div>
</div>`;
}

const shot3 = stepShot(1, 'Fork 仓库', [
  ['①', '打开文章置顶的仓库链接'],
  ['②', '点右上角 Fork → Create fork'],
  ['③', '不用改任何选项，直接确认'],
]);

const shot4 = stepShot(2, '打开网站开关 (Pages)', [
  ['①', 'Settings → Pages 进入设置'],
  ['②', 'Source 选 Deploy from a branch'],
  ['③', 'Branch 选 main / (root)，点 Save'],
]);

const shot5 = stepShot(3, '开启每日自动更新', [
  ['①', '仓库顶部 Actions 标签页'],
  ['②', '点 I understand... 启用按钮'],
  ['③', '左侧选 Update AI news → Run workflow'],
]);

// 图6 尾图
const ending = `
<div class="page" style="background:#12101a;">
  <div style="position:absolute; top:-120px; left:-120px; width:480px; height:480px; border-radius:50%; background:#7b5cff; opacity:.18;"></div>
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding:0 80px; text-align:center;">
    <div style="font-size:34px; color:#9d93b8; letter-spacing:6px;">搞定收工 🎉</div>
    <div style="font-size:72px; font-weight:900; color:#fff; margin-top:30px; line-height:1.4;">明天早上 9:30<br>它会自己更新</div>
    <div style="margin-top:50px; font-size:32px; color:#cfc6e8; line-height:1.9;">
      <div> Fork 教程仓库：评论区置顶</div>
      <div> 做好了记得回来交作业</div>
    </div>
  </div>
  <div style="padding:0 80px 80px; text-align:center;">
    <div style="display:inline-block; border:3px solid #ff3868; color:#ff7ba0; font-size:32px; font-weight:700; padding:16px 46px; border-radius:999px;">点赞收藏 · 不会的时候翻出来看</div>
  </div>
</div>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1440 }, deviceScaleFactor: 1 });
  const pages = [['01-cover', cover], ['02-steps', steps], ['03-fork', shot3], ['04-pages', shot4], ['05-actions', shot5], ['06-ending', ending]];
  for (const [name, html] of pages) {
    await page.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE}</style></head><body>${html}</body></html>`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log('done:', name);
  }
  await browser.close();
})();
