"use strict";

const STORE_KEY = "pm-learning-system-v1";
const DOMAINS = [AI_DOMAIN, ROBOTICS_DOMAIN];
const ICONS = {
  overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',
  modules: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  glossary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  review: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
  interviews: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  iterate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>',
  jd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
};

const STATUS = {
  todo: { label: "未开始", next: "doing", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>' },
  doing: { label: "学习中", next: "mastered", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' },
  mastered: { label: "已掌握", next: "todo", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
};

const VIEWS = [
  { id: "overview", name: "总览", desc: "学习进度、薄弱点与下一步建议", group: "学习流程" },
  { id: "map", name: "知识地图", desc: "按层级浏览知识点，标注优先级、目标层级与 JD 依据", group: "学习流程" },
  { id: "modules", name: "课程大纲", desc: "模块化学习路径，含关键问题与实践任务", group: "学习流程" },
  { id: "glossary", name: "关联学习", desc: "术语自动标注与解释，手动标记新名词并生成补充任务", group: "学习流程" },
  { id: "quiz", name: "成果检验", desc: "生成分层测验，自评结果自动进入复习队列", group: "检验复习" },
  { id: "review", name: "复习迭代", desc: "间隔复习队列，按 1/3/7/14/30 天滚动", group: "检验复习" },
  { id: "interviews", name: "面试题库", desc: "大厂真实面经题目，含回答框架与关联知识点", group: "检验复习" },
  { id: "iterate", name: "迭代机制", desc: "知识库如何随面经、JD 和学习结果持续更新", group: "系统" },
  { id: "jd", name: "JD 参考", desc: "招聘 JD 调研结论与知识地图的对应关系", group: "系统" },
];

let state = loadState();
let currentView = "overview";
let currentQuiz = [];
let expandedModule = null;

function loadState() {
  const saved = localStorage.getItem(STORE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { /* fallthrough */ }
  }
  return {
    domain: "ai",
    progress: { ai: blankProgress(), robotics: blankProgress() },
  };
}

function blankProgress() {
  return { nodes: {}, modules: {}, reviews: {}, quizLog: [], pendingTerms: [], details: {}, qa: {} };
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function domain() {
  return DOMAINS.find((d) => d.id === state.domain) || DOMAINS[0];
}

function prog() {
  if (!state.progress[state.domain]) state.progress[state.domain] = blankProgress();
  if (!Array.isArray(progSafe().pendingTerms)) progSafe().pendingTerms = [];
  if (!progSafe().details) progSafe().details = {};
  if (!progSafe().qa) progSafe().qa = {};
  return state.progress[state.domain];
}

function progSafe() { return state.progress[state.domain]; }

function nodeState(id) {
  if (!prog().nodes[id]) prog().nodes[id] = { status: "todo", mastery: 0 };
  return prog().nodes[id];
}

function nodeDetailsData(n) {
  const p = prog();
  if (p.details[n.id]) return p.details[n.id];
  const base = domain().details && domain().details[n.id];
  if (!base) return null;
  return base.map((g) => ({ g: g.g, items: g.items.map((it) => [it[0], it[1] || 0, 0]) }));
}

function persistDetails(n, groups) {
  prog().details[n.id] = groups;
  saveState();
}

function qaId(m, i) { return `${m.id}-q${i + 1}`; }

function qaState(id) {
  const p = prog();
  if (!p.qa[id]) p.qa[id] = { status: "todo" };
  return p.qa[id];
}

function findNode(id) {
  return domain().nodes.find((n) => n.id === id);
}

function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysUntil(iso) {
  const target = new Date(iso);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function badge(text, cls) {
  return `<span class="badge ${cls}">${esc(text)}</span>`;
}

function glossary() {
  return domain().glossary || [];
}

function linkTerms(escapedText) {
  let out = escapedText;
  const terms = glossary()
    .map((g) => g.term)
    .sort((a, b) => b.length - a.length);
  terms.forEach((t) => {
    const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    out = out.replace(re, `<span class="term" data-term="${esc(t)}">${esc(t)}</span>`);
  });
  return out;
}

function showTerm(term) {
  const g = glossary().find((x) => x.term === term);
  const pop = document.getElementById("termPop");
  if (!g) return;
  const rel = (g.related || []).map((id) => findNode(id)).filter(Boolean);
  pop.innerHTML = `<div class="term-pop-head"><b>${esc(g.term)}</b><button class="btn small" id="termClose">关闭</button></div>
    <p>${linkTerms(esc(g.def))}</p>
    ${rel.length ? `<div class="node-meta">${badge("关联知识点", "layer")}${rel.map((n) => badge(n.name, "p2")).join(" ")}</div>` : ""}
    <div class="node-meta">${badge("来源", "jd")}<span style="font-size:12px;color:var(--muted)">${esc(g.source || "内置术语表")}</span></div>`;
  pop.classList.add("show");
  document.getElementById("termClose").addEventListener("click", () => pop.classList.remove("show"));
}

function addPendingTerm(term) {
  const t = term.trim().replace(/\s+/g, " ");
  if (!t || t.length > 40) { toast("请选择 1-40 字的名词或短语"); return; }
  if (glossary().some((g) => g.term === t)) { toast("该名词已在术语表中，点击正文标注即可查看"); return; }
  if (prog().pendingTerms.some((p) => p.term === t)) { toast("该名词已在待补充清单中"); return; }
  prog().pendingTerms.push({ term: t, addedAt: new Date().toISOString(), done: false });
  saveState();
  toast(`已标记「${t}」，可在关联学习页生成补充提示词`);
}

function init() {
  renderNav();
  renderDomainSwitch();
  bindToolbar();
  buildTermUI();
  render();
}

function renderNav() {
  const nav = document.getElementById("nav");
  const groups = [...new Set(VIEWS.map((v) => v.group))];
  nav.innerHTML = groups.map((g) => `
    <div class="nav-group">
      <div class="nav-group-label">${esc(g)}</div>
      ${VIEWS.filter((v) => v.group === g).map((v) => `
        <button class="nav-item ${v.id === currentView ? "active" : ""}" data-view="${v.id}" title="${esc(v.desc)}">
          <span class="nav-icon">${ICONS[v.id]}</span><span>${esc(v.name)}</span>
        </button>`).join("")}
    </div>`).join("");
  nav.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentView = btn.dataset.view;
      currentQuiz = [];
      renderNav();
      render();
    });
  });
}

function renderDomainSwitch() {
  const box = document.getElementById("domainSwitch");
  box.innerHTML = "<h3>学习领域</h3><div class='domain-seg'>" + DOMAINS.map(
    (d) => `<button class="domain-btn ${d.id === state.domain ? "active" : ""}" data-domain="${d.id}" title="${esc(d.name)}"><span class="d-full">${esc(d.name)}</span><span class="d-short">${d.id === "ai" ? "AI" : "RB"}</span></button>`
  ).join("") + "</div>";
  box.querySelectorAll(".domain-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.domain = btn.dataset.domain;
      currentQuiz = [];
      expandedModule = null;
      saveState();
      renderDomainSwitch();
      render();
    });
  });
}

function bindToolbar() {
  document.getElementById("dataBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("menuPop").classList.toggle("show");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".data-menu")) document.getElementById("menuPop").classList.remove("show");
  });
  document.querySelectorAll("#menuPop button").forEach((b) => b.addEventListener("click", () => document.getElementById("menuPop").classList.remove("show")));
  document.getElementById("exportBtn").addEventListener("click", exportProgress);
  document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", importProgress);
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm(`确定重置「${domain().name}」的全部学习进度吗？此操作不可撤销。`)) {
      state.progress[state.domain] = blankProgress();
      saveState();
      render();
      toast("已重置当前领域进度");
    }
  });
}

function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `learning-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.domain || !data.progress) throw new Error("invalid");
      state = data;
      saveState();
      renderDomainSwitch();
      render();
      toast("进度导入成功");
    } catch (e) {
      toast("导入失败：文件格式不正确");
    }
  };
  reader.readAsText(file);
  ev.target.value = "";
}

function render() {
  const view = VIEWS.find((v) => v.id === currentView);
  document.getElementById("viewTitle").textContent = view.name;
  document.getElementById("viewDesc").textContent = view.desc;
  const s = stats();
  const pct = s.total ? Math.round((s.mastered / s.total) * 100) : 0;
  document.getElementById("topProgress").innerHTML = `<span>${s.mastered}/${s.total} 已掌握</span><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>`;
  const content = document.getElementById("content");
  if (currentView === "overview") content.innerHTML = renderOverview();
  else if (currentView === "map") content.innerHTML = renderMap();
  else if (currentView === "modules") content.innerHTML = renderModules();
  else if (currentView === "glossary") content.innerHTML = renderGlossaryView();
  else if (currentView === "quiz") content.innerHTML = renderQuiz();
  else if (currentView === "review") content.innerHTML = renderReview();
  else if (currentView === "interviews") content.innerHTML = renderInterviews();
  else if (currentView === "iterate") content.innerHTML = renderIterate();
  else if (currentView === "jd") content.innerHTML = renderJD();
  bindViewEvents();
}

function stats() {
  const p = prog();
  const nodes = domain().nodes;
  const mastered = nodes.filter((n) => (p.nodes[n.id] || {}).status === "mastered").length;
  const learning = nodes.filter((n) => (p.nodes[n.id] || {}).status === "doing").length;
  const doneModules = domain().modules.filter((m) => (p.modules[m.id] || {}).done).length;
  const reviews = Object.values(p.reviews);
  const due = reviews.filter((r) => daysUntil(r.nextReview) <= 0).length;
  return { total: nodes.length, mastered, learning, doneModules, totalModules: domain().modules.length, due, reviews: reviews.length };
}

function renderOverview() {
  const s = stats();
  const pct = s.total ? Math.round((s.mastered / s.total) * 100) : 0;
  const modPct = s.totalModules ? Math.round((s.doneModules / s.totalModules) * 100) : 0;
  const p0Left = domain().nodes.filter((n) => n.priority === "P0" && (prog().nodes[n.id] || {}).status !== "mastered");
  const next = p0Left.slice(0, 4).map((n) => `<div class="node-row"><div class="node-main"><div class="node-title">${esc(n.name)} ${badge(n.priority, n.priority.toLowerCase())}</div><div class="node-desc">${esc(n.desc)}</div></div></div>`).join("");
  return `
    <div class="grid cols-4">
      <div class="stat ok"><div class="label">知识点掌握</div><div class="num">${s.mastered}<small> / ${s.total}</small></div><div class="progress-track" style="margin-top:10px"><div class="progress-fill" style="width:${pct}%"></div></div></div>
      <div class="stat"><div class="label">模块完成</div><div class="num">${s.doneModules}<small> / ${s.totalModules}</small></div><div class="progress-track" style="margin-top:10px"><div class="progress-fill" style="width:${modPct}%"></div></div></div>
      <div class="stat"><div class="label">学习中</div><div class="num">${s.learning}</div></div>
      <div class="stat ${s.due > 0 ? "warn" : ""}"><div class="label">待复习</div><div class="num">${s.due}</div></div>
    </div>
    <div class="grid cols-2" style="margin-top:14px">
      <div class="card"><h2>建议下一步</h2>${next || '<div class="empty">P0 知识点已全部掌握，进行领域总测或开始另一领域。</div>'}</div>
      <div class="card"><h2>闭环说明</h2>
        <p><b>定向</b>：以 JD 能力要求为验收标准。<b>收集</b>：知识地图按四层组织，标注 P0-P3 优先级。<b>学习</b>：课程模块控制在 1-3 小时，完成实践任务。<b>检验</b>：分层测验自评，结果自动回流。<b>迭代</b>：间隔复习与薄弱点重学，让掌握度持续收敛。</p>
        <p style="margin-top:10px">数据保存在浏览器本地，可通过左下角导出/导入备份。</p>
      </div>
    </div>`;
}

function renderMap() {
  const f = window.mapFilter || { priority: "all", status: "all" };
  const chip = (key, val, label) => `<button class="chip ${f[key] === val ? "on" : ""}" data-filter="${key}" data-val="${val}">${label}</button>`;
  const toolbar = `<div class="card filter-bar">
    <b>筛选</b>
    <div class="chip-row">${chip("priority", "all", "全部优先级")}${chip("priority", "P0", "P0")}${chip("priority", "P1", "P1")}${chip("priority", "P2", "P2")}</div>
    <div class="chip-row">${chip("status", "all", "全部状态")}${chip("status", "todo", "未开始")}${chip("status", "doing", "学习中")}${chip("status", "mastered", "已掌握")}</div>
  </div>`;
  const match = (n) => (f.priority === "all" || n.priority === f.priority) && (f.status === "all" || (prog().nodes[n.id] || {}).status === f.status || (f.status === "todo" && !prog().nodes[n.id]));
  const body = domain().layers.map((layer) => {
    const nodes = domain().nodes.filter((n) => n.layer === layer.id && match(n));
    if (!nodes.length) return "";
    return `<div class="layer-block">
      <div class="layer-head"><h2>${esc(layer.name)}</h2><span>${esc(layer.desc)}</span></div>
      <div class="card">${nodes.map(nodeRow).join("")}</div>
    </div>`;
  }).join("");
  return toolbar + (body || `<div class="card"><div class="empty">当前筛选没有匹配的知识点。</div></div>`);
}

function nodeRow(n) {
  const st = nodeState(n.id);
  const open = window.expandedDetail === n.id;
  return `<div class="node-row" data-node="${n.id}">
    <div class="node-main">
      <div class="node-title">${esc(n.name)} ${badge(n.priority, n.priority.toLowerCase())} ${badge(n.level, "lvl")} ${badge(domain().layers.find((l) => l.id === n.layer).name, "layer")}</div>
      <div class="node-desc">${linkTerms(esc(n.desc))}</div>
      <div class="node-meta">${n.jd ? badge("JD 依据", "jd") : ""}<span style="font-size:12px;color:var(--muted)">${esc(n.jd || "")}</span></div>
      ${n.sources ? `<div class="node-meta">${badge("信息源", "p2")}<span style="font-size:12px;color:var(--muted)">${esc(n.sources)}</span></div>` : ""}
    </div>
    <button class="btn small ${open ? "primary" : ""}" data-detail="${n.id}">${open ? "收起明细" : "明细"}</button>
    <button class="status-icon st-${st.status}" data-cycle="${n.id}" title="${STATUS[st.status].label}，点击切换">${STATUS[st.status].svg}</button>
    ${open ? renderDetailEditor(n) : ""}
  </div>`;
}

function mmPath(x1, y1, x2, y2, color, w) {
  const mx = (x1 + x2) / 2;
  return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" stroke="${color}" stroke-width="${w}" fill="none"/>`;
}

function renderMindmap(n, groups) {
  const palette = ["#0f766e", "#b45309", "#1d4ed8", "#be185d", "#6d28d9"];
  const rowH = 24, groupGap = 16, W = 780;
  const leaves = groups.reduce((s, g) => s + g.items.length, 0);
  const H = Math.max(180, leaves * (rowH + 4) + groups.length * groupGap + 40);
  const rootX = 18, gX = 180, lX = 330;
  let y = 20;
  let out = [`<text x="${rootX}" y="${H / 2 + 4}" class="mm-root">${esc(n.name)}</text>`];
  groups.forEach((g, gi) => {
    const c = palette[gi % palette.length];
    const gH = g.items.length * (rowH + 4);
    const gy = y + gH / 2;
    out.push(mmPath(rootX + 110, H / 2, gX, gy, c, 1.6));
    out.push(`<text x="${gX}" y="${gy + 4}" class="mm-group" fill="${c}">${esc(g.g)}</text>`);
    g.items.forEach((it, ii) => {
      const ly = y + ii * (rowH + 4) + 12;
      out.push(mmPath(gX + 52, gy, lX, ly, c, 0.8));
      const label = (it[1] ? "★ " : "") + (it[0].length > 34 ? it[0].slice(0, 33) + "…" : it[0]);
      out.push(`<text x="${lX}" y="${ly + 4}" class="mm-item ${it[2] ? "mm-done" : ""}" data-mm="${gi}:${ii}" fill="${it[2] ? "#94a3b8" : "#334155"}">${esc(label)}</text>`);
    });
    y += gH + groupGap;
  });
  return `<svg class="mindmap" viewBox="0 0 ${W} ${H}" width="100%" height="${H}">${out.join("")}</svg>`;
}

function renderDetailEditor(n) {
  const groups = nodeDetailsData(n);
  const mode = window.detailMode || "outline";
  if (!groups) {
    return `<div class="detail-box"><button class="btn small" data-detail-init="${n.id}">初始化明细模板（构成/重点/易混淆/场景）</button></div>`;
  }
  const toolbar = `<div class="detail-toolbar">
    <span class="detail-title">知识点明细</span>
    <button class="btn small ${mode === "outline" ? "primary" : ""}" data-mode="outline">大纲</button>
    <button class="btn small ${mode === "mind" ? "primary" : ""}" data-mode="mind">脑图</button>
    <span class="detail-tip">大纲可编辑；脑图点击条目可标记掌握，★ 为重点</span>
  </div>`;
  if (mode === "mind") return `<div class="detail-box">${toolbar}${renderMindmap(n, groups)}</div>`;
  const body = groups.map((g, gi) => {
    const total = g.items.length;
    const done = g.items.filter((it) => it[2]).length;
    return `<div class="detail-group">
      <div class="detail-group-head"><b>${esc(g.g)}</b><span>${done}/${total}</span><button class="mini-btn" data-group-del="${gi}" title="删除分组">×</button></div>
      ${g.items.map((it, ii) => `<div class="detail-item ${it[2] ? "done" : ""}">
        <button class="mini-btn ok ${it[2] ? "on" : ""}" data-item-done="${gi}:${ii}" title="标记掌握">✓</button>
        <button class="mini-btn star ${it[1] ? "on" : ""}" data-item-star="${gi}:${ii}" title="标为重点">★</button>
        <span class="detail-text ${it[1] ? "star" : ""}">${esc(it[0])}</span>
        <button class="mini-btn" data-item-edit="${gi}:${ii}" title="编辑">✎</button>
        <button class="mini-btn" data-item-del="${gi}:${ii}" title="删除">×</button>
      </div>`).join("")}
      <input class="detail-input" data-add-input="${gi}" placeholder="新增条目，回车保存">
    </div>`;
  }).join("");
  return `<div class="detail-box">${toolbar}${body}<div class="quiz-actions"><button class="btn small" data-group-add>新增分组</button></div></div>`;
}

function renderModules() {
  return domain().modules.map((m) => {
    const done = (prog().modules[m.id] || {}).done;
    const open = expandedModule === m.id;
    const nodeTags = m.nodes.map((id) => ` ${badge(findNode(id) ? findNode(id).name : id, "layer")}`).join("");
    const qas = domain().qaBank[m.id] || (m.questions || []).map((q) => ({ q }));
    const qaDone = qas.filter((qa, i) => qaState(qaId(m, i)).status === "done").length;
    return `<div class="module-card" data-module="${m.id}">
      <div class="module-head">
        <input type="checkbox" class="checkbox" data-module-done="${m.id}" ${done ? "checked" : ""}>
        <div class="grow">
          <div class="node-title">${esc(m.name)} ${badge(m.priority, m.priority.toLowerCase())} ${badge(m.hours, "lvl")} ${badge(`QA ${qaDone}/${qas.length}`, "p2")}${done ? badge("已完成", "status-done") : ""}</div>
          <div class="node-desc">${linkTerms(esc(m.goal))}${nodeTags}</div>
        </div>
        <button class="btn small" data-toggle="${m.id}">${open ? "收起" : "展开"}</button>
      </div>
      ${open ? `<div class="module-body">
        <div class="qa"><b>关键问题 QA 清单</b><br>答案由调研预生成，可编辑补充；勾选表示已掌握。</div>
        ${qas.map((qa, i) => {
          const id = qaId(m, i);
          const st = qaState(id);
          const ans = st.answer != null ? st.answer : (qa.a || "（尚未预生成，可点击编辑补充）");
          return `<div class="qa-row ${st.status === "done" ? "done" : ""}">
            <input type="checkbox" class="checkbox" data-qa-done="${id}" ${st.status === "done" ? "checked" : ""}>
            <div class="node-main">
              <div class="qa-q">${i + 1}. ${linkTerms(esc(qa.q))}</div>
              <div class="quiz-a" style="display:none" id="qa-a-${id}">${esc(ans)}</div>
              <div class="qa-edit" style="display:none" id="qa-e-${id}">
                <textarea class="qa-textarea" id="qa-t-${id}">${esc(ans)}</textarea>
                <div class="quiz-actions"><button class="btn primary small" data-qa-save="${id}">保存</button><button class="btn small" data-qa-cancel="${id}">取消</button></div>
              </div>
              <div class="quiz-actions">
                <button class="btn small" data-qa-toggle="${id}">展开答案</button>
                <button class="btn small" data-qa-edit="${id}">编辑</button>
                ${st.answer != null ? `<button class="btn small" data-qa-reset="${id}">重置预生成答案</button>` : ""}
                <button class="btn small" data-qa-regen="${id}" data-q="${esc(qa.q)}" data-a="${esc(ans)}">重新生成</button>
              </div>
            </div>
          </div>`;
        }).join("")}
        <div class="task-box"><b>实践任务：</b>${esc(m.task)}</div>
        <div class="qa" style="color:var(--muted)"><b>完成标准：</b>QA 清单全部勾选，完成实践任务，并通过测验（正确率不低于 80%）。</div>
      </div>` : ""}
    </div>`;
  }).join("");
}

function pickQuizQuestions(count) {
  const pool = [...domain().quizzes];
  const weighted = [];
  pool.forEach((q) => {
    const node = findNode(q.node);
    const st = nodeState(q.node);
    let w = 1;
    if (node.priority === "P0") w += 2;
    if (st.status !== "mastered") w += 2;
    for (let i = 0; i < w; i++) weighted.push(q);
  });
  const picked = [];
  const seen = new Set();
  while (picked.length < count && weighted.length) {
    const q = weighted[Math.floor(Math.random() * weighted.length)];
    if (!seen.has(q.q)) { seen.add(q.q); picked.push(q); }
    weighted.splice(weighted.indexOf(q), 1);
  }
  return picked;
}

function renderQuiz() {
  if (!currentQuiz.length) {
    return `<div class="card">
      <h2>生成分层测验</h2>
      <p>题目来自知识点的 L1-L4 分层题库，优先抽取 P0 和未掌握知识点。作答后自评「会 / 模糊 / 不会」，结果会自动更新知识点状态并安排复习。</p>
      <div class="quiz-actions"><button class="btn primary" id="genQuiz">生成 8 题测验</button><button class="btn" id="genQuiz20">生成 20 题总测</button></div>
    </div>`;
  }
  return currentQuiz.map((q, i) => {
    const node = findNode(q.node);
    return `<div class="quiz-item" data-quiz="${i}">
      <div class="node-title">${i + 1}. ${esc(q.q)} ${badge(q.level, "lvl")} ${badge(node ? node.name : "", "layer")}</div>
      <div class="quiz-a" id="answer-${i}" style="display:none">${linkTerms(esc(q.a))}</div>
      <div class="quiz-actions">
        <button class="btn" data-reveal="${i}">显示答案</button>
        <button class="btn grade-pass" data-grade="${i}" data-val="pass">会</button>
        <button class="btn grade-fuzzy" data-grade="${i}" data-val="fuzzy">模糊</button>
        <button class="btn grade-fail" data-grade="${i}" data-val="fail">不会</button>
      </div>
      <div class="quiz-result" id="result-${i}"></div>
    </div>`;
  }).join("") + `<div class="quiz-actions"><button class="btn" id="regenQuiz">重新生成</button></div>`;
}

function applyGrade(nodeId, val) {
  const st = nodeState(nodeId);
  if (val === "pass") {
    st.mastery = Math.min(5, st.mastery + 1);
    if (st.mastery >= 4) st.status = "mastered";
    else if (st.status === "todo") st.status = "doing";
  } else if (val === "fuzzy") {
    if (st.status === "todo") st.status = "doing";
  } else {
    st.status = "doing";
    st.mastery = 0;
  }
  scheduleReview(nodeId, val);
  prog().quizLog.push({ node: nodeId, val, at: new Date().toISOString() });
  saveState();
}

function scheduleReview(nodeId, val) {
  const intervals = [1, 3, 7, 14, 30];
  const r = prog().reviews[nodeId] || { intervalIdx: 0, streak: 0 };
  if (val === "pass") {
    r.streak += 1;
    r.intervalIdx = Math.min(intervals.length - 1, r.intervalIdx + 1);
  } else if (val === "fuzzy") {
    r.streak = 0;
  } else {
    r.streak = 0;
    r.intervalIdx = 0;
  }
  r.nextReview = addDays(val === "fail" ? 1 : intervals[r.intervalIdx]);
  prog().reviews[nodeId] = r;
}

function renderReview() {
  const entries = Object.entries(prog().reviews)
    .map(([nodeId, r]) => ({ nodeId, ...r, due: daysUntil(r.nextReview) }))
    .sort((a, b) => a.due - b.due);
  if (!entries.length) {
    return `<div class="card"><div class="empty"><div class="big">✓</div>复习队列为空。<br>完成「成果检验」后，薄弱知识点会自动进入这里。</div></div>`;
  }
  return `<div class="card"><h2>复习队列（共 ${entries.length} 项）</h2>` + entries.map((r) => {
    const node = findNode(r.nodeId);
    const q = domain().quizzes.find((x) => x.node === r.nodeId);
    const dueText = r.due <= 0 ? `今天到期` : `${fmtDate(r.nextReview)}（${r.due} 天后）`;
    return `<div class="due-item">
      <div class="node-main">
        <div class="node-title">${esc(node ? node.name : r.nodeId)} ${badge(r.due <= 0 ? dueText : "未到期", r.due <= 0 ? "p0" : "p3")} ${badge("掌握度 " + (nodeState(r.nodeId).mastery) + "/5", "lvl")}</div>
        <div class="node-desc">${q ? esc(q.q) : "回忆该知识点的核心概念、适用场景与常见误区。"}</div>
        <div class="quiz-a" style="display:none" id="rev-answer-${r.nodeId}">${q ? linkTerms(esc(q.a)) : "用自己的话讲清这个知识点，并说出一个应用场景和一个限制。"}</div>
        <div class="quiz-actions">
          <button class="btn" data-rev-reveal="${r.nodeId}">显示参考答案</button>
          <button class="btn grade-pass" data-rev-grade="${r.nodeId}" data-val="pass">记得</button>
          <button class="btn grade-fuzzy" data-rev-grade="${r.nodeId}" data-val="fuzzy">犹豫</button>
          <button class="btn grade-fail" data-rev-grade="${r.nodeId}" data-val="fail">忘了</button>
        </div>
      </div>
    </div>`;
  }).join("") + "</div>";
}

function renderJD() {
  return `<div class="card" style="margin-bottom:14px"><h2>调研结论</h2><p>${esc(domain().jdSummary)}</p></div>
  <div class="card"><h2>代表岗位</h2>${domain().jds.map((j) => `
    <div class="jd-item"><h3>${esc(j.company)} · ${esc(j.role)}</h3><p>${esc(j.points)}</p></div>`).join("")}</div>`;
}

function renderInterviews() {
  const items = domain().interviews || [];
  return `<div class="card" style="margin-bottom:14px">
    <h2>题库说明</h2>
    <p>题目来自公开面经与大厂真题合集（见「迭代机制」页的信息源），按产品经理视角改写为「面试官在考察什么 + 回答框架」。先自己作答，再展开参考框架，最后到关联知识点补弱。</p>
  </div>
  <div class="card">
    <p class="glossary-hint" style="margin-bottom:6px">先自己作答，再展开回答框架；薄弱术语点击即可跳看解释。</p>
    <h2>大厂真题（${items.length} 道）</h2>
  ${items.map((it, i) => `
    <div class="jd-item">
      <div class="node-title">${i + 1}. ${esc(it.q)} ${badge(it.company, "jd")} ${badge(it.level, "lvl")}</div>
      <div class="node-meta">${(it.nodes || []).map((id) => badge(findNode(id) ? findNode(id).name : id, "layer")).join(" ")}</div>
        <div class="node-desc" style="margin-top:6px"><b>考察点：</b>${linkTerms(esc(it.point))}</div>
      <div class="quiz-a" style="display:none" id="itv-${i}"><b>回答框架</b><br>${linkTerms(esc(it.framework))}</div>
      <div class="quiz-actions"><button class="btn" data-itv="${i}">展开回答框架</button></div>
    </div>`).join("")}
  </div>`;
}

function renderIterate() {
  const d = domain();
  return `
  <div class="grid cols-2">
    <div class="card"><h2>四条自迭代回路</h2>
      <div class="jd-item"><h3>1. 面经回路</h3><p>定期补充大厂真题和面经（建议每两周一次）。新题先归类到知识点；若无对应知识点，说明知识地图有缺口，先补节点再补课程和测验。面试题出现频率直接驱动知识点优先级升降。</p></div>
      <div class="jd-item"><h3>2. JD 回路</h3><p>每轮求职季（春秋招前后）重新调研目标岗位 JD，对比当前知识地图。新增高频要求升级为 P0/P1；连续两轮消失的要求降级；跨公司共性要求沉淀为新模块。</p></div>
      <div class="jd-item"><h3>3. 学习回路</h3><p>测验「不会」和复习「忘了」的知识点自动回流队列；连续失败说明课程设计有问题，需要拆小模块、补充例子或更换信息源，而不是单纯重读。</p></div>
      <div class="jd-item"><h3>4. 信息源回路</h3><p>基础层知识绑定权威信息源（官方文档、经典教材、开源项目）。每月检查版本变化：API、模型、协议（如 MCP）更新后同步更新知识点描述和题目答案。</p></div>
    </div>
    <div>
      <div class="card" style="margin-bottom:14px"><h2>当前版本</h2>
        <p><b>领域：</b>${esc(d.name)}<br><b>数据版本：</b>${esc(d.version)}<br><b>知识点：</b>${d.nodes.length} 个 · <b>课程模块：</b>${d.modules.length} 个 · <b>面试题：</b>${(d.interviews || []).length} 道</p>
      </div>
      <div class="card"><h2>维护节奏</h2>
        <div class="jd-item"><h3>每两周</h3><p>补充 5-10 道新面经，合并同义题，更新出题频率标签；检查是否暴露知识地图缺口。</p></div>
        <div class="jd-item"><h3>每月</h3><p>检查权威信息源版本（模型 API、协议、开源项目 Release）；更新过期描述与答案；补充新的基础层细节。</p></div>
        <div class="jd-item"><h3>每季 / 求职季</h3><p>重跑 JD 调研，重新标注 P0-P3；复盘课程完成率和测验通过率，重排模块顺序。</p></div>
      </div>
      <div class="card" style="margin-top:14px"><h2>如何更新数据</h2>
        <p>知识库是纯数据文件：<code>${d.id === "ai" ? "app/assets/data-ai.js" : "app/assets/data-robotics.js"}</code>。新增知识点改 <code>nodes</code>，新增课程改 <code>modules</code>，新增真题改 <code>interviews</code>，新增测验改 <code>quizzes</code>，然后更新 <code>version</code> 日期。用编辑器保存后刷新页面即可生效，学习进度不受影响。</p>
      </div>
      <div class="card" style="margin-top:14px"><h2>两种使用方式</h2>
        <div class="jd-item"><h3>自动化更新（定时）</h3><p>由 Codex 心跳任务每两周执行一次：调研最新面经、JD 与权威信息源，对比现有数据文件，有实质新知识就补充 nodes/modules/quizzes/interviews 并更新版本号，跑语法检查和页面验证；无实质变化则静默结束，不打扰。</p></div>
        <div class="jd-item"><h3>定制化更新（按需）</h3><p>随时在对话中提需求，例如「补充具身智能在医疗场景的应用」「加一个 MCP 开发者课程」。由智能体调研后按同一数据结构入库：先定知识点和优先级，再设计课程、测验和面试题，最后更新版本并验证。</p></div>
      </div>
    </div>
  </div>`;
}

function renderGlossaryView() {
  const pending = prog().pendingTerms.filter((p) => !p.done);
  const q = (window.glossaryQuery || "").trim().toLowerCase();
  const items = glossary().filter((g) => !q || g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q));
  return `
  <div class="card" style="margin-bottom:14px">
    <div class="glossary-head">
      <h2>术语浏览</h2>
      <div class="quiz-actions">
        <input id="glossarySearch" placeholder="搜索术语或解释，如 Attention、遥操作..." value="${esc(window.glossaryQuery || "")}">
        <button class="btn small" id="glossarySearchBtn">搜索</button>
      </div>
    </div>
    <p class="glossary-hint">正文中的术语已自动标注，点击即可查看解释。遇到新名词，选中文字后点「标记名词」加入下方待补充清单。</p>
    ${items.map((g) => `<div class="jd-item"><h3>${esc(g.term)}</h3><p>${linkTerms(esc(g.def))}</p>
    <div class="node-meta">${(g.related || []).map((id) => badge(findNode(id) ? findNode(id).name : id, "p2")).join(" ")}</div></div>`).join("") || `<div class="empty">没有匹配的术语。</div>`}
  </div>
  <div class="card"><h2>待补充名词（${pending.length}）</h2>
    ${pending.length ? pending.map((p, i) => `
      <div class="due-item"><div class="node-main">
        <div class="node-title">${esc(p.term)} ${badge(new Date(p.addedAt).toLocaleDateString(), "p3")}</div>
        <div class="quiz-a" style="display:none" id="pt-${i}">请为「${esc(domain().name)}」学习系统补充术语「${esc(p.term)}」：
1. 用 3-5 句话解释该术语，面向产品经理，避免数学推导。
2. 说明它和当前正在学习的知识点的关系，以及为什么值得现在了解。
3. 列出关联知识点编号，如果没有对应节点，建议新增节点并标注优先级。
4. 补充一条可考察该术语的面试题和回答要点。
5. 更新对应数据文件的 glossary 数组和 version 字段，并验证页面。</div>
        <div class="quiz-actions">
          <button class="btn" data-pt-reveal="${i}">生成补充提示词</button>
          <button class="btn primary small" data-pt-copy="${i}" data-term="${esc(p.term)}">复制提示词</button>
          <button class="btn small" data-pt-done="${esc(p.term)}">标记已补充</button>
        </div>
      </div></div>`).join("") : `<div class="empty">暂无待补充名词。学习中选中文字即可标记。</div>`}
  </div>`;
}

function buildTermUI() {
  if (!document.getElementById("termPop")) {
    const pop = document.createElement("div");
    pop.id = "termPop";
    pop.className = "term-pop";
    document.body.appendChild(pop);
  }
  if (!document.getElementById("markFloat")) {
    const btn = document.createElement("button");
    btn.id = "markFloat";
    btn.className = "mark-float";
    btn.textContent = "标记名词";
    btn.style.display = "none";
    document.body.appendChild(btn);
  }
  document.addEventListener("click", (ev) => {
    const t = ev.target.closest(".term");
    if (t) { ev.stopPropagation(); showTerm(t.dataset.term); return; }
    if (!ev.target.closest("#termPop")) document.getElementById("termPop").classList.remove("show");
  });
  let markTimer = null;
  document.addEventListener("selectionchange", () => {
    clearTimeout(markTimer);
    markTimer = setTimeout(updateMarkFloat, 120);
  });
  document.addEventListener("scroll", () => {
    const float = document.getElementById("markFloat");
    if (float) float.style.display = "none";
  }, true);
  document.getElementById("markFloat").addEventListener("click", (ev) => {
    addPendingTerm(ev.target.dataset.term || "");
    ev.target.style.display = "none";
    window.getSelection().removeAllRanges();
    if (currentView === "glossary") render();
  });
}

function updateMarkFloat() {
  const float = document.getElementById("markFloat");
  if (!float) return;
  const sel = window.getSelection();
  const text = sel && !sel.isCollapsed ? sel.toString().trim() : "";
  const content = document.querySelector(".content");
  const node = sel && sel.anchorNode;
  const insideContent = !!(node && content && content.contains(node) && node.nodeType === 3);
  const inFormField = !!(node && node.parentElement && node.parentElement.closest("input, textarea, select, .term-pop, .menu-pop"));
  if (text && text.length <= 40 && insideContent && !inFormField && sel.rangeCount) {
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    float.style.left = Math.min(window.innerWidth - 110, Math.max(8, rect.left)) + "px";
    float.style.top = Math.max(8, rect.top - 42) + "px";
    float.style.display = "block";
    float.dataset.term = text;
  } else {
    float.style.display = "none";
    delete float.dataset.term;
  }
}

function bindViewEvents() {
  document.querySelectorAll("[data-cycle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const st = nodeState(btn.dataset.cycle);
      st.status = STATUS[st.status].next;
      if (st.status === "mastered") st.mastery = Math.max(st.mastery, 4);
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-detail]").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.expandedDetail = window.expandedDetail === btn.dataset.detail ? null : btn.dataset.detail;
      render();
    });
  });
  const dNode = window.expandedDetail ? findNode(window.expandedDetail) : null;
  if (dNode) {
    document.querySelectorAll("[data-detail-init]").forEach((btn) => {
      btn.addEventListener("click", () => {
        persistDetails(dNode, [
          { g: "构成", items: [] },
          { g: "重点", items: [] },
          { g: "易混淆", items: [] },
          { g: "场景", items: [] },
        ]);
        render();
      });
    });
    document.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => { window.detailMode = btn.dataset.mode; render(); });
    });
    document.querySelectorAll("[data-item-done]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const g = nodeDetailsData(dNode); const [gi, ii] = btn.dataset.itemDone.split(":").map(Number);
        g[gi].items[ii][2] = g[gi].items[ii][2] ? 0 : 1; persistDetails(dNode, g); render();
      });
    });
    document.querySelectorAll("[data-item-star]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const g = nodeDetailsData(dNode); const [gi, ii] = btn.dataset.itemStar.split(":").map(Number);
        g[gi].items[ii][1] = g[gi].items[ii][1] ? 0 : 1; persistDetails(dNode, g); render();
      });
    });
    document.querySelectorAll("[data-item-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const g = nodeDetailsData(dNode); const [gi, ii] = btn.dataset.itemEdit.split(":").map(Number);
        const text = prompt("编辑条目", g[gi].items[ii][0]);
        if (text != null && text.trim()) { g[gi].items[ii][0] = text.trim(); persistDetails(dNode, g); render(); }
      });
    });
    document.querySelectorAll("[data-item-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const g = nodeDetailsData(dNode); const [gi, ii] = btn.dataset.itemDel.split(":").map(Number);
        g[gi].items.splice(ii, 1); persistDetails(dNode, g); render();
      });
    });
    document.querySelectorAll("[data-group-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const g = nodeDetailsData(dNode); g.splice(Number(btn.dataset.groupDel), 1); persistDetails(dNode, g); render();
      });
    });
    const ga = document.querySelector("[data-group-add]");
    if (ga) ga.addEventListener("click", () => {
      const name = prompt("分组名称", "新分组");
      if (name && name.trim()) { const g = nodeDetailsData(dNode); g.push({ g: name.trim(), items: [] }); persistDetails(dNode, g); render(); }
    });
    document.querySelectorAll("[data-add-input]").forEach((input) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && input.value.trim()) {
          const g = nodeDetailsData(dNode);
          g[Number(input.dataset.addInput)].items.push([input.value.trim(), 0, 0]);
          persistDetails(dNode, g); render();
        }
      });
    });
    document.querySelectorAll("[data-mm]").forEach((el) => {
      el.addEventListener("click", () => {
        const g = nodeDetailsData(dNode); const [gi, ii] = el.dataset.mm.split(":").map(Number);
        g[gi].items[ii][2] = g[gi].items[ii][2] ? 0 : 1; persistDetails(dNode, g); render();
      });
    });
  }
  document.querySelectorAll("[data-qa-done]").forEach((cb) => {
    cb.addEventListener("change", () => {
      qaState(cb.dataset.qaDone).status = cb.checked ? "done" : "todo";
      saveState(); render();
    });
  });
  document.querySelectorAll("[data-qa-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const el = document.getElementById(`qa-a-${btn.dataset.qaToggle}`);
      el.style.display = el.style.display === "none" ? "block" : "none";
      btn.textContent = el.style.display === "none" ? "展开答案" : "收起答案";
    });
  });
  document.querySelectorAll("[data-qa-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById(`qa-e-${btn.dataset.qaEdit}`).style.display = "block";
    });
  });
  document.querySelectorAll("[data-qa-cancel]").forEach((btn) => {
    btn.addEventListener("click", () => { document.getElementById(`qa-e-${btn.dataset.qaCancel}`).style.display = "none"; });
  });
  document.querySelectorAll("[data-qa-save]").forEach((btn) => {
    btn.addEventListener("click", () => {
      qaState(btn.dataset.qaSave).answer = document.getElementById(`qa-t-${btn.dataset.qaSave}`).value;
      saveState(); render(); toast("答案已保存");
    });
  });
  document.querySelectorAll("[data-qa-reset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      delete qaState(btn.dataset.qaReset).answer;
      saveState(); render(); toast("已恢复预生成答案");
    });
  });
  document.querySelectorAll("[data-qa-regen]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = `请重新回答以下课程问题，要求面向产品经理、结论先行、3-5 句话、指出产品决策含义：\n问题：${btn.dataset.q}\n当前答案：${btn.dataset.a}`;
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast("重新生成提示词已复制，发给智能体即可"), () => toast("复制失败，请手动编辑"));
      else toast("浏览器不支持复制，请手动编辑");
    });
  });
  document.querySelectorAll("[data-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      window.mapFilter = window.mapFilter || { priority: "all", status: "all" };
      window.mapFilter[chip.dataset.filter] = chip.dataset.val;
      render();
    });
  });
  document.querySelectorAll("[data-module-done]").forEach((cb) => {
    cb.addEventListener("change", () => {
      prog().modules[cb.dataset.moduleDone] = { done: cb.checked };
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      expandedModule = expandedModule === btn.dataset.toggle ? null : btn.dataset.toggle;
      render();
    });
  });
  const gen = document.getElementById("genQuiz");
  if (gen) gen.addEventListener("click", () => { currentQuiz = pickQuizQuestions(8); render(); });
  const gen20 = document.getElementById("genQuiz20");
  if (gen20) gen20.addEventListener("click", () => { currentQuiz = pickQuizQuestions(20); render(); });
  const regen = document.getElementById("regenQuiz");
  if (regen) regen.addEventListener("click", () => { currentQuiz = pickQuizQuestions(8); render(); });
  document.querySelectorAll("[data-reveal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const el = document.getElementById(`answer-${btn.dataset.reveal}`);
      el.style.display = el.style.display === "none" ? "block" : "none";
    });
  });
  document.querySelectorAll("[data-grade]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.grade);
      applyGrade(currentQuiz[i].node, btn.dataset.val);
      const label = { pass: "已记录：掌握，已安排复习", fuzzy: "已记录：模糊，近期重点复习", fail: "已记录：未掌握，明天复习并建议重学" }[btn.dataset.val];
      document.getElementById(`result-${i}`).textContent = label;
      btn.closest(".quiz-actions").querySelectorAll("button").forEach((b) => (b.disabled = false));
      btn.disabled = true;
    });
  });
  document.querySelectorAll("[data-rev-reveal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const el = document.getElementById(`rev-answer-${btn.dataset.revReveal}`);
      el.style.display = el.style.display === "none" ? "block" : "none";
    });
  });
  document.querySelectorAll("[data-rev-grade]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyGrade(btn.dataset.revGrade, btn.dataset.val);
      render();
      toast("复习结果已记录");
    });
  });
  document.querySelectorAll("[data-itv]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const el = document.getElementById(`itv-${btn.dataset.itv}`);
      el.style.display = el.style.display === "none" ? "block" : "none";
      btn.textContent = el.style.display === "none" ? "展开回答框架" : "收起回答框架";
    });
  });
  const gsBtn = document.getElementById("glossarySearchBtn");
  if (gsBtn) gsBtn.addEventListener("click", () => {
    window.glossaryQuery = document.getElementById("glossarySearch").value;
    render();
  });
  const gsInput = document.getElementById("glossarySearch");
  if (gsInput) gsInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { window.glossaryQuery = gsInput.value; render(); } });
  document.querySelectorAll("[data-pt-reveal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const el = document.getElementById(`pt-${btn.dataset.ptReveal}`);
      el.style.display = el.style.display === "none" ? "block" : "none";
    });
  });
  document.querySelectorAll("[data-pt-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = document.getElementById(`pt-${btn.dataset.ptCopy}`).innerText;
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast("提示词已复制"), () => toast("复制失败，请手动选择文本"));
      else toast("浏览器不支持自动复制，请手动选择");
    });
  });
  document.querySelectorAll("[data-pt-done]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = prog().pendingTerms.find((x) => x.term === btn.dataset.ptDone);
      if (p) p.done = true;
      saveState();
      render();
      toast("已移入已补充列表");
    });
  });
}

init();
