// Vygeneruje SCENAR.pdf: text k přednesu se zvýrazněnými místy, náhledy slidů a studijní přílohou.
// Spuštění: npm run build && npm run scenar:pdf   (potřebuje Playwright s Chromiem)
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { preview } from 'vite';
import { slides } from '../src/slides.js';
import { titles } from './titles.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = join(root, 'node_modules', '.scenar-pdf');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  ({ chromium } = createRequire('/opt/npm-tools/node_modules/')('playwright'));
}

const pad = (n) => String(n).padStart(2, '0');
const mmss = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`;
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// 1) náhledy slidů z tiskového režimu (?print)
const server = await preview({ root, preview: { port: 4188, strictPort: true }, logLevel: 'silent' });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:4188/?print');
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2200);
const stages = await page.$$('.print-wrap .stage');
for (let i = 0; i < stages.length; i++) await stages[i].screenshot({ path: join(tmp, `s${pad(i + 1)}.png`) });
await server.httpServer.close();

// 2) HTML scénáře
const total = slides.reduce((a, s) => a + s.sec, 0);
let t = 0;
const sections = slides
  .map((s, i) => {
    const parts = esc(s.notes).split('[KLIK]');
    const paras = parts
      .map((p, k) => {
        const txt = p.trim().replace(/==(.+?)==/g, '<mark>$1</mark>');
        return `<p>${k ? '<span class="klik">▶ KLIK</span> ' : ''}${txt}</p>`;
      })
      .join('');
    const from = t;
    t += s.sec;
    return `
<article class="slide">
  <div class="thumb"><img src="s${pad(i + 1)}.png" alt="Slide ${i + 1}"></div>
  <div class="text">
    <div class="meta"><span class="no">${pad(i + 1)}</span><span class="time">${mmss(from)}–${mmss(t)} · ~${s.sec} s</span></div>
    <h2>${titles[s.id] || s.id}</h2>
    ${paras}
  </div>
</article>`;
  })
  .join('');

const font = (pkg, f) => pathToFileURL(join(root, 'node_modules', pkg, f)).href;
const study = readFileSync(join(root, 'scripts', 'studium.html'), 'utf8');
const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8">
<link rel="stylesheet" href="${font('@fontsource-variable/big-shoulders-display', 'index.css')}">
<link rel="stylesheet" href="${font('@fontsource/barlow', '500.css')}">
<link rel="stylesheet" href="${font('@fontsource/barlow', '500-italic.css')}">
<link rel="stylesheet" href="${font('@fontsource/barlow', '700.css')}">
<link rel="stylesheet" href="${font('@fontsource/barlow-condensed', '600.css')}">
<link rel="stylesheet" href="${font('@fontsource/barlow-condensed', '700.css')}">
<link rel="stylesheet" href="${font('@fontsource-variable/martian-mono', 'index.css')}">
<style>
  :root { --ink:#16202E; --muted:#6B6A63; --teal:#0B7A75; --plum:#B0306A; --amber:#F2B33D; --line:#D9D4C6; --navy:#0F1A2B; --paper:#F4F1E8; }
  @page { size: A4; margin: 16mm 15mm 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font: 500 10.8pt/1.55 'Barlow', Arial, sans-serif; color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .serif, h1, h2 { font-family: 'Big Shoulders Display Variable', 'Arial Narrow', sans-serif; font-weight: 800; }
  mark { background: linear-gradient(transparent 12%, rgba(242,179,61,.55) 12%, rgba(242,179,61,.55) 92%, transparent 92%); color: inherit; padding: 0 1.5pt; font-weight: 600; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
  code { font: 8.6pt 'Martian Mono Variable', monospace; background: #EAF3F1; padding: 0 3pt; border-radius: 3pt; }

  /* titulní blok */
  .cover { background: var(--navy); color: #EDE9DF; border-radius: 10pt; padding: 18mm 14mm 12mm; margin-bottom: 9mm; }
  .eyebrow { font: 500 8.4pt/1.3 'Barlow Condensed', sans-serif; letter-spacing: 1.2pt; text-transform: uppercase; color: var(--teal); margin-bottom: 4pt; }
  .cover .eyebrow { color: var(--amber); }
  .cover h1 { font-size: 40pt; line-height: 1; font-weight: 850; letter-spacing: 0; }
  .cover .sub { font-family: 'Barlow', sans-serif; font-style: italic; font-size: 17pt; color: var(--amber); margin-top: 3pt; }
  .cover .who { margin-top: 10mm; display: flex; justify-content: space-between; font: 9pt 'Barlow Condensed', sans-serif; letter-spacing: .6pt; color: #9AA3B2; text-transform: uppercase; }
  .cover .who b { color: #EDE9DF; font-weight: 500; }
  .legend { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-bottom: 8mm; }
  .legend div { border: 1pt solid var(--line); border-radius: 6pt; padding: 3.2mm 3.6mm; font-size: 9.2pt; line-height: 1.4; }
  .legend b { display: block; font: 500 8pt 'Barlow Condensed', sans-serif; letter-spacing: .8pt; text-transform: uppercase; color: var(--teal); margin-bottom: 2pt; }

  /* slidy */
  .slide { display: grid; grid-template-columns: 58mm 1fr; gap: 6mm; padding: 5mm 0 5.5mm; border-top: 1pt solid var(--line); break-inside: avoid; }
  .thumb img { width: 58mm; border-radius: 3pt; border: .6pt solid var(--line); display: block; }
  .meta { display: flex; gap: 8pt; align-items: baseline; font: 500 8.2pt 'Barlow Condensed', sans-serif; letter-spacing: .6pt; color: var(--muted); }
  .meta .no { color: #fff; background: var(--teal); border-radius: 3pt; padding: 1pt 4pt; }
  h2 { font-size: 17pt; line-height: 1.1; font-weight: 800; margin: 2pt 0 4pt; letter-spacing: -0.2pt; }
  .text p { margin-bottom: 4.5pt; }
  .klik { font: 600 7.6pt 'Barlow Condensed', sans-serif; letter-spacing: .8pt; color: #fff; background: var(--navy); border-radius: 3pt; padding: 1pt 4pt; vertical-align: 1pt; white-space: nowrap; }

  /* studijní příloha */
  .study { break-before: page; }
  .study h1 { font-size: 32pt; line-height: 1.05; font-weight: 850; margin-bottom: 4pt; }
  .study .lead { color: var(--muted); font-size: 10.6pt; margin-bottom: 6mm; }
  .study h2 { font-size: 17pt; margin: 7mm 0 3mm; padding-top: 3mm; border-top: 1pt solid var(--line); break-after: avoid; }
  .study p { margin-bottom: 5pt; }
  .study ul, .study ol { padding-left: 14pt; } .study li { margin-bottom: 4pt; }
  table { border-collapse: collapse; width: 100%; font-size: 9.8pt; }
  th, td { text-align: left; vertical-align: top; padding: 4pt 6pt 4pt 0; border-bottom: .6pt solid var(--line); }
  .gloss th { width: 36mm; font-weight: 600; }
  .gloss th span, .reading span { font: 400 8pt 'Barlow Condensed', sans-serif; color: var(--muted); }
  .calc th { width: 46mm; font-weight: 600; }
  tr { break-inside: avoid; }
  .formula { font: 600 15pt 'Barlow Condensed', sans-serif; text-align: center; background: #EAF3F1; color: #0A4F4B; border-radius: 6pt; padding: 3mm; margin: 2mm 0 3mm; }
  .qa dt { font-weight: 600; margin-top: 4mm; break-after: avoid; }
  .qa dt::before { content: 'Q · '; font-family: 'Barlow Condensed', sans-serif; color: var(--plum); }
  .qa dd { margin: 1.5pt 0 0 0; padding-left: 9pt; border-left: 2pt solid var(--line); break-inside: avoid; }
  .reading li { margin-bottom: 5pt; } .reading a { display: block; font: 8.4pt/1.5 'Martian Mono Variable', monospace; color: var(--teal); text-decoration: underline; word-break: break-all; }
  a { color: var(--teal); }
  .cheat { margin-top: 8mm; background: var(--navy); color: #EDE9DF; border-radius: 8pt; padding: 5mm 6mm; break-inside: avoid; }
  .cheat .eyebrow { color: var(--amber); }
  .cheat p { margin-bottom: 3pt; } .cheat b { color: var(--amber); font-weight: 600; }
</style></head><body>
<header class="cover">
  <p class="eyebrow">Scénář přednesu · KIV/PTE Pokročilé testování · ZČU FAV</p>
  <h1>Coordinated omission</h1>
  <p class="sub">a pasti průměrných časů</p>
  <div class="who"><span><b>Oldřich Jan Švehla</b></span><span>${slides.length} slidů · plán ${mmss(total)}</span></div>
</header>
<div class="legend">
  <div><b>Zvýraznění</b><mark>Klíčová věta</mark>, kterou je dobré říct skoro doslova.</div>
  <div><b>Klik</b><span class="klik">▶ KLIK</span> posune slide o krok (šipka → nebo mezerník).</div>
  <div><b>Čas</b>Kumulativní plán; v prezentaci ukazuje režim řečníka (klávesa P) i časovač.</div>
</div>
${sections}
${study}
</body></html>`;
const htmlPath = join(tmp, 'scenar.html');
writeFileSync(htmlPath, html);

// 3) PDF
const pdfPage = await browser.newPage();
await pdfPage.goto(pathToFileURL(htmlPath).href);
await pdfPage.evaluate(() => document.fonts.ready);
await pdfPage.pdf({
  path: join(root, 'SCENAR.pdf'),
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: `<div style="width:100%;font:600 9px 'Barlow Condensed',sans-serif;color:#6B6A63;padding:0 15mm;display:flex;justify-content:space-between;letter-spacing:.5px"><span>COORDINATED OMISSION · SCÉNÁŘ · OLDŘICH JAN ŠVEHLA</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  margin: { top: '16mm', bottom: '18mm', left: '15mm', right: '15mm' },
});
await browser.close();
console.log('SCENAR.pdf hotovo');
