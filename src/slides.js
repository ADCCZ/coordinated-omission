// Obsah prezentace. Každý slide:
//   id, cls ('paper' | 'dark'), section (hlavička), tr (přechod při vstupu: 'slide' | 'wipe' | 'zoom'),
//   head (false = bez hlavičky), sec (časový odhad v s), html, notes.
// [KLIK] v poznámkách = další krok (šipka / mezerník).

const cite = (n) => `<sup class="cite">[${n}]</sup>`;

const C = {
  ink: '#16202E',
  paper: '#F4F1E8',
  teal: '#0B7A75',
  tealSoft: '#D7E9E5',
  plum: '#B0306A',
  plumSoft: '#F1D9E2',
  plumLight: '#F28DB6',
  amber: '#F2B33D',
  line: '#D9D4C6',
  muted: '#6B6A63',
  onDark: '#EDE9DF',
  onDarkMuted: '#9AA3B2',
};
const MONO = `font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="600"`;

// --- pomocné SVG -------------------------------------------------------------

function dotsRow({ y, from, to, step, r, fill, skipFrom = Infinity, skipTo = -Infinity, hollow = false }) {
  let s = '';
  for (let x = from; x <= to; x += step) {
    const inGap = x >= skipFrom && x <= skipTo;
    if (hollow) {
      if (inGap) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.paper}" stroke="${C.plum}" stroke-width="3" stroke-dasharray="4 3"/>`;
    } else if (!inGap) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  }
  return s;
}

// deterministický šum pro „naměřenou“ stopu na titulce
function rand(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
const rnd = rand(7);
const traceBase = 930;
// během výpadku (1080–1380) uzavřená smyčka nic nezapíše → mezera v datech
const traceA = [];
const traceB = [];
for (let x = 84; x <= 1860; x += 12) {
  const y = traceBase - 10 - rnd() * 26;
  if (x < 1080) traceA.push(`${x},${y.toFixed(1)}`);
  else if (x === 1080) traceA.push(`${x},640`); // jediný pomalý vzorek
  else if (x >= 1380) traceB.push(`${x},${y.toFixed(1)}`);
}

// histogram s dlouhým ocasem (Teze): průměr i p99 se dopočítají z dat
const tailHeights = [150, 170, 140, 100, 70, 50, 36, 26, 20, 16, 13, 11, 9, 8, 7, 6, 6, 5, 5, 4, 4, 4, 3, 3];
const binX = (i) => i * 30 + 13; // střed sloupce
const tailTotal = tailHeights.reduce((a, b) => a + b, 0);
const tailMean = tailHeights.reduce((a, h, i) => a + h * binX(i), 0) / tailTotal;
let cum = 0;
const p99Bin = tailHeights.findIndex((h) => (cum += h) >= 0.99 * tailTotal);
const tailBars = tailHeights
  .map((h, i) => `<rect x="${i * 30 + 1}" y="${190 - h}" width="24" height="${h}" rx="3" fill="${i >= p99Bin ? C.plum : C.teal}"/>`)
  .join('');

// p99 po minutách (Past 2) – logaritmická osa 1 ms … 10 s
const logY = (ms) => 270 - (Math.log10(ms) / 4) * 250;
let minuteBars = '';
for (let i = 0; i < 60; i++) {
  const x = 112 + i * 25.8;
  const v = i === 41 ? 5000 : 20;
  minuteBars += `<rect x="${x.toFixed(1)}" y="${logY(v).toFixed(1)}" width="18" height="${(270 - logY(v)).toFixed(1)}" rx="2" fill="${i === 41 ? C.plum : C.teal}"/>`;
}
const logTicks = [
  [1, '1 ms'],
  [10, '10 ms'],
  [100, '100 ms'],
  [1000, '1 s'],
  [10000, '10 s'],
]
  .map(([v, t]) => `<line x1="106" x2="1664" y1="${logY(v)}" y2="${logY(v)}" stroke="${C.line}" stroke-width="1.5"/><text x="94" y="${logY(v) + 7}" text-anchor="end" fill="${C.muted}" font-size="19" ${MONO}>${t}</text>`)
  .join('');

// křivka 1 − 0,99^n (Past 3)
const px = (n) => 90 + ((n - 1) / 99) * 740;
const py = (p) => 380 - p * 350;
const fanoutPts = Array.from({ length: 100 }, (_, k) => `${px(k + 1).toFixed(1)},${py(1 - Math.pow(0.99, k + 1)).toFixed(1)}`).join(' ');

// předěl kapitoly
const divider = (n, title, sub) => `
<p class="display" aria-hidden="true" style="right:96px;top:150px;width:900px;text-align:right;font-size:560px;color:transparent;-webkit-text-stroke:3px rgba(242,179,61,.55);letter-spacing:-20px">${n}</p>
<p class="kicker" style="left:128px;top:330px;width:900px">Kapitola ${n} ze 03</p>
<h1 class="display" data-split style="left:124px;top:390px;width:1300px;font-size:150px">${title}</h1>
<p class="body muted" style="left:128px;top:${title.includes('<br>') ? 730 : 600}px;width:1000px">${sub}</p>`;

// --- slidy -----------------------------------------------------------------

export const slides = [
  {
    id: 'cover',
    cls: 'dark',
    head: false,
    sec: 55,
    html: `
<svg aria-label="Naměřená latence: rovná čára s jediným pomalým vzorkem; přerušovaně skutečná doba čekání během výpadku" style="left:0;top:0" width="1920" height="1080" viewBox="0 0 1920 1080">
  <rect x="1080" y="620" width="300" height="340" fill="${C.plumLight}" fill-opacity=".10"/>
  <polyline points="1080,640 1380,${traceBase - 22}" fill="none" stroke="${C.plumLight}" stroke-width="4" stroke-dasharray="10 9"/>
  <polyline class="draw" style="--len:1700" points="${traceA.join(' ')}" fill="none" stroke="${C.amber}" stroke-width="3.5" stroke-linejoin="round"/>
  <polyline class="draw" style="--len:1200" points="${traceB.join(' ')}" fill="none" stroke="${C.amber}" stroke-width="3.5" stroke-linejoin="round"/>
  <text x="1230" y="${traceBase + 18}" text-anchor="middle" fill="${C.onDarkMuted}" font-size="19" letter-spacing="1.5" ${MONO}>ŽÁDNÁ DATA</text>
  <g stroke="${C.onDarkMuted}" stroke-opacity=".6" stroke-width="2" fill="none">
    <polyline points="64,600 64,968 1880,968"/>
    <polyline points="56,614 64,600 72,614"/>
    <polyline points="1866,960 1880,968 1866,976"/>
  </g>
  <text transform="translate(48 960) rotate(-90)" fill="${C.onDarkMuted}" font-size="19" letter-spacing="1.5" ${MONO}>DOBA ODEZVY →</text>
  <text x="1880" y="952" text-anchor="end" fill="${C.onDarkMuted}" font-size="19" letter-spacing="1.5" ${MONO}>ČAS ODESLÁNÍ →</text>
  <text x="1104" y="612" fill="${C.plumLight}" font-size="22" letter-spacing="1.5" ${MONO}>ZAŽITO UŽIVATELI</text>
  <text x="128" y="890" fill="${C.amber}" font-size="22" letter-spacing="1.5" ${MONO}>NAMĚŘENO</text>
</svg>
<p class="kicker" style="left:128px;top:112px;width:1200px">Referát · KIV/PTE Pokročilé testování · ZČU FAV</p>
<h1 class="display" data-split style="left:122px;top:170px;width:1500px;font-size:168px">Coordinated omission</h1>
<p class="italic amber" style="left:128px;top:352px;width:1500px;font-size:88px;line-height:1.1">a pasti průměrných časů</p>
<p class="body" style="left:128px;top:490px;width:900px;color:${C.onDarkMuted}">Proč benchmark ukazuje rychlý systém, který uživatelé zažívají jako pomalý.</p>
<p class="label" style="left:128px;top:990px;width:800px;color:${C.onDark}">Oldřich Jan Švehla</p>
<p class="label right" style="left:992px;top:990px;width:800px">Pojem: Gil Tene, Azul Systems${cite(1)}</p>`,
    notes: `Dobrý den. U zátěžového testu nás většinou nejvíc zajímá doba odezvy. A já vám chci ukázat, ==že tohle číslo umí lhát, i když ho nikdo nefalšuje==. Důvody jsou dva. Prvnímu se říká ==coordinated omission==, česky koordinované vynechání. Pojem zavedl Gil Tene z firmy Azul Systems. Ten druhý znáte všichni: ==jsou to průměry==, tedy jak z tisíců měření uděláme jedno číslo. Graf na pozadí ukazuje celý problém ve zjednodušené podobě. Na vodorovné ose je čas odeslání požadavku, na svislé doba odezvy. Žlutá čára je to, co naměřil testovací nástroj: ==jeden pomalý vzorek a pak během výpadku nic==. Růžově je to, co mezitím zažili uživatelé. Kdo přišel na začátku výpadku, čekal celou dobu, kdo přišel těsně před koncem, skoro nic.`,
  },

  {
    id: 'teze',
    cls: 'paper',
    section: 'Teze',
    tr: 'slide',
    sec: 35,
    html: `
<div class="panel" style="left:128px;top:150px;width:808px;height:540px">
  <p class="n">01 · MĚŘENÍ</p>
  <p class="title" style="font-size:56px;margin-top:14px">Coordinated omission je chyba měření.</p>
  <svg aria-label="Řada pravidelných měření, uprostřed chybí vzorky" style="margin-top:44px" width="740" height="150" viewBox="0 0 740 150">
    <line x1="0" y1="75" x2="740" y2="75" stroke="${C.line}" stroke-width="2"/>
    <rect x="262" y="10" width="242" height="130" rx="10" fill="${C.plumSoft}"/>
    ${dotsRow({ y: 75, from: 10, to: 730, step: 22, r: 7.5, fill: C.ink, skipFrom: 270, skipTo: 500 })}
    ${dotsRow({ y: 75, from: 10, to: 730, step: 22, r: 7.5, skipFrom: 270, skipTo: 500, hollow: true })}
  </svg>
  <p class="small" style="margin-top:36px">Měřič zpomalí spolu se systémem. Většinu nejhorších okamžiků proto vůbec nezapíše.</p>
</div>
<div class="panel" style="left:984px;top:150px;width:808px;height:540px">
  <p class="n">02 · SHRNUTÍ</p>
  <p class="title plum" style="font-size:56px;margin-top:14px">Průměr je chyba shrnutí.</p>
  <svg aria-label="Histogram latence s dlouhým ocasem; průměr leží daleko od nejpomalejších hodnot" style="margin-top:36px" width="740" height="210" viewBox="0 -20 740 210">
    ${tailBars}
    <line x1="0" y1="190" x2="740" y2="190" stroke="${C.ink}" stroke-width="2"/>
    <line x1="${tailMean.toFixed(1)}" y1="-8" x2="${tailMean.toFixed(1)}" y2="190" stroke="${C.ink}" stroke-width="3" stroke-dasharray="8 6"/>
    <text x="${(tailMean + 12).toFixed(1)}" y="2" fill="${C.ink}" font-size="20" ${MONO}>průměr</text>
    <line x1="${binX(p99Bin) - 15}" y1="-8" x2="${binX(p99Bin) - 15}" y2="190" stroke="${C.plum}" stroke-width="3" stroke-dasharray="8 6"/>
    <text x="${binX(p99Bin) - 27}" y="2" text-anchor="end" fill="${C.plum}" font-size="20" ${MONO}>p99 →</text>
  </svg>
  <p class="small" style="margin-top:24px">Jedno číslo schová ocas rozdělení. A právě ten zažívají uživatelé.</p>
</div>
<p class="italic" data-step="1" style="left:128px;top:770px;width:1664px;font-size:80px;line-height:1.1">První kazí data. <span class="plum">Druhá kazí závěry.</span></p>`,
    notes: `Coordinated omission je ==chyba v tom, co naměříte==. Měřicí nástroj se zasekne ve stejnou chvíli jako systém, a většina nejhorších okamžiků se tak do dat vůbec nedostane. To jsou ty prázdné kroužky na obrázku vlevo. Průměr je zase ==chyba v tom, jak naměřené shrnete==. I kdyby byla data v pořádku, jedno číslo neřekne nic o nejpomalejších odpovědích, tedy o tom ocasu na obrázku vpravo. A právě ty si uživatelé pamatují. [KLIK] Zkráceně: ==první chyba kazí data, druhá kazí závěry==.`,
  },

  {
    id: 'd1',
    cls: 'dark',
    section: 'Kapitola 01',
    tr: 'wipe',
    sec: 5,
    html: divider('01', 'Co měříme', 'Jak generátor zátěže přijde právě o ty nejhorší vzorky.'),
    notes: `Začnu tím měřením.`,
  },

  {
    id: 'smycka',
    cls: 'paper',
    section: '01 · Co měříme',
    tr: 'slide',
    sec: 65,
    html: `
<p class="kicker" style="left:128px;top:150px;width:1600px">Uzavřená smyčka${cite('5,6')}</p>
<h2 class="title" style="left:128px;top:196px;width:1664px">Generátor čeká na odpověď, než pošle další</h2>
<p class="chip" style="left:128px;top:300px">pošli → čekej na odpověď → zapiš čas → pošli další</p>
<svg aria-label="Plánované a skutečně odeslané požadavky" style="left:128px;top:430px" width="1664" height="260" viewBox="0 0 1664 260">
  <line x1="0" y1="50" x2="1664" y2="50" stroke="${C.line}" stroke-width="2"/>
  <line x1="0" y1="190" x2="1664" y2="190" stroke="${C.line}" stroke-width="2"/>
  ${dotsRow({ y: 50, from: 40, to: 1640, step: 40, r: 9, fill: C.teal })}
  ${dotsRow({ y: 190, from: 40, to: 1640, step: 40, r: 9, fill: C.ink, skipFrom: 561, skipTo: 1119 })}
</svg>
<p class="label teal" style="left:128px;top:404px;width:560px">Plán · 100 req/s</p>
<p class="label" style="left:128px;top:658px;width:560px;color:${C.ink}">Skutečně odesláno</p>
<svg data-step="1" aria-label="Zaseknutí serveru, jeden požadavek čeká" style="left:128px;top:430px" width="1664" height="260" viewBox="0 0 1664 260">
  <rect x="560" y="0" width="560" height="260" rx="14" fill="${C.plum}" fill-opacity=".12"/>
  <rect x="560" y="185" width="560" height="10" rx="5" fill="${C.plum}"/>
  <circle cx="560" cy="190" r="11" fill="${C.plum}"/>
</svg>
<p class="label center plum" data-step="1" style="left:688px;top:404px;width:560px">Server stojí</p>
<p class="label center" data-step="1" style="left:688px;top:710px;width:560px;color:${C.ink}">1 požadavek = 1 pomalý vzorek</p>
<svg data-step="2" aria-label="Neodeslané požadavky" style="left:128px;top:430px" width="1664" height="260" viewBox="0 0 1664 260">
  ${dotsRow({ y: 190, from: 600, to: 1080, step: 40, r: 9, skipFrom: 600, skipTo: 1080, hollow: true })}
</svg>
<p class="body" data-step="2" style="left:128px;top:800px;width:1664px"><b>Dalších 13 požadavků nikdo neposlal</b>, a proto je nikdo ani nezměřil.</p>`,
    notes: `Většina nástrojů na zátěžové testy funguje ==v takzvané uzavřené smyčce==. Třeba JMeter, open-source nástroj na zátěžové testy od Apache: v jeho běžné Thread Group hraje každé vlákno jednoho virtuálního uživatele. Vlákno pošle požadavek, počká na odpověď, zapíše si, jak dlouho to trvalo, a teprve potom pošle další. Horní řada ukazuje plán, třeba sto požadavků za sekundu. Dokud server odpovídá rychle, spodní řada ho přesně kopíruje. [KLIK] Teď se server na chvíli zasekne, třeba kvůli garbage collectoru nebo zámku v databázi. Požadavek, který zrovna běží, čeká, a vlákno čeká s ním. Když odpověď konečně přijde, zapíše se jeden pomalý vzorek. [KLIK] A tady je háček. Tyhle požadavky měly během zaseknutí odejít, jenže vlákno čekalo, a tak je nikdo neposlal. ==A co nikdo neposlal, to nikdo nezměřil.== Z celého výpadku tak v datech zbude ==jeden pomalý vzorek mezi stovkami rychlých==.`,
  },

  {
    id: 'definice',
    cls: 'paper',
    section: '01 · Co měříme',
    tr: 'slide',
    sec: 40,
    html: `
<p class="kicker" style="left:128px;top:150px;width:900px">Definice · Gil Tene${cite('1,3')}</p>
<h2 class="title" data-split style="left:128px;top:196px;width:1600px;font-size:96px">Když systém zpomalí, měřič zpomalí s ním.</h2>
<p class="italic" data-step="1" style="left:128px;top:430px;width:1500px;font-size:56px;line-height:1.15;border-left:6px solid ${C.teal};padding-left:36px">Jako anketa spokojenosti, která se ptá jen lidí odcházejících od přepážky.</p>
<div data-step="2" style="left:128px;top:640px;width:1664px">
  <svg aria-label="Doba odezvy je čekání ve frontě plus doba obsluhy; benchmark vidí jen dobu obsluhy" width="1664" height="250" viewBox="0 -20 1664 250">
    <rect x="0" y="60" width="1300" height="78" rx="12" fill="${C.plumSoft}" stroke="${C.plum}" stroke-width="2"/>
    <rect x="1310" y="60" width="354" height="78" rx="12" fill="${C.teal}"/>
    <text x="28" y="110" fill="${C.plum}" font-size="28" ${MONO}>čekání ve frontě</text>
    <text x="1334" y="110" fill="#fff" font-size="28" ${MONO}>obsluha</text>
    <path d="M1310 40 V24 H1664 V40" fill="none" stroke="${C.teal}" stroke-width="3"/>
    <text x="1664" y="14" text-anchor="end" fill="${C.teal}" font-size="22" ${MONO}>SERVICE TIME · vidí benchmark</text>
    <path d="M0 158 V174 H1664 V158" fill="none" stroke="${C.ink}" stroke-width="3"/>
    <text x="0" y="212" fill="${C.ink}" font-size="22" ${MONO}>RESPONSE TIME · zažije uživatel = čekání + obsluha</text>
  </svg>
</div>`,
    notes: `Tene tomu říká coordinated omission, protože se měřený systém a měřicí nástroj nechtěně sladí: ==když zpomalí systém, zpomalí i měření a přestane se ptát==. [KLIK] Představte si anketu spokojenosti, kde se ptáte jen lidí, kteří odcházejí od přepážky. Když se přepážka na hodinu zavře, nikdo neodchází, a tak si nikdo nestěžuje. Fronta venku se do výsledků vůbec nedostane. [KLIK] Test pak měří hlavně dobu obsluhy, service time: jak dlouho trvalo vyřídit požadavek, když na něj přišla řada. Jenže ==uživatel zažívá dobu odezvy, response time, a to je čekání ve frontě plus obsluha==.`,
  },

  {
    id: 'pokus',
    cls: 'paper',
    section: '01 · Co měříme',
    tr: 'slide',
    sec: 90,
    html: `
<p class="kicker" style="left:128px;top:150px;width:900px">Myšlenkový pokus · Gil Tene${cite('1,8')}</p>
<h2 class="title" style="left:128px;top:196px;width:1664px">100 s běží, 100 s stojí</h2>
<div style="left:128px;top:300px;width:1664px;height:56px;display:flex;border-radius:12px;overflow:hidden">
  <p class="label" style="flex:1;background:${C.teal};color:#fff;padding:17px 24px">0–100 s · 100 req/s · každý za 1 ms</p>
  <p class="label" style="flex:1;background:${C.plum};color:#fff;padding:17px 24px">100–200 s · zmrazeno (Ctrl+Z)</p>
</div>
<table class="tbl" style="left:128px;top:400px;width:1664px">
  <tr><th style="width:560px">Metrika</th><th style="width:520px">Co nahlásí benchmark</th><th class="col-u nomove" data-step="1">Co zažijí uživatelé</th></tr>
  <tr><td>Počet vzorků</td><td class="v"><span data-count>10001</span></td><td class="v col-u nomove" data-step="1"><span data-count>20000</span></td></tr>
  <tr><td>Průměr</td><td class="v"><span data-count>11</span> ms</td><td class="v col-u nomove" data-step="1">≈ <span data-count>25</span> s</td></tr>
  <tr><td>Medián (p50)</td><td class="v"><span data-count>1</span> ms</td><td class="v col-u nomove" data-step="1">≈ <span data-count>1</span> ms</td></tr>
  <tr><td>75. percentil</td><td class="v"><span data-count>1</span> ms</td><td class="v col-u nomove" data-step="1">≈ <span data-count>50</span> s</td></tr>
  <tr><td>99,99. percentil</td><td class="v"><span data-count>1</span> ms</td><td class="v col-u nomove" data-step="1">≈ <span data-count>100</span> s</td></tr>
</table>
<p class="body" data-step="2" style="left:128px;top:900px;width:1664px"><span class="mark">Server je v obou sloupcích stejný.</span> Liší se jen způsob měření.</p>`,
    notes: `Jak velký ten rozdíl může být? Tene má na to myšlenkový pokus. Systém sto sekund odpovídá za jednu milisekundu, sto požadavků za sekundu. Pak ho na sto sekund zmrazíme, v terminálu stačí Ctrl+Z. Nástroj v uzavřené smyčce nasbírá deset tisíc rychlých vzorků a jeden, který trvá sto sekund. Průměr mu vyjde necelých jedenáct milisekund. Připomenu, co je percentil: ==99. percentil je hodnota, pod kterou leží 99 procent měření==, takže jen jeden požadavek ze sta je pomalejší. Náš pomalý vzorek je jeden z víc než deseti tisíc, a tak ==i 99,99. percentil ukáže jednu milisekundu==. Vypadá to jako skvělý systém. [KLIK] Kdyby ale lidé chodili dál podle plánu, přišlo by během zmrazení dalších deset tisíc požadavků. Kdo přišel na začátku, čeká sto sekund, kdo na konci, skoro nic, ==takže v průměru padesát sekund==. Polovina všech požadavků je rychlá a polovina čeká v průměru padesát sekund, proto ==celkový průměr vychází asi na pětadvacet sekund==. 75. percentil padne doprostřed té pomalé poloviny, na padesát sekund, a 99,99. percentil skoro na sto. Medián leží přesně na hranici obou polovin, a tak zůstane kolem milisekundy. [KLIK] Všimněte si, že ==server je v obou sloupcích stejný. Liší se jen způsob měření.==`,
  },

  {
    id: 'nasobek',
    cls: 'dark',
    section: '01 · Co měříme',
    tr: 'zoom',
    sec: 35,
    html: `
<p class="kicker" style="left:128px;top:150px;width:1600px">wrk2 · 2 000 req/s · 30 s · server pozastaven na 1,4 s${cite(2)}</p>
<p class="read amber" style="left:118px;top:205px;width:1664px;font-size:340px;letter-spacing:-16px">~<span data-count>200</span>×</p>
<div class="panel" style="left:128px;top:600px;width:792px">
  <p class="label">p99 bez korekce</p>
  <p class="read" style="font-size:110px;margin-top:18px"><span data-count>6,04</span><span class="u">ms</span></p>
</div>
<div class="panel" data-step="1" style="left:1000px;top:600px;width:792px;border-color:${C.plumLight}">
  <p class="label" style="color:${C.plumLight}">p99 s korekcí</p>
  <p class="read" style="font-size:110px;margin-top:18px;color:${C.plumLight}"><span data-count>1270</span><span class="u">ms</span></p>
</div>
<p class="body" data-step="2" style="left:128px;top:880px;width:1664px">Stejný běh, stejný server. Liší se jen to, <span class="amber">odkud se počítá čas</span>.</p>`,
    notes: `Není to jen teorie. Tene napsal wrk2, nástroj na zátěžové testy HTTP, který vypíše čísla s korekcí i bez ní. V příkladu z jeho dokumentace se server během třicetisekundového testu na 1,4 sekundy pozastaví. ==Bez korekce vyjde 99. percentil šest milisekund.== [KLIK] ==S korekcí 1 270 milisekund==, zhruba dvěstěkrát víc. [KLIK] Jediný rozdíl je v tom, odkud se počítá čas. Verze s korekcí ho ==počítá od chvíle, kdy požadavek měl odejít==, ne od chvíle, kdy skutečně odešel.`,
  },

  {
    id: 'd2',
    cls: 'dark',
    section: 'Kapitola 02',
    tr: 'wipe',
    sec: 10,
    html: divider('02', 'Jak to shrneme', 'Tři pasti, do kterých vede průměr, i když jsou data v pořádku.'),
    notes: `Řekněme, že už měříme správně. Data ale pořád musíme shrnout do čísla, které někomu ukážeme. A tady čekají tři pasti.`,
  },

  {
    id: 'past1',
    cls: 'paper',
    section: '02 · Jak to shrneme',
    tr: 'slide',
    sec: 40,
    html: `
<p class="kicker" style="left:128px;top:150px;width:900px">Past 1 · průměr</p>
<h2 class="title" style="left:128px;top:196px;width:1664px">Stejný průměr, jiný svět</h2>
${[
  ['Systém A', `<rect x="31" y="18" width="24" height="270" rx="3" fill="${C.teal}"/>`, 'Každý požadavek trvá 50 ms.', 'Průměr 50 ms · p99 50 ms', false],
  ['Systém B', `<rect x="0" y="31" width="20" height="257" rx="3" fill="${C.teal}"/><rect x="681" y="275" width="20" height="13" rx="3" fill="${C.plum}"/><text x="701" y="262" text-anchor="end" fill="${C.plum}" font-size="20" ${MONO}>5 % · 810 ms</text>`, '95 % požadavků za 10 ms, 5 % za 810 ms.', 'Průměr 50 ms · <span class="plum">p99 810 ms</span>', true],
]
  .map(
    ([name, bars, txt, res, step], k) => `
<div class="panel" style="left:${128 + k * 856}px;top:310px;width:808px;height:570px">
  <p class="n">${name.toUpperCase()}</p>
  <svg aria-label="${name}: ${txt}" style="margin-top:22px" width="740" height="330" viewBox="0 0 740 330">
    ${bars}
    <line x1="0" y1="289" x2="740" y2="289" stroke="${C.ink}" stroke-width="2"/>
    <line x1="43" y1="0" x2="43" y2="288" stroke="${C.ink}" stroke-width="3" stroke-dasharray="8 6"/>
    <text x="60" y="20" fill="${C.ink}" font-size="20" ${MONO}>← průměr 50 ms</text>
    <text x="0" y="318" fill="${C.muted}" font-size="19" ${MONO}>0 ms</text>
    <text x="740" y="318" text-anchor="end" fill="${C.muted}" font-size="19" ${MONO}>870 ms</text>
  </svg>
  <p class="small" style="margin-top:14px">${txt}</p>
  <p class="small" ${step ? 'data-step="1"' : ''} style="font-weight:600">${res}</p>
</div>`
  )
  .join('')}`,
    notes: `První past je samotný průměr. Systém A odpoví na každý požadavek za padesát milisekund. Systém B odpoví v 95 procentech případů za deset milisekund a ve zbylých pěti procentech za 810. Když si to spočítáte, 0,95 krát 10 plus 0,05 krát 810 je přesně padesát. ==Oba systémy mají stejný průměr.== [KLIK] Jenže ==99. percentil systému B je 810 milisekund==, protože nejhorší procento leží v těch pomalých pěti procentech. To je šestnáctkrát víc než u systému A. ==Proto se hlásí percentily a maximum, ne jedno číslo.==`,
  },

  {
    id: 'past2',
    cls: 'paper',
    section: '02 · Jak to shrneme',
    tr: 'slide',
    sec: 55,
    html: `
<p class="kicker" style="left:128px;top:150px;width:900px">Past 2 · průměr percentilů${cite(1)}</p>
<h2 class="title" style="left:128px;top:196px;width:1664px">Percentily se nedají průměrovat</h2>
<p class="label" style="left:128px;top:300px;width:1664px">Každý sloupec = p99 jedné minuty · logaritmická osa</p>
<svg aria-label="60 minutových p99: 59krát 20 ms, jednou 5 s" style="left:128px;top:336px" width="1664" height="310" viewBox="0 0 1664 310">
  ${logTicks}
  ${minuteBars}
  <line x1="106" y1="270" x2="1664" y2="270" stroke="${C.ink}" stroke-width="2"/>
  <text x="1206" y="${logY(5000) + 2}" fill="${C.plum}" font-size="21" ${MONO}>← výpadek · p99 = 5 s</text>
  <text x="112" y="302" fill="${C.muted}" font-size="19" ${MONO}>0. min</text>
  <text x="1664" y="302" text-anchor="end" fill="${C.muted}" font-size="19" ${MONO}>60. min</text>
</svg>
<div class="panel" style="left:128px;top:670px;width:792px;padding:24px 34px">
  <p class="label">Průměr minutových p99</p>
  <p class="read" style="font-size:96px;margin-top:12px"><span data-count>103</span><span class="u">ms</span></p>
</div>
<div class="panel" data-step="1" style="left:1000px;top:670px;width:792px;padding:24px 34px;border-color:${C.plum}">
  <p class="label plum">Skutečné p99 za celou hodinu</p>
  <p class="read plum" style="font-size:96px;margin-top:12px"><span data-count>5000</span><span class="u">ms</span></p>
</div>
<p class="muted" data-step="1" style="left:128px;top:928px;width:1664px;font-size:22px;line-height:1.3">Předpoklad: stejný provoz každou minutu, ve výpadku trvá každý požadavek 5 s. Pomalých je tedy 1/60 ≈ 1,7 % požadavků, víc než 1 %.</p>`,
    notes: `Druhou past najdete skoro v každém dashboardu. Monitoring spočítá 99. percentil za každou minutu a pro hodinový pohled je zprůměruje. Tady je taková hodina: 59 minut má p99 dvacet milisekund a jedna minuta je výpadek, kdy každý požadavek trvá pět sekund. ==Pozor, osa je logaritmická==, jinak by dvacet milisekund vedle pěti sekund nebylo vidět. Průměr minutových p99 vyjde 103 milisekund, tedy mírné zhoršení. [KLIK] Jenže při stejném provozu je ta minuta šedesátina všech požadavků, asi 1,7 procenta. To je víc než jedno procento, a proto ==skutečný 99. percentil za hodinu je pět sekund==. Tene to říká přímo: ==percentily se průměrovat nedají==. Když sčítáte přes čas nebo přes servery, ==slučujte celé histogramy== a percentil spočítejte až z nich.`,
  },

  {
    id: 'past3',
    cls: 'paper',
    section: '02 · Jak to shrneme',
    tr: 'slide',
    sec: 55,
    html: `
<p class="kicker" style="left:128px;top:150px;width:1200px">Past 3 · fan-out · Dean &amp; Barroso${cite(4)}</p>
<h2 class="title" style="left:128px;top:196px;width:1664px">Vzácné na serveru, běžné u uživatele</h2>
<div style="left:128px;top:320px;width:700px">
  <p class="read teal" style="font-size:170px"><span data-count>1</span><span class="u">%</span></p>
  <p class="label" style="margin-top:14px;color:${C.ink}">1 server · p99 = 1 s → pomalý 1 požadavek ze 100</p>
</div>
<div data-step="1" style="left:128px;top:570px;width:700px">
  <p class="read plum" style="font-size:170px"><span data-count>63</span><span class="u">%</span></p>
  <p class="label" style="margin-top:14px;color:${C.ink}">dotaz čeká na odpovědi ze 100 serverů</p>
</div>
<div class="panel" style="left:900px;top:310px;width:892px;height:520px;padding:24px 20px 10px">
<svg aria-label="Pravděpodobnost pomalého dotazu 1 − 0,99 na n podle počtu serverů" width="850" height="480" viewBox="0 0 850 480" ${MONO} font-size="19">
  ${[0, 0.25, 0.5, 0.75, 1]
    .map((p) => `<line x1="90" y1="${py(p)}" x2="830" y2="${py(p)}" stroke="${C.line}" stroke-width="1.5"/><text x="76" y="${py(p) + 7}" text-anchor="end" fill="${C.muted}">${p * 100} %</text>`)
    .join('')}
  <line x1="90" y1="380" x2="830" y2="380" stroke="${C.ink}" stroke-width="2"/>
  <text x="90" y="412" text-anchor="middle" fill="${C.muted}">1</text>
  <text x="${px(50)}" y="412" text-anchor="middle" fill="${C.muted}">50</text>
  <text x="830" y="412" text-anchor="middle" fill="${C.muted}">100</text>
  <text x="460" y="452" text-anchor="middle" fill="${C.ink}" letter-spacing="1.5">POČET SERVERŮ, NA KTERÉ DOTAZ ČEKÁ</text>
  <circle cx="${px(1)}" cy="${py(0.01)}" r="9" fill="${C.teal}"/>
  <g data-step="1">
    <polyline class="draw" style="--len:1000" points="${fanoutPts}" fill="none" stroke="${C.plum}" stroke-width="5" stroke-linejoin="round"/>
    <line x1="90" y1="${py(0.634)}" x2="830" y2="${py(0.634)}" stroke="${C.plum}" stroke-width="2" stroke-dasharray="8 8"/>
    <circle cx="${px(100)}" cy="${py(0.634)}" r="10" fill="${C.plum}"/>
    <text x="816" y="${py(0.634) - 22}" text-anchor="end" fill="${C.plum}" font-size="22">1 − 0,99¹⁰⁰ ≈ 63 %</text>
  </g>
</svg>
</div>
<p class="body" data-step="2" style="left:128px;top:880px;width:1664px">Medián ani p99 jednoho serveru neřekne, co zažije uživatel. <span class="mark">Rozhoduje ocas.</span></p>`,
    notes: `Třetí past popsali Jeff Dean a Luiz Barroso z Googlu v článku The Tail at Scale: díváme se na jeden server, ale uživatel čeká na mnoho serverů najednou. Vezměte server, jehož 99. percentil je jedna sekunda, takže jeden požadavek ze sta trvá sekundu nebo víc. [KLIK] Jeden dotaz uživatele se ale ve velkém systému rozpadne na desítky až stovky paralelních volání a hotovo je, až když dorazí to nejpomalejší. Když dotaz čeká na sto takových serverů, šance, že budou všechny rychlé, je 0,99 na stou, asi 37 procent. Pravděpodobnost, že aspoň jeden bude pomalý, je tedy ==jedna minus 0,99 na stou, tedy 63 procent==. [KLIK] Co je na jednom serveru vzácnost, je pro uživatele běžný zážitek. ==Rozhoduje ocas.==`,
  },

  {
    id: 'd3',
    cls: 'dark',
    section: 'Kapitola 03',
    tr: 'wipe',
    sec: 5,
    html: divider('03', 'Jak měřit správně', 'Dvě opravy měření a dvě opravy shrnutí.'),
    notes: `Tak co s tím?`,
  },

  {
    id: 'reseni',
    cls: 'paper',
    section: '03 · Jak měřit správně',
    tr: 'slide',
    sec: 55,
    html: `
<p class="kicker" style="left:128px;top:150px;width:900px">Řešení</p>
<h2 class="title" style="left:128px;top:196px;width:1664px">Dvě opravy měření, dvě opravy shrnutí</h2>
${[
  ['01 · MĚŘENÍ', 'Posílej podle plánu, ne podle odpovědí', `Otevřený model: požadavky přicházejí stálým tempem bez ohledu na to, jak rychle server odpovídá.${cite('5,6,9')}`, 'JMeter 5.5+: Open Model Thread Group<br>k6: executor: constant-arrival-rate<br>wrk2: wrk -t2 -c100 -d30s -R2000 …'],
  ['02 · MĚŘENÍ', 'Počítej čas od plánovaného odeslání', `Latence = konec − okamžik, kdy požadavek <i>měl</i> odejít. Knihovna HdrHistogram, která zaznamenává latence do histogramu, umí chybějící vzorky dopočítat, když zná plánovaný interval.${cite('2,7')}`, 'recordValueWithExpectedInterval()'],
  ['03 · SHRNUTÍ', 'Hlas rozdělení, ne jedno číslo', `p50, p90, p99, p99,9 a maximum. Nejlépe celý graf percentilů.${cite(1)}`, ''],
  ['04 · SHRNUTÍ', 'Slučuj histogramy, ne percentily', `Histogramy se dají sčítat přes čas i servery. Percentil se počítá až z výsledku.${cite(7)}`, ''],
]
  .map(
    ([n, h, t, code], k) => `
<div class="panel" ${k ? `data-step="${k}"` : ''} style="left:${128 + (k % 2) * 856}px;top:${300 + Math.floor(k / 2) * 360}px;width:808px;height:${k < 2 ? 340 : 230}px;display:flex;flex-direction:column;gap:12px">
  <p class="n">${n}</p>
  <p class="h3">${h}</p>
  <p class="small" style="font-size:24px">${t}</p>
  ${code ? `<p class="chip" style="align-self:flex-start;font-size:19px">${code}</p>` : ''}
</div>`
  )
  .join('')}
<p class="small" style="left:128px;top:916px;width:1664px"><b>Rychlá kontrola:</b> sedí skutečná propustnost s plánovanou? <span class="muted">(JMeter: Throughput v Summary Reportu)</span> Pokud ne, generátor čekal.</p>`,
    notes: `Opravy jsou dvě na měření a dvě na shrnutí. První: ==posílat zátěž podle plánu, ne podle odpovědí==. Tomu se říká otevřený model. V JMeteru ho od verze 5.5 umí ==Open Model Thread Group==, která neplánuje počet vláken, ale příchody požadavků. Podobně to umí nástroj k6 nebo wrk2. [KLIK] Druhá: ==počítat čas od chvíle, kdy požadavek měl odejít==. Knihovna HdrHistogram, která ukládá latence do histogramu, umí chybějící vzorky i dopočítat. [KLIK] Třetí: místo jednoho čísla ==hlásit rozdělení, tedy percentily a maximum==. [KLIK] A čtvrtá: při sčítání přes čas nebo servery ==slučovat histogramy, ne percentily==. A jedna kontrola, kterou zvládnete hned: ==sedí skutečná propustnost testu s plánovanou==? Propustnost je počet požadavků za sekundu. Pokud nástroj poslal méně požadavků, než měl, čekal.`,
  },

  {
    id: 'zaver',
    cls: 'dark',
    section: 'Závěr',
    tr: 'zoom',
    sec: 30,
    html: `
<p class="kicker" style="left:128px;top:150px;width:1200px">Závěr · tři otázky ke každému grafu latence</p>
<h2 class="display" data-split style="left:124px;top:206px;width:1600px;font-size:104px;line-height:1.02;letter-spacing:-2px">Číslo je jen tak dobré jako způsob, jakým vzniklo.</h2>
${[
  ['01', 'Odkud se počítá čas?', 'Od plánovaného odeslání, ne od skutečného.'],
  ['02', 'Je to průměr?', 'Chci vidět percentily a maximum.'],
  ['03', 'Jak se agregovalo?', 'Slučují se histogramy, ne percentily.'],
]
  .map(
    ([n, q, a], i) => `
<div data-step="${i + 1}" style="left:128px;top:${560 + i * 120}px;width:1664px;display:grid;grid-template-columns:110px 660px 1fr;align-items:baseline;border-top:1.5px solid #2b3a52;padding-top:28px">
  <p class="read amber" style="font-size:40px">${n}</p>
  <p class="h3" style="font-size:46px">${q}</p>
  <p class="body muted">${a}</p>
</div>`
  )
  .join('')}`,
    notes: `Ve všech příkladech s měřením byl server pořád stejný. ==Číslo je jen tak dobré jako způsob, jakým vzniklo.== Až příště uvidíte graf latence, zkuste si položit tři otázky. [KLIK] Odkud se počítá čas? Od plánovaného odeslání, nebo až od skutečného? [KLIK] Je to průměr? Pokud ano, chtějte percentily a maximum. [KLIK] A jak se data sčítala? Pokud někdo průměroval percentily, to číslo neplatí.`,
  },

  {
    id: 'zdroje',
    cls: 'paper',
    section: 'Zdroje',
    tr: 'slide',
    sec: 10,
    html: `
<p class="kicker" style="left:128px;top:150px;width:900px">Zdroje</p>
<div style="left:128px;top:220px;width:800px;display:flex;flex-direction:column;gap:30px">
  <div class="src"><p class="i">[1]</p><div><p class="t">How NOT to Measure Latency <span>· G. Tene, přednáška, QCon San Francisco 2012</span></p><a href="https://qconsf.com/sf2012/dl/qcon-sanfran-2012/slides/GilTene_HowNotToMeasureLatency.pdf" target="_blank" rel="noopener">qconsf.com/sf2012/…/GilTene_HowNotToMeasureLatency.pdf</a></div></div>
  <div class="src"><p class="i">[2]</p><div><p class="t">wrk2: constant throughput, correct latency recording <span>· G. Tene, GitHub</span></p><a href="https://github.com/giltene/wrk2" target="_blank" rel="noopener">github.com/giltene/wrk2</a></div></div>
  <div class="src"><p class="i">[3]</p><div><p class="t">Coordinated Omission <span>· diskuse, skupina Mechanical Sympathy</span></p><a href="https://groups.google.com/g/mechanical-sympathy/c/icNZJejUHfE/m/BfDekfBEs_sJ" target="_blank" rel="noopener">groups.google.com/g/mechanical-sympathy/c/icNZJejUHfE</a></div></div>
  <div class="src"><p class="i">[4]</p><div><p class="t">The Tail at Scale <span>· J. Dean, L. A. Barroso, Communications of the ACM 56(2), 2013</span></p><a href="https://doi.org/10.1145/2408776.2408794" target="_blank" rel="noopener">doi.org/10.1145/2408776.2408794</a></div></div>
</div>
<div style="left:992px;top:220px;width:800px;display:flex;flex-direction:column;gap:26px">
  <div class="src"><p class="i">[5]</p><div><p class="t">Open Versus Closed: A Cautionary Tale <span>· B. Schroeder, A. Wierman, M. Harchol-Balter, NSDI 2006</span></p><a href="https://www.usenix.org/conference/nsdi-06/open-versus-closed-cautionary-tale" target="_blank" rel="noopener">usenix.org/conference/nsdi-06/open-versus-closed-cautionary-tale</a></div></div>
  <div class="src"><p class="i">[6]</p><div><p class="t">Open and closed models <span>· Grafana k6, dokumentace</span></p><a href="https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/" target="_blank" rel="noopener">grafana.com/docs/k6/latest/…/open-vs-closed</a></div></div>
  <div class="src"><p class="i">[7]</p><div><p class="t">HdrHistogram <span>· G. Tene a kol., GitHub</span></p><a href="https://github.com/HdrHistogram/HdrHistogram" target="_blank" rel="noopener">github.com/HdrHistogram/HdrHistogram</a></div></div>
  <div class="src"><p class="i">[8]</p><div><p class="t">How NOT to Measure Latency, přepis záznamu <span>· Amara</span></p><a href="https://amara.org/videos/0vqzbDPNIIbE/en/1317064/3393860/" target="_blank" rel="noopener">amara.org/videos/0vqzbDPNIIbE</a></div></div>
  <div class="src"><p class="i">[9]</p><div><p class="t">Open Model Thread Group in JMeter <span>· BlazeMeter</span></p><a href="https://www.blazemeter.com/blog/open-model-thread-group" target="_blank" rel="noopener">blazemeter.com/blog/open-model-thread-group</a></div></div>
</div>
<p class="small muted" style="left:128px;top:900px;width:1664px">Čísla v Pasti 1 a 2 a výpočty v myšlenkovém pokusu jsou vlastní modelové výpočty. Past 3 předpokládá nezávislé servery.</p>`,
    notes: `Zdroje najdete tady a celá prezentace je online i s odkazy. Děkuji za pozornost a rád odpovím na otázky.`,
  },
];
