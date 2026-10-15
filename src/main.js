import '@fontsource-variable/archivo';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/instrument-serif/400-italic.css';
import './style.css';
import { slides } from './slides.js';

const TOTAL = slides.length;
const pad = (n) => String(n).padStart(2, '0');
const app = document.getElementById('app');
const isPresenter = new URLSearchParams(location.search).has('presenter');
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('co-deck') : null;

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function marksHTML() {
  const xs = [64, 512, 960, 1408, 1856];
  const ys = [40, 1040];
  return `<div class="marks">${ys
    .map((y) => xs.map((x) => `<i style="left:${x}px;top:${y}px"></i>`).join(''))
    .join('')}</div>`;
}

function footHTML(s, i) {
  const num = `<p class="kicker foot-r">${pad(i + 1)} / ${pad(TOTAL)}</p>`;
  if (s.foot === 'none') return '';
  if (s.foot === 'num') return `<div class="foot">${num}</div>`;
  return `<div class="foot"><span class="rule"></span><p class="kicker foot-l">${s.section || ''}</p>${num}</div>`;
}

// rozdělí text na slova a písmena (animace „rise“)
function splitText(el) {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const w = document.createElement('span');
          w.className = 'w';
          [...part].forEach((c) => {
            const ch = document.createElement('span');
            ch.className = 'ch';
            ch.style.setProperty('--i', i++);
            ch.textContent = c;
            w.appendChild(ch);
          });
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

// číslice „protočí“ válečky od 0 k cílové hodnotě
function rollDigits(el) {
  const text = el.textContent;
  el.textContent = '';
  el.classList.add('roll');
  el.setAttribute('aria-label', text);
  let k = 0;
  [...text].forEach((c) => {
    if (/\d/.test(c)) {
      const d = document.createElement('span');
      d.className = 'rd';
      d.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span');
      s.className = 'rs';
      s.style.setProperty('--t', c);
      s.style.setProperty('--k', k++);
      s.innerHTML = '0123456789'
        .split('')
        .map((x) => `<span>${x}</span>`)
        .join('');
      d.appendChild(s);
      el.appendChild(d);
    } else {
      const t = document.createElement('span');
      t.setAttribute('aria-hidden', 'true');
      t.textContent = c === ' ' ? ' ' : c;
      el.appendChild(t);
    }
  });
}

function buildSlide(s, i) {
  const sec = document.createElement('section');
  sec.className = `slide ${s.cls}`;
  sec.dataset.id = s.id;
  sec.setAttribute('aria-roledescription', 'slide');
  sec.setAttribute('aria-label', `${i + 1} / ${TOTAL}`);
  sec.innerHTML = (s.cls === 'paper' ? marksHTML() : '') + s.html + footHTML(s, i);
  sec.querySelectorAll('[data-split]').forEach(splitText);
  sec.querySelectorAll('[data-roll]').forEach(rollDigits);
  const steps = [...sec.querySelectorAll('[data-step]')].map((e) => +e.dataset.step);
  s.steps = steps.length ? Math.max(...steps) : 0;
  return sec;
}

function buildStage() {
  const stage = document.createElement('div');
  stage.className = 'stage';
  slides.forEach((s, i) => stage.appendChild(buildSlide(s, i)));
  return stage;
}

function fit(stage, box, center = true) {
  const w = box.clientWidth;
  const h = box.clientHeight;
  const scale = Math.min(w / 1920, h / 1080);
  if (center) {
    stage.style.transform = `scale(${scale}) translate(-50%, -50%)`;
    stage.style.transformOrigin = '0 0';
    stage.style.left = '50%';
    stage.style.top = '50%';
    // translate je za scale → posun v souřadnicích stage
  } else {
    stage.style.transform = `scale(${scale})`;
  }
}

function show(stage, idx, step) {
  [...stage.children].forEach((el, i) => {
    const active = i === idx;
    if (active && !el.classList.contains('active')) el.classList.add('active');
    if (!active) el.classList.remove('active');
    el.setAttribute('aria-hidden', active ? 'false' : 'true');
    if (active) {
      el.querySelectorAll('[data-step]').forEach((e) => e.classList.toggle('on', +e.dataset.step <= step));
    }
  });
}

function notesHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\[KLIK\]/g, '<span class="klik">KLIK</span>');
}

// ---------------------------------------------------------------------------
// Navigation state
// ---------------------------------------------------------------------------

let idx = 0;
let step = 0;
const listeners = [];

function parseHash() {
  const m = location.hash.match(/^#\/(\d+)(?:\/(\d+))?/);
  if (!m) return [0, 0];
  const i = Math.min(Math.max(+m[1] - 1, 0), TOTAL - 1);
  const st = Math.min(+(m[2] || 0), slides[i].steps || 0);
  return [i, st];
}

function go(i, st, { broadcast = true, push = true } = {}) {
  idx = Math.min(Math.max(i, 0), TOTAL - 1);
  step = Math.min(Math.max(st, 0), slides[idx].steps || 0);
  const hash = `#/${idx + 1}${step ? '/' + step : ''}`;
  if (push && location.hash !== hash) history.replaceState(null, '', location.pathname + location.search + hash);
  listeners.forEach((fn) => fn(idx, step));
  if (broadcast && channel) channel.postMessage({ idx, step });
}

function next() {
  if (step < (slides[idx].steps || 0)) go(idx, step + 1);
  else if (idx < TOTAL - 1) go(idx + 1, 0);
}
function prev() {
  if (step > 0) go(idx, step - 1);
  else if (idx > 0) go(idx - 1, slides[idx - 1].steps || 0);
}

function bindKeys(extra = {}) {
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0, 0);
    else if (k === 'End') go(TOTAL - 1, 0);
    else if (k === 'f' || k === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
    } else if (extra[k]) extra[k]();
  });
  channel?.addEventListener('message', (e) => go(e.data.idx, e.data.step, { broadcast: false }));
  window.addEventListener('hashchange', () => {
    const [i, st] = parseHash();
    if (i !== idx || st !== step) go(i, st, { push: false });
  });
}

// ---------------------------------------------------------------------------
// Audience view
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

  listeners.push((i, st) => {
    show(stage, i, st);
    const done = slides.slice(0, i).reduce((a, s) => a + (s.steps || 0) + 1, 0) + st + 1;
    const all = slides.reduce((a, s) => a + (s.steps || 0) + 1, 0);
    progress.style.width = `${(done / all) * 100}%`;
    overlay.innerHTML = `<div class="meta">${pad(i + 1)} / ${pad(TOTAL)} · krok ${st}/${slides[i].steps || 0} · ~${slides[i].sec} s</div>${notesHTML(slides[i].notes)}`;
    document.title = `${pad(i + 1)} · Coordinated Omission a pasti průměrných časů`;
  });

  setTimeout(() => hint.classList.add('gone'), 5000);

  // klik / tap: pravá polovina dál, levá zpět; swipe
  viewport.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    if (e.clientX > window.innerWidth / 3) next();
    else prev();
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

  bindKeys({
    n: () => overlay.classList.toggle('show'),
    N: () => overlay.classList.toggle('show'),
    p: () => window.open(`${location.pathname}?presenter${location.hash}`, 'co-presenter', 'width=1280,height=800'),
    P: () => window.open(`${location.pathname}?presenter${location.hash}`, 'co-presenter', 'width=1280,height=800'),
  });

  const [i, st] = parseHash();
  go(i, st, { broadcast: false });
}

// ---------------------------------------------------------------------------
// Presenter view (otevře se klávesou P, synchronizace přes BroadcastChannel)
// ---------------------------------------------------------------------------

function presenter() {
  const totalBudget = slides.reduce((a, s) => a + s.sec, 0);
  app.innerHTML = `
  <div class="presenter">
    <div class="bar">
      <span class="timer">00:00</span>
      <button type="button" class="reset">Start / reset</button>
      <span class="pos"></span>
      <span class="budget"></span>
      <span style="margin-left:auto">← → krok · Home/End</span>
    </div>
    <div class="col">
      <div class="label">Aktuální slide</div>
      <div class="frame cur"></div>
    </div>
    <div class="col">
      <div class="label">Další krok</div>
      <div class="frame nxt"></div>
      <div class="notes"></div>
    </div>
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
  app.querySelector('.reset').addEventListener('click', () => (t0 = Date.now()));
  setInterval(() => {
    if (!t0) return;
    const s = Math.floor((Date.now() - t0) / 1000);
    timer.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
    timer.classList.toggle('over', s > 600);
  }, 250);

  listeners.push((i, st) => {
    show(cur, i, st);
    let ni = i;
    let ns = st + 1;
    if (ns > (slides[i].steps || 0)) {
      ni = Math.min(i + 1, TOTAL - 1);
      ns = ni === i ? st : 0;
    }
    show(nxt, ni, ns);
    pos.textContent = `Slide ${pad(i + 1)} / ${pad(TOTAL)} · krok ${st}/${slides[i].steps || 0}`;
    const elapsed = slides.slice(0, i).reduce((a, s) => a + s.sec, 0);
    budget.textContent = `plán: ${Math.floor(elapsed / 60)}:${pad(elapsed % 60)} z ${Math.floor(totalBudget / 60)}:${pad(totalBudget % 60)}`;
    notes.innerHTML = `<div class="meta">${slides[i].id} · ~${slides[i].sec} s</div>${notesHTML(slides[i].notes)}`;
  });

  bindKeys();
  const [i, st] = parseHash();
  go(i, st, { broadcast: false });
}

isPresenter ? presenter() : audience();
