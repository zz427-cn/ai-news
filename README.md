# ai-news · AI 热点日报站

每日自动更新的 AI 热点新闻静态站。零框架、零依赖（python3 标准库）、零成本（GitHub Pages）。

## 工作原理

```
AIHOT 日报 API → scripts/update.py → index.html（最新期）+ archive/YYYY-MM-DD.html（归档）
                     ↑
        GitHub Actions 每天 UTC 01:30（北京 09:30）自动拉取、生成、提交
```

## 本地手动更新

```bash
python3 scripts/update.py
```

## 本地预览

```bash
cd ai-news
python3 -m http.server 8000 --bind 127.0.0.1
# 浏览器打开 http://127.0.0.1:8000
```

## 上线（三步）

1. GitHub 新建** Public** 仓库（如 `ai-news`），不要勾选初始化：https://github.com/new

```bash
cd ai-news
git init && git add . && git commit -m "init: ai-news site"
git branch -M main
git remote add origin git@github.com:<你的用户名>/ai-news.git
git push -u origin main
```

2. 仓库 **Settings → Pages → Source 选 "GitHub Actions"**
   注意：本仓库的 Actions 有两个——`update.yml`（每日拉新闻+部署）。Pages 部署由 `update.yml` 提交后自动触发？不是——需要 Pages 工作流。**最简做法**：Settings → Pages → Source 选 "GitHub Actions" 后，`update.yml` 的 git push 会自动触发 Pages 构建（GitHub 官方 pages-build-action 侦听 main 分支）。

   > 实际上选 "GitHub Actions" 后需要部署工作流。为省事可直接选 **"Deploy from a branch" → main / root**，push 即部署，无需额外配置。

3. 访问 `https://<用户名>.github.io/ai-news/`

## 每日自动更新原理

`.github/workflows/update.yml`：
- `cron: 30 1 * * *`（北京 09:30）拉最新日报
- 重新生成首页 + 归档页
- 有变化就 commit + push → Pages 自动重新部署

手动触发：仓库 Actions 页 → Update AI news → Run workflow。

## 目录结构

```
ai-news/
├── index.html              # 首页 = 最新一期
├── archive/                # 往期归档（每日一页）
│   └── 2026-10-07.html
├── assets/style.css        # 全站样式
├── scripts/update.py       # 生成器（本地/云端同一套）
└── .github/workflows/update.yml
```

## 数据来源

[AIHOT](https://aihot.virxact.com) 公开日报 API（模型/产品/行业/论文/观点 五版块 + 快讯）。内容版权归原作者，本站仅做聚合展示。

## 隐私提醒

上线前确认：仓库为 Public，页面内容全部来自公开新闻聚合，不含个人信息。
