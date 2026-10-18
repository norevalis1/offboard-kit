const DEFAULT_SYSTEMS = ["m365", "hardware", "shared"];
const STORE_KEY = "ok-state-v1";
const RING_LEN = 2 * Math.PI * 19;

const ICONS = {
  cloud: '<path d="M17.5 19H8a5 5 0 1 1 1.4-9.8A6 6 0 0 1 21 11.5a4 4 0 0 1-3.5 7.5z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
  badge: '<rect x="4" y="6" width="16" height="14" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M8.5 17a4 4 0 0 1 7 0M10 3h4v3h-4z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3M17 6l3 3M14 9l2 2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  flag: '<path d="M4 21V4M4 4h12l-2 4 2 4H4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
};
const svg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;

const $ = (sel) => document.querySelector(sel);
const els = {
  form: $("#form"),
  segmented: $(".segmented"),
  name: $("#name"),
  date: $("#date"),
  ticket: $("#ticket"),
  systems: $("#systems"),
  title: $("#out-title"),
  meta: $("#out-meta"),
  badge: $("#mode-badge"),
  ring: $("#ring"),
  ringFill: $(".ring-fill"),
  ringPct: $("#ring-pct"),
  checklist: $("#checklist"),
  empty: $("#empty"),
  toast: $("#toast"),
};

/* ---------- State (saved in this browser only) ---------- */

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
}
let state = Object.assign({ mode: "offboarding", name: "", date: "", ticket: "", systems: DEFAULT_SYSTEMS, done: {}, collapsed: {} }, load());
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}

/* ---------- Form ---------- */

for (const sys of SYSTEMS) {
  const label = document.createElement("label");
  label.className = "sys";
  label.innerHTML = `<input type="checkbox" value="${sys.id}"><span class="sys-inner"><span class="sys-ico">${svg(sys.icon)}</span>${sys.label}</span>`;
  els.systems.appendChild(label);
}

function applyStateToForm() {
  document.querySelector(`input[name="mode"][value="${state.mode}"]`).checked = true;
  els.segmented.dataset.mode = state.mode;
  els.name.value = state.name;
  els.date.value = state.date || new Date().toISOString().slice(0, 10);
  els.ticket.value = state.ticket;
  for (const box of els.systems.querySelectorAll("input")) box.checked = state.systems.includes(box.value);
}

function readForm() {
  state.mode = document.querySelector('input[name="mode"]:checked').value;
  state.name = els.name.value;
  state.date = els.date.value;
  state.ticket = els.ticket.value;
  state.systems = [...els.systems.querySelectorAll("input:checked")].map((i) => i.value);
  els.segmented.dataset.mode = state.mode;
}

/* ---------- Checklist ---------- */

function person() {
  return state.name.trim() || "the employee";
}

function fill(step) {
  return step.replaceAll("{name}", person());
}

// Returns [{id, heading, icon, steps: [{key, text}]}] for the current state.
function buildSections() {
  const m = state.mode;
  const general = { id: "general", heading: "Before you start", icon: "flag", raw: GENERAL[m] };
  const chosen = SYSTEMS.filter((s) => state.systems.includes(s.id)).map((s) => ({ id: s.id, heading: s.label, icon: s.icon, raw: s[m] }));
  if (!chosen.length) return [];
  return [general, ...chosen].map((sec) => ({
    ...sec,
    steps: sec.raw.map((text, i) => ({ key: `${m}:${sec.id}:${i}`, text: fill(text) })),
  }));
}

function titleText() {
  const who = state.name.trim();
  const kind = state.mode === "offboarding" ? "Offboarding" : "Onboarding";
  return who ? `${kind} · ${who}` : `${kind} checklist`;
}

function metaText() {
  const parts = [];
  if (state.date) {
    const d = new Date(state.date + "T00:00");
    parts.push(d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" }));
  }
  if (state.ticket.trim()) parts.push(state.ticket.trim());
  return parts.join("  ·  ");
}

let lastSig = "";
function render() {
  const sections = buildSections();
  els.title.textContent = titleText();
  els.meta.textContent = metaText();
  els.badge.textContent = state.mode === "offboarding" ? "Offboarding" : "Onboarding";
  els.badge.classList.toggle("on", state.mode === "onboarding");
  els.empty.hidden = sections.length > 0;
  els.checklist.innerHTML = "";
  // Only animate groups in when the structure changes, not on every keystroke.
  const sig = state.mode + "|" + state.systems.join(",");
  els.checklist.classList.toggle("static", sig === lastSig);
  lastSig = sig;

  let n = 0;
  sections.forEach((sec, si) => {
    const group = document.createElement("div");
    group.className = "group";
    group.dataset.id = sec.id;
    group.style.setProperty("--d", si);
    if (state.collapsed[sec.id]) group.classList.add("collapsed");

    const head = document.createElement("button");
    head.type = "button";
    head.className = "group-head";
    head.setAttribute("aria-expanded", String(!state.collapsed[sec.id]));
    head.innerHTML = `<span class="sys-ico">${svg(sec.icon)}</span><span class="group-name"></span><span class="group-count"></span><span class="chev">${svg("chevron")}</span>`;
    head.querySelector(".group-name").textContent = sec.heading;
    head.addEventListener("click", () => {
      const collapsed = group.classList.toggle("collapsed");
      head.setAttribute("aria-expanded", String(!collapsed));
      state.collapsed[sec.id] = collapsed;
      save();
    });

    const bar = document.createElement("div");
    bar.className = "group-bar";
    bar.innerHTML = "<span></span>";

    const body = document.createElement("div");
    body.className = "group-body";
    const ul = document.createElement("ul");
    for (const step of sec.steps) {
      n += 1;
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `<label><span class="num">${String(n).padStart(2, "0")}</span><input type="checkbox"><span class="box">${svg("check")}</span><span class="item-text"></span></label>`;
      li.querySelector(".item-text").textContent = step.text;
      const box = li.querySelector("input");
      box.checked = !!state.done[step.key];
      box.addEventListener("change", () => {
        if (box.checked) state.done[step.key] = true;
        else delete state.done[step.key];
        save();
        updateProgress(true);
      });
      ul.appendChild(li);
    }
    body.appendChild(ul);
    group.append(head, bar, body);
    els.checklist.appendChild(group);
  });

  updateProgress(false);
}

let wasComplete = false;
function updateProgress(fromUser) {
  let total = 0;
  let done = 0;
  for (const group of els.checklist.querySelectorAll(".group")) {
    const boxes = group.querySelectorAll(".item input");
    const d = [...boxes].filter((b) => b.checked).length;
    total += boxes.length;
    done += d;
    group.querySelector(".group-count").textContent = `${d}/${boxes.length}`;
    group.querySelector(".group-bar span").style.width = `${boxes.length ? (d / boxes.length) * 100 : 0}%`;
    group.classList.toggle("complete", boxes.length > 0 && d === boxes.length);
  }
  const pct = total ? Math.round((done / total) * 100) : 0;
  els.ringFill.style.strokeDashoffset = RING_LEN * (1 - pct / 100);
  els.ringPct.textContent = `${pct}%`;
  const complete = total > 0 && done === total;
  els.ring.classList.toggle("done", complete);
  if (fromUser) {
    els.ring.classList.remove("bump");
    void els.ring.offsetWidth;
    els.ring.classList.add("bump");
    if (complete && !wasComplete) {
      confetti();
      toast("Checklist complete. Nice work.");
    }
  }
  wasComplete = complete;
}

/* ---------- Export ---------- */

function asText(markdown) {
  const lines = [markdown ? `# ${titleText()}` : titleText()];
  const meta = metaText();
  if (meta) lines.push(meta);
  lines.push("");
  for (const sec of buildSections()) {
    lines.push(markdown ? `## ${sec.heading}` : sec.heading.toUpperCase());
    for (const step of sec.steps) lines.push(`${markdown ? "- " : ""}[${state.done[step.key] ? "x" : " "}] ${step.text}`);
    lines.push("");
  }
  return lines.join("\n").trim() + "\n";
}

function slug() {
  const who = state.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return [state.mode, who, state.date].filter(Boolean).join("-");
}

$("#copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(asText(false));
    toast("Copied to clipboard");
  } catch {
    toast("Couldn't copy. Try the Markdown download instead.");
  }
});
$("#download").addEventListener("click", () => {
  const blob = new Blob([asText(true)], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${slug() || "checklist"}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("Markdown file downloaded");
});
$("#print").addEventListener("click", () => window.print());
$("#reset").addEventListener("click", () => {
  for (const sec of buildSections()) for (const step of sec.steps) delete state.done[step.key];
  save();
  render();
  toast("Ticks cleared");
});
$("#select-all").addEventListener("click", () => setAllSystems(true));
$("#select-none").addEventListener("click", () => setAllSystems(false));
function setAllSystems(on) {
  for (const box of els.systems.querySelectorAll("input")) box.checked = on;
  onFormChange();
}

/* ---------- Form wiring ---------- */

let typingTimer;
function onFormChange(e) {
  readForm();
  save();
  // Re-render text fields after a short pause so typing stays smooth.
  if (e && e.target.matches('input[type="text"]')) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(render, 120);
  } else {
    render();
  }
}
els.form.addEventListener("input", onFormChange);

/* ---------- Toast ---------- */

let toastTimer;
function toast(msg) {
  els.toast.innerHTML = `${svg("check")}<span></span>`;
  els.toast.querySelector("span").textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

/* ---------- Confetti ---------- */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function confetti() {
  if (reduceMotion) return;
  const canvas = $("#confetti");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const colors = ["#4f6bff", "#8a5cff", "#12a36d", "#ffbd2e", "#ff6b8b"];
  const rect = els.ring.getBoundingClientRect();
  const ox = rect.left + rect.width / 2;
  const oy = rect.top + rect.height / 2;
  const parts = Array.from({ length: 140 }, () => {
    const a = Math.random() * Math.PI * 2;
    const v = 4 + Math.random() * 9;
    return { x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: Math.random() * 6 + 4, rot: Math.random() * 6, vr: Math.random() * 0.3 - 0.15, c: colors[(Math.random() * colors.length) | 0], life: 1 };
  });
  (function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = false;
    for (const p of parts) {
      p.vy += 0.28; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.009;
      if (p.life <= 0 || p.y > innerHeight + 20) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      ctx.restore();
    }
    if (alive) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })();
}

/* ---------- Page effects ---------- */

// Sticky nav background once the page scrolls.
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Theme toggle (remembers the choice).
$("#theme-toggle").addEventListener("click", () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("ok-theme", root.dataset.theme); } catch {}
});

// Fade elements in as they scroll into view, staggered within each group.
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("in");
    io.unobserve(entry.target);
    if (entry.target.matches(".stats")) countUp(entry.target);
  }
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.setProperty("--rd", `${siblings.indexOf(el) * 80}ms`);
  io.observe(el);
});

// Hero stat counters.
function countUp(root) {
  for (const dt of root.querySelectorAll("[data-count]")) {
    const target = +dt.dataset.count;
    const pre = dt.dataset.prefix || "";
    const suf = dt.dataset.suffix || "";
    if (reduceMotion) { dt.textContent = pre + target + suf; continue; }
    const start = performance.now();
    const step = (t) => {
      const k = Math.min((t - start) / 1400, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      dt.textContent = pre + Math.round(target * eased) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

// Spotlight that follows the cursor on the "how it works" cards.
document.querySelectorAll(".step").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

applyStateToForm();
readForm();
render();
