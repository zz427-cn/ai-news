#!/usr/bin/env python3
"""AI 热点新闻站更新脚本
拉取 AIHOT 日报 → 生成归档页 + 更新首页。零第三方依赖，python3 即可跑。
用法：python3 scripts/update.py
"""
import json
import html
import os
import re
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

API = "https://aihot.virxact.com/api/public/daily"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = ROOT / "archive"
SITE_NAME = "AI 热点日报"

TZ = timezone(timedelta(hours=8))  # 北京时间


def fetch_daily():
    req = urllib.request.Request(API, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def esc(s):
    return html.escape(str(s or ""), quote=True)


def hum_time(iso):
    """ISO 时间 → 人话"""
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(TZ)
        now = datetime.now(TZ)
        delta = now - dt
        if delta < timedelta(0):
            delta = timedelta(0)
        if delta < timedelta(hours=1):
            return f"{max(delta.seconds // 60, 1)} 分钟前"
        if delta < timedelta(hours=24) and dt.date() == now.date():
            return dt.strftime("今天 %H:%M")
        if dt.date() == (now - timedelta(days=1)).date():
            return dt.strftime("昨天 %H:%M")
        return dt.strftime("%m-%d %H:%M")
    except Exception:
        return ""


def item_card(it, idx):
    src = it.get("sourceName") or ""
    src_short = re.sub(r"[（(].*?[)）]", "", src).strip() or "来源"
    t = hum_time(it.get("publishedAt") or "")
    return f'''<article class="card">
  <div class="card-meta"><span class="rank">{idx:02d}</span><span class="src">{esc(src_short)}</span>{f'<span class="time">{esc(t)}</span>' if t else ''}</div>
  <h3><a href="{esc(it.get('sourceUrl'))}" target="_blank" rel="noopener noreferrer">{esc(it['title'])}</a></h3>
  <p>{esc(it.get('summary'))}</p>
  <a class="readmore" href="{esc(it.get('sourceUrl'))}" target="_blank" rel="noopener noreferrer">阅读原文 ↗</a>
</article>'''


def section_html(sec, start_idx):
    cards = "\n".join(item_card(it, start_idx + i) for i, it in enumerate(sec["items"]))
    return f'''<section class="board" id="sec-{start_idx}">
  <h2>{esc(sec['label'])}<span class="count">{len(sec['items'])} 条</span></h2>
  <div class="grid">{cards}</div>
</section>'''


def flashes_html(flashes):
    if not flashes:
        return ""
    rows = []
    for f in flashes:
        t = hum_time(f.get("publishedAt") or "")
        rows.append(f'''<li>
  <span class="flash-time">{esc(t)}</span>
  <a href="{esc(f.get('sourceUrl'))}" target="_blank" rel="noopener noreferrer">{esc(f['title'])}</a>
  <span class="flash-src">{esc(re.sub(r'[（(].*?[)）]', '', f.get('sourceName') or '').strip())}</span>
</li>''')
    return f'''<section class="board flashes" id="flashes">
  <h2>快讯<span class="count">{len(flashes)} 条</span></h2>
  <ul class="flash-list">{''.join(rows)}</ul>
</section>'''


def build_page(d, archive_items_html="", is_archive=False):
    """生成完整期次页面"""
    idx = 1
    secs = []
    for sec in d.get("sections", []):
        secs.append(section_html(sec, idx))
        idx += len(sec["items"])
    sections = "\n".join(secs)
    flash = flashes_html(d.get("flashes", []))

    lead = d.get("lead") or {}
    lead_html = ""
    if lead.get("title"):
        lead_html = f'''<div class="lead">
  <div class="lead-tag">今日头条</div>
  <h1>{esc(lead['title'])}</h1>
  <p>{esc(lead.get('leadParagraph'))}</p>
</div>'''

    date = d["date"]
    pretty = f"{date[0:4]} 年 {int(date[5:7])} 月 {int(date[8:10])} 日"

    date = d["date"]
    pretty = f"{date[0:4]} 年 {int(date[5:7])} 月 {int(date[8:10])} 日"
    prefix = "../" if is_archive else ""
    vol_extra = "" if is_archive else " · 最新"

    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{SITE_NAME} · {esc(date)}</title>
<meta name="description" content="AI 行业每日热点精选：模型发布、产品更新、行业动态、论文研究、技巧观点">
<link rel="stylesheet" href="{prefix}assets/style.css">
</head>
<body>
<header>
  <div class="wrap head-row">
    <div class="brand"><a href="{prefix}index.html">{SITE_NAME}</a><span class="slogan">每天 5 分钟，看懂 AI 圈</span></div>
    <nav><a href="{prefix}index.html">首页</a><a href="#flashes">快讯</a><a href="#archive-nav">往期</a></nav>
  </div>
</header>

<div class="wrap">
  <div class="date-bar"><span class="dot"></span>{esc(pretty)}<span class="vol">第 {esc(date)} 期{vol_extra}</span></div>
  {lead_html}
  {sections}
  {flash}
  <section class="board" id="archive-nav"><h2>往期回顾</h2><ul class="arch-list">{archive_items_html}</ul></section>
</div>

<footer>
  <div class="wrap">
    <p>数据来源 <a href="https://aihot.virxact.com" target="_blank" rel="noopener noreferrer">AIHOT</a> · 本站为公开信息聚合，版权归原作者所有</p>
    <p>Powered by GitHub Pages · 每日自动更新</p>
  </div>
</footer>
</body>
</html>'''


def archive_list_html(active_date=None, from_archive=False):
    pages = sorted(ARCHIVE.glob("*.html"), reverse=True)
    if not pages:
        return "<li>暂无往期</li>"
    items = []
    for p in pages[:60]:
        d = p.stem
        active = ' class="active"' if d == active_date else ""
        prefix = "../" if from_archive else ""
        items.append(f'<li{active}><a href="{prefix}archive/{d}.html">{d}</a></li>')
    return "".join(items)


def main():
    if not ARCHIVE.exists():
        ARCHIVE.mkdir()
    d = fetch_daily()
    date = d["date"]
    print(f"拉取成功：{date} 期")

    # 先落盘归档页骨架（不含往期列表），保证后续读取时本期已在目录中
    arch_path = ARCHIVE / f"{date}.html"
    arch_path.write_text(build_page(d, archive_items_html="", is_archive=True), encoding="utf-8")

    # 归档页（带完整往期列表）
    arch_html = build_page(d, archive_items_html=archive_list_html(active_date=date, from_archive=True), is_archive=True)
    arch_path.write_text(arch_html, encoding="utf-8")
    print(f"归档页：{arch_path.relative_to(ROOT)}")

    # 首页 = 最新一期
    index_html = build_page(d, archive_items_html=archive_list_html(active_date=date))
    (ROOT / "index.html").write_text(index_html, encoding="utf-8")
    print(f"首页：index.html（含往期 {len(list(ARCHIVE.glob('*.html')))} 期）")


if __name__ == "__main__":
    main()
