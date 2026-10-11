(function () {
  var API = "https://aihot.news/api/v1/dailies/latest";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function humTime(iso) {
    try {
      var dt = new Date(iso);
      var now = new Date();
      var diff = (now - dt) / 60000;
      if (diff < 1) return "刚刚";
      if (diff < 60) return Math.floor(diff) + " 分钟前";
      if (dt.toDateString() === now.toDateString()) return "今天 " + dt.toTimeString().slice(0, 5);
      var y = new Date(now - 864e5);
      if (dt.toDateString() === y.toDateString()) return "昨天 " + dt.toTimeString().slice(0, 5);
      return (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.toTimeString().slice(0, 5);
    } catch (e) { return ""; }
  }

  function itemUrl(it) {
    var l = it.links || {};
    return l.original || l.aihot || "#";
  }

  function srcName(it) {
    var s = it.source || {};
    var n = s.name || "来源";
    return n.replace(/[（(].*?[)）]/g, "").trim() || "来源";
  }

  function card(it, idx) {
    var t = humTime(it.publishedAt || it.discoveredAt);
    return '<article class="card">'
      + '<div class="card-meta"><span class="rank">' + String(idx).padStart(2, "0") + '</span>'
      + '<span class="src">' + esc(srcName(it)) + '</span>'
      + (t ? '<span class="time">' + esc(t) + '</span>' : '') + '</div>'
      + '<h3><a href="' + esc(itemUrl(it)) + '" target="_blank" rel="noopener noreferrer">' + esc(it.title) + '</a></h3>'
      + (it.summary ? '<p>' + esc(it.summary) + '</p>' : '')
      + '<a class="readmore" href="' + esc(itemUrl(it)) + '" target="_blank" rel="noopener noreferrer">阅读原文 ↗</a>'
      + '</article>';
  }

  function section(sec, startIdx) {
    var cards = sec.items.map(function (it, i) { return card(it, startIdx + i); }).join("\n");
    return '<section class="board"><h2>' + esc(sec.label) + '<span class="count">' + sec.items.length + ' 条</span></h2>'
      + '<div class="grid">' + cards + '</div></section>';
  }

  function flashes(list) {
    if (!list || !list.length) return "";
    var rows = list.map(function (f) {
      return '<li><span class="flash-time">' + esc(humTime(f.publishedAt || f.discoveredAt)) + '</span>'
        + '<a href="' + esc(itemUrl(f)) + '" target="_blank" rel="noopener noreferrer">' + esc(f.title) + '</a>'
        + '<span class="flash-src">' + esc(srcName(f)) + '</span></li>';
    }).join("");
    return '<section class="board flashes" id="flashes"><h2>快讯<span class="count">' + list.length + ' 条</span></h2>'
      + '<ul class="flash-list">' + rows + '</ul></section>';
  }

  function render(d) {
    var main = document.getElementById("live-content");
    if (!main) return;
    var idx = 1, html = "";
    (d.sections || []).forEach(function (sec) {
      html += section(sec, idx);
      idx += sec.items.length;
    });
    html += flashes(d.flashes);
    main.innerHTML = html;
    var bar = document.getElementById("date-bar");
    if (bar) {
      bar.querySelector(".vol").textContent = "第 " + d.date + " 期 · 实时";
    }
    var st = document.getElementById("sync-status");
    if (st) { st.textContent = "已实时更新 " + new Date().toTimeString().slice(0, 5); st.classList.add("ok"); }
  }

  fetch(API)
    .then(function (r) { return r.json(); })
    .then(function (payload) { render(payload.report || payload); })
    .catch(function (e) {
      var st = document.getElementById("sync-status");
      if (st) st.textContent = "实时拉取失败，显示的是最近一次归档";
    });
})();
