import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/400-italic.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import './style.css';
import { slides } from './slides.js';

const TOTAL = slides.length;
const pad = (n) => String(n).padStart(2, '0');
const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('co-deck') : null;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Sestavení slidů
// ---------------------------------------------------------------------------

function headHTML(s, i) {
  if (s.head === false) return '';
  return `<div class="head">
    <p class="l">Coordinated omission · KIV/PTE</p>
    <p class="c">${s.section || ''}</p>
    <p class="r">${pad(i + 1)} / ${pad(TOTAL)}</p>
    <span class="rule"></span>
    <span class="bar" style="width:${((i + 1) / TOTAL) * 100}%"></span>
  </div>`;
}

// nadpis rozdělený na slova (animace „zaostření“)
function splitWords(el) {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
          const w = document.createElement('span');
          w.className = 'w';
          w.style.setProperty('--i', i++);
          w.textContent = part;
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SUP') {
        walk(child);
      }
    });
  };
  walk(el);
}

// čísla, která se „načítají“ od nuly (data-count)
const fmt = (v, dec) => {
  const [int, frac] = v.toFixed(dec).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return frac ? `${grouped},${frac}` : grouped;
};
function prepCount(el) {
  const raw = el.textContent.trim();
  const num = parseFloat(raw.replace(/\s| /g, '').replace(',', '.'));
  const dec = raw.includes(',') ? raw.split(',')[1].length : 0;
  el._count = { num, dec, final: fmt(num, dec) };
  el.textContent = el._count.final;
  el.setAttribute('aria-label', raw);
}
function runCount(el) {
  if (el._running) return;
  const { num, dec, final } = el._count;
  if (reduceMotion) return (el.textContent = final);
  el._running = true;
  const t0 = performance.now();
  const dur = 1300;
  const tick = (t) => {
    if (!el._running) return;
    const p = Math.min((t - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = p < 1 ? fmt(num * e, dec) : final;
    if (p < 1) requestAnimationFrame(tick);
    else el._running = 'done';
  };
  requestAnimationFrame(tick);
}
function resetCount(el) {
  el._running = false;
  el.textContent = fmt(0, el._count.dec);
}

function buildSlide(s, i) {
  const sec = document.createElement('section');
  sec.className = `slide ${s.cls}`;
  sec.dataset.id = s.id;
  sec.setAttribute('aria-roledescription', 'slide');
  sec.setAttribute('aria-label', `${i + 1} / ${TOTAL}`);
  sec.innerHTML = s.html + headHTML(s, i);
  sec.querySelectorAll('[data-split]').forEach(splitWords);
  sec.querySelectorAll('[data-count]').forEach(prepCount);
  const steps = [...sec.querySelectorAll('[data-step]')].map((e) => +e.dataset.step);
  s.steps = steps.length ? Math.max(...steps) : 0;
  return sec;
}

function buildStage() {
  const stage = document.createElement('div');
  stage.className = 'stage';
  slides.forEach((s, i) => stage.appendChild(buildSlide(s, i)));
  stage._cur = -1;
  return stage;
}

function fit(stage, box, center = true) {
  const scale = Math.min(box.clientWidth / 1920, box.clientHeight / 1080);
  stage.style.transform = center ? `scale(${scale}) translate(-50%, -50%)` : `scale(${scale})`;
}

const TR_CLASSES = ['slide', 'wipe', 'zoom'].flatMap((t) =>
  ['fwd', 'back'].flatMap((d) => [`in-${t}-${d}`, `out-${t}-${d}`])
);

function show(stage, idx, step, { animate = true } = {}) {
  const els = [...stage.children];
  const prev = stage._cur;
  const changed = prev !== idx;
  if (changed) {
    const dir = idx > prev ? 'fwd' : 'back';
    const tr = (dir === 'fwd' ? slides[idx].tr : slides[prev]?.tr) || 'slide';
    els.forEach((el) => {
      el.classList.remove('leaving', ...TR_CLASSES);
      clearTimeout(el._t);
    });
    const inEl = els[idx];
    const outEl = els[prev];
    // restart CSS animací uvnitř slidu (nadpisy, čáry)
    inEl.classList.remove('active');
    void inEl.offsetWidth;
    inEl.classList.add('active');
    if (animate && prev >= 0 && !reduceMotion) {
      inEl.classList.add(`in-${tr}-${dir}`);
      outEl.classList.add('leaving', `out-${tr}-${dir}`);
      outEl.classList.remove('active');
      const dur = tr === 'wipe' ? 950 : 800;
      outEl._t = setTimeout(() => outEl.classList.remove('leaving', ...TR_CLASSES), dur);
      inEl._t = setTimeout(() => inEl.classList.remove(...TR_CLASSES), dur);
    } else if (outEl) {
      outEl.classList.remove('active');
    }
    els.forEach((el, i) => el.setAttribute('aria-hidden', i === idx ? 'false' : 'true'));
    // vynulovat čísla na ostatních slidech
    els.forEach((el, i) => i !== idx && el.querySelectorAll('[data-count]').forEach(resetCount));
    stage._cur = idx;
  }
  const cur = els[idx];
  cur.querySelectorAll('[data-step]').forEach((e) => e.classList.toggle('on', +e.dataset.step <= step));
  cur.querySelectorAll('[data-count]').forEach((el) => {
    const host = el.closest('[data-step]');
    const visible = !host || host.classList.contains('on');
    if (visible) {
      if (!el._running) {
        resetCount(el);
        setTimeout(() => runCount(el), changed ? 350 : 120);
      }
    } else resetCount(el);
  });
}

function notesHTML(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\[KLIK\]/g, '<span class="klik">KLIK</span>');
}

// ---------------------------------------------------------------------------
// Navigace
// ---------------------------------------------------------------------------

let idx = 0;
let step = 0;
const listeners = [];

function parseHash() {
  const m = location.hash.match(/^#\/(\d+)(?:\/(\d+))?/);
  if (!m) return [0, 0];
  const i = Math.min(Math.max(+m[1] - 1, 0), TOTAL - 1);
  return [i, Math.min(+(m[2] || 0), slides[i].steps || 0)];
}

function go(i, st, { broadcast = true, push = true } = {}) {
  idx = Math.min(Math.max(i, 0), TOTAL - 1);
  step = Math.min(Math.max(st, 0), slides[idx].steps || 0);
  const hash = `#/${idx + 1}${step ? '/' + step : ''}`;
  if (push && location.hash !== hash) history.replaceState(null, '', location.pathname + location.search + hash);
  listeners.forEach((fn) => fn(idx, step));
  if (broadcast && channel) channel.postMessage({ idx, step });
}
const next = () => (step < (slides[idx].steps || 0) ? go(idx, step + 1) : idx < TOTAL - 1 && go(idx + 1, 0));
const prev = () => (step > 0 ? go(idx, step - 1) : idx > 0 && go(idx - 1, slides[idx - 1].steps || 0));

function bindKeys(extra = {}) {
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    const k = e.key;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0, 0);
    else if (k === 'End') go(TOTAL - 1, 0);
    else if (k === 'f' || k === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
    } else if (extra[k.toLowerCase()]) extra[k.toLowerCase()]();
  });
  channel?.addEventListener('message', (e) => go(e.data.idx, e.data.step, { broadcast: false }));
  window.addEventListener('hashchange', () => {
    const [i, st] = parseHash();
    if (i !== idx || st !== step) go(i, st, { push: false });
  });
}

// ---------------------------------------------------------------------------
// Pohled pro publikum
// ---------------------------------------------------------------------------

function audience() {
  const viewport = document.createElement('div');
  viewport.className = 'viewport';
  const stage = buildStage();
  viewport.appendChild(stage);
  const progress = document.createElement('div');
  progress.className = 'progress';
  const hint = document.createElement('div');
  hint.className = 'hint';
  hint.textContent = '← → krok · F celá obrazovka · N poznámky · P režim řečníka';
  const overlay = document.createElement('div');
  overlay.className = 'notes-overlay';
  app.append(viewport, progress, hint, overlay);

  const resize = () => fit(stage, viewport);
  window.addEventListener('resize', resize);
  resize();

  const allSteps = () => slides.reduce((a, s) => a + (s.steps || 0) + 1, 0);
  listeners.push((i, st) => {
    show(stage, i, st);
    const done = slides.slice(0, i).reduce((a, s) => a + (s.steps || 0) + 1, 0) + st + 1;
    progress.style.width = `${(done / allSteps()) * 100}%`;
    overlay.innerHTML = `<div class="meta">${pad(i + 1)} / ${pad(TOTAL)} · krok ${st}/${slides[i].steps || 0} · ~${slides[i].sec} s</div>${notesHTML(slides[i].notes)}`;
    document.title = `${pad(i + 1)} · Coordinated Omission a pasti průměrných časů`;
  });
  setTimeout(() => hint.classList.add('gone'), 4000);

  // klik / tap: pravé dvě třetiny dál, levá třetina zpět; swipe
  viewport.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    e.clientX > window.innerWidth / 3 ? next() : prev();
  });
  let tx = null;
  viewport.addEventListener('touchstart', (e) => (tx = e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchend', (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
      e.preventDefault();
    }
    tx = null;
  });

  const openPresenter = () =>
    window.open(`${location.pathname}?presenter${location.hash}`, 'co-presenter', 'width=1280,height=800');
  bindKeys({ n: () => overlay.classList.toggle('show'), p: openPresenter });

  const [i, st] = parseHash();
  go(i, st, { broadcast: false });
}

// ---------------------------------------------------------------------------
// Režim řečníka (klávesa P; synchronizace přes BroadcastChannel)
// ---------------------------------------------------------------------------

function presenter() {
  const totalBudget = slides.reduce((a, s) => a + s.sec, 0);
  const mmss = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`;
  app.innerHTML = `
  <div class="presenter">
    <div class="bar">
      <span class="timer">00:00</span>
      <button type="button" class="reset">Start / reset</button>
      <span class="pos"></span>
      <span class="budget"></span>
      <span style="margin-left:auto">← → krok · Home/End</span>
    </div>
    <div class="col"><div class="label">Aktuální slide</div><div class="frame cur"></div></div>
    <div class="col"><div class="label">Další krok</div><div class="frame nxt"></div><div class="notes"></div></div>
  </div>`;
  const cur = buildStage();
  const nxt = buildStage();
  const curBox = app.querySelector('.frame.cur');
  const nxtBox = app.querySelector('.frame.nxt');
  curBox.appendChild(cur);
  nxtBox.appendChild(nxt);
  const notes = app.querySelector('.notes');
  const pos = app.querySelector('.pos');
  const budget = app.querySelector('.budget');
  const timer = app.querySelector('.timer');
  const resize = () => {
    fit(cur, curBox, false);
    fit(nxt, nxtBox, false);
  };
  window.addEventListener('resize', resize);
  new ResizeObserver(resize).observe(curBox);
  resize();

  let t0 = null;
  const btn = app.querySelector('.reset');
  btn.addEventListener('click', () => {
    t0 = Date.now();
    btn.blur(); // mezerník pak neresetuje čas, ale posouvá slidy
  });
  setInterval(() => {
    if (!t0) return;
    const s = Math.floor((Date.now() - t0) / 1000);
    timer.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
    timer.classList.toggle('over', s > 600);
  }, 250);

  listeners.push((i, st) => {
    show(cur, i, st, { animate: false });
    let ni = i;
    let ns = st + 1;
    if (ns > (slides[i].steps || 0)) {
      ni = Math.min(i + 1, TOTAL - 1);
      ns = ni === i ? st : 0;
    }
    show(nxt, ni, ns, { animate: false });
    pos.textContent = `Slide ${pad(i + 1)} / ${pad(TOTAL)} · krok ${st}/${slides[i].steps || 0}`;
    const elapsed = slides.slice(0, i).reduce((a, s) => a + s.sec, 0);
    budget.textContent = `plán: ${mmss(elapsed)} z ${mmss(totalBudget)}`;
    notes.innerHTML = `<div class="meta">${slides[i].id} · ~${slides[i].sec} s</div>${notesHTML(slides[i].notes)}`;
  });
  bindKeys();
  const [i, st] = parseHash();
  go(i, st, { broadcast: false });
}

// ---------------------------------------------------------------------------
// Tisk / PDF: ?print → všechny slidy ve finálním stavu pod sebou, pak Ctrl+P
// ---------------------------------------------------------------------------

function printView() {
  document.body.classList.add('print');
  const wrap = document.createElement('div');
  wrap.className = 'print-wrap';
  slides.forEach((s, i) => {
    const stage = document.createElement('div');
    stage.className = 'stage';
    const el = buildSlide(s, i);
    el.classList.add('active');
    el.querySelectorAll('[data-step]').forEach((e) => e.classList.add('on'));
    stage.appendChild(el);
    wrap.appendChild(stage);
  });
  app.appendChild(wrap);
  document.title = 'Coordinated Omission a pasti průměrných časů (PDF)';
}

if (params.has('print')) printView();
else if (params.has('presenter')) presenter();
else audience();
