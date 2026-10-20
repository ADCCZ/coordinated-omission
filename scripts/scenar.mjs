// Vygeneruje SCENAR.md (text k přednesu) z poznámek ve src/slides.js.
// Spuštění: npm run scenar
import { writeFileSync } from 'node:fs';
import { slides } from '../src/slides.js';
import { titles } from './titles.mjs';

const pad = (n) => String(n).padStart(2, '0');
const mmss = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`;


const total = slides.reduce((a, s) => a + s.sec, 0);
const words = slides.reduce((a, s) => a + s.notes.replace(/==/g, '').split(/\s+/).length, 0);
let t = 0;
let md = `# Coordinated Omission a pasti průměrných časů: text k přednesu

Tučně jsou klíčové věty. Verze k tisku: SCENAR.pdf.

Referát KIV/PTE (Pokročilé testování), ZČU FAV · Oldřich Jan Švehla

Plánovaná délka **${mmss(total)}** (${words} slov; čas je odhadnutý podle zkoušky nanečisto, asi 80 slov za minutu včetně pauz a kliků).
\`[KLIK]\` znamená posun na další krok (šipka → nebo mezerník).
V prezentaci otevře klávesa **P** režim řečníka s tímto textem, časovačem a náhledem dalšího kroku.

`;
slides.forEach((s, i) => {
  md += `## ${pad(i + 1)} · ${titles[s.id] || s.id}\n\n`;
  md += `*${mmss(t)}–${mmss(t + s.sec)} · cca ${s.sec} s*\n\n`;
  md += `${s.notes.replace(/==(.+?)==/g, '**$1**').replace(/\[KLIK\]/g, '`[KLIK]`')}\n\n`;
  t += s.sec;
});
md += `---\n\nTento soubor se generuje ze \`src/slides.js\` příkazem \`npm run scenar\`. Text upravuj tam.\n`;
writeFileSync(new URL('../SCENAR.md', import.meta.url), md);
console.log(`SCENAR.md: ${slides.length} slidů, ${words} slov, ${mmss(total)}`);
