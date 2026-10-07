# ai-news · AI 热点日报站

每日自动更新的 AI 热点新闻静态站。零框架、零依赖（python3 标准库）、零成本（GitHub Pages）。

**[在线示例 →](https://zz427-cn.github.io/ai-news/)**

## ⚡ 3 步拥有你的同款（Fork 路线，无需命令行）

1. **Fork 本仓库**：点右上角 Fork → Create fork（什么都不用改）
2. **开通网站**：你的仓库 → Settings → Pages → Source 选 **Deploy from a branch** → Branch 选 **main / (root)** → Save，等 1-2 分钟，顶部会出现 `https://<你的用户名>.github.io/ai-news/`
3. **开启每日自动更新**：仓库顶部 Actions 标签页 → 若提示禁用状态，点 **I understand my workflows, go ahead and enable them** → 左侧选 **Update AI news** → 如无绿色 ✓ 记录，点 **Run workflow** 手动跑一次

之后每天北京 09:30 自动抓取最新 AI 日报、生成页面、提交并部署，全程无人值守。

> Fork 后前 60 天 Actions 正常定时运行；GitHub 对超过 60 天无活动的仓库会暂停定时任务，届时随便点一次 Run workflow 或 push 任意提交即可恢复。

## 📐 工作原理

```
AIHOT 日报 API → scripts/update.py → index.html（最新期）+ archive/YYYY-MM-DD.html（归档）
                     ↑
        GitHub Actions 每天 UTC 01:30（北京 09:30）自动拉取、生成、提交
```

- `.github/workflows/update.yml`：定时任务，有变化才 commit
- `scripts/update.py`：生成器，零第三方依赖，python3 标准库即可跑
- Pages 采用 Deploy from a branch，push 到 main 即部署

## 🔧 自定义

| 想改什么 | 怎么改 |
|---|---|
| 站名 / 口号 | `scripts/update.py` 顶部 `SITE_NAME` 及模板中 slogan 文案 |
| 配色 | `assets/style.css` 顶部 `:root` 变量 |
| 更新时间 | `.github/workflows/update.yml` 中 `cron`（UTC 时区，北京 = UTC+8） |
| 数据源 | `update.py` 中 `API` 常量（现为 AIHOT 日报） |

## 📂 目录结构

```
ai-news/
├── index.html              # 首页 = 最新一期
├── archive/                # 往期归档（每日一页，自动累积）
├── assets/style.css        # 全站样式
├── scripts/update.py       # 生成器（本地/云端同一套）
└── .github/workflows/update.yml
```

## 🛠 本地开发

```bash
# 手动更新一期
python3 scripts/update.py

# 本地预览
python3 -m http.server 8000 --bind 127.0.0.1
```

## 📰 数据来源

[AIHOT](https://aihot.virxact.com) 公开日报 API（模型/产品/行业/论文/观点 五版块 + 快讯）。内容版权归原作者，本站仅做聚合展示，如有侵权请联系删除。

## 📄 License

MIT — 随便用，欢迎 Star。
