// Obsah prezentace. Každý slide: id, cls (pozadí), section (štítek v patičce),
// foot ('full' | 'num' | 'none'), sec (časový odhad v sekundách), html, notes.
// [KLIK] v poznámkách = posun na další krok (šipka / mezerník).

const cite = (n) => `<sup class="cite">[${n}]</sup>`;

// --- pomocné SVG -----------------------------------------------------------

function dotsRow({ y, from, to, step, r, fill, hollowFrom = -1, hollowTo = -1, hollow = '' }) {
  let s = '';
  for (let x = from; x <= to; x += step) {
    const isHollow = x >= hollowFrom && x <= hollowTo;
    if (isHollow && hollow === 'skip') continue;
    s += isHollow
      ? `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#C8321F" stroke-width="3" stroke-dasharray="4 3"/>`
      : `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  }
  return s;
}

// histogram s dlouhým ocasem (slide Teze)
const tailHeights = [150, 170, 140, 100, 70, 50, 36, 26, 20, 16, 13, 11, 9, 8, 7, 6, 6, 5, 5, 4, 4, 8, 6, 10];
const tailBars = tailHeights
  .map((h, i) => `<rect x="${i * 32}" y="${176 - h}" width="28" height="${h}" fill="${i >= 21 ? '#C8321F' : '#2E4BF5'}"/>`)
  .join('');

// p99 po minutách (Past 2)
let minuteBars = '';
for (let i = 0; i < 60; i++) {
  const x = 3.9 + i * 27.73;
  minuteBars +=
    i === 41
      ? `<rect x="${x.toFixed(1)}" y="10" width="20" height="250" fill="#C8321F"/>`
      : `<rect x="${x.toFixed(1)}" y="238" width="20" height="22" fill="#2E4BF5"/>`;
}

// křivka 1 − 0,99^n (Past 3)
const px = (n) => 80 + ((n - 1) / 99) * 760;
const py = (p) => 380 - p * 360;
const fanoutPts = Array.from({ length: 100 }, (_, k) => {
  const n = k + 1;
  return `${px(n).toFixed(1)},${py(1 - Math.pow(0.99, n)).toFixed(1)}`;
}).join(' ');

// --- slidy -----------------------------------------------------------------

export const slides = [
  {
    id: 'cover',
    cls: 'dark',
    foot: 'none',
    sec: 30,
    html: `
<div style="left:0;top:0;width:960px;height:1080px;background:var(--blue)"></div>
<div style="left:960px;top:0;width:960px;height:1080px;background:var(--red)"></div>
<p class="kicker" style="left:128px;top:96px;width:700px;color:var(--white)">Gil Tene · Azul Systems${cite(1)}</p>
<h1 class="h1" data-split style="left:124px;top:300px;width:820px;font-size:100px;color:var(--white)">Coordinated<br>omission</h1>
<p class="kicker" style="left:1088px;top:96px;width:700px;color:var(--ink)">Statistika · každý dashboard</p>
<h1 class="h1" data-split style="left:1084px;top:300px;width:720px;font-size:100px;color:var(--ink)">Pasti<br>průměrů</h1>
<p class="body" style="left:128px;top:860px;width:700px;color:var(--white)">Proč benchmark ukazuje rychlý systém, který uživatelé zažívají jako pomalý.</p>
<p class="kicker right" style="left:1088px;top:952px;width:704px;color:var(--ink)">Referát · Oldřich Švehla · FJP · ZČU FAV</p>`,
    notes: `Dobrý den. Dnes vám chci ukázat, proč čísla z benchmarků a z monitoringu často lžou, i když je nikdo úmyslně nezfalšoval. Příčiny jsou dvě. První je coordinated omission, česky koordinované vynechání. Ten pojem zavedl Gil Tene ze společnosti Azul Systems. Druhou příčinou jsou průměry, a obecně to, jak z tisíců měření uděláme jedno číslo, které pak ukážeme v grafu nebo v tabulce.`,
  },

  {
    id: 'teze',
    cls: 'paper',
    section: 'Teze',
    foot: 'full',
    sec: 45,
    html: `
<h2 class="h2" style="left:128px;top:128px;width:768px">Coordinated omission je chyba měření.</h2>
<h2 class="h2 redink" style="left:1024px;top:128px;width:768px">Průměr je chyba shrnutí.</h2>
<svg aria-label="Řada pravidelných měření, uprostřed chybí vzorky" style="left:128px;top:420px" width="768" height="180" viewBox="0 0 768 180">
  <line x1="0" y1="90" x2="768" y2="90" stroke="#B9B8B3" stroke-width="2"/>
  <rect x="288" y="20" width="264" height="140" fill="#F0432F" fill-opacity="0.14"/>
  ${dotsRow({ y: 90, from: 12, to: 756, step: 24, r: 8, fill: '#141414', hollowFrom: 290, hollowTo: 550 })}
</svg>
<svg aria-label="Histogram latence s dlouhým ocasem, čárkovaně průměr" style="left:1024px;top:420px" width="768" height="180" viewBox="0 0 768 180">
  ${tailBars}
  <line x1="0" y1="177" x2="768" y2="177" stroke="#141414" stroke-width="2"/>
  <line x1="206" y1="0" x2="206" y2="176" stroke="#141414" stroke-width="4" stroke-dasharray="10 8"/>
</svg>
<p class="kicker" style="left:1244px;top:380px;width:300px">← průměr</p>
<p class="kicker redink right" style="left:1492px;top:380px;width:300px">ocas →</p>
<p class="body" style="left:128px;top:640px;width:720px;color:#3a3936">Měřič zpomalí spolu se systémem. Nejhorší okamžiky proto vůbec nezapíše.</p>
<p class="body" style="left:1024px;top:640px;width:720px;color:#3a3936">Jedno číslo schová ocas rozdělení. A právě ten zažívají uživatelé.</p>
<h2 class="h2" data-step="1" style="left:128px;top:792px;width:1664px">První kazí data. Druhá kazí závěry.</h2>`,
    notes: `Hned na začátek hlavní myšlenka. Coordinated omission je chyba v tom, CO naměříte. Měřicí nástroj zpomalí přesně ve chvíli, kdy zpomalí systém, a nejhorší okamžiky se do dat vůbec nedostanou. To jsou ty prázdné kroužky vlevo. Průměr je chyba v tom, JAK naměřené shrnete. I s dokonalými daty jedno číslo schová ocas rozdělení, tedy ty nejpomalejší odpovědi vpravo. A právě ty si uživatelé pamatují. [KLIK] Takže: první chyba kazí data, druhá kazí závěry. A nejhorší je, když se potkají obě najednou.`,
  },

  {
    id: 'd1',
    cls: 'dark',
    foot: 'num',
    sec: 5,
    html: `
<p class="kicker" style="left:128px;top:128px;width:600px;color:var(--lime)">01 / 03</p>
<h1 class="h1" data-split style="left:116px;top:320px;width:1600px;font-size:200px;letter-spacing:-8px;line-height:0.88">Co<br>měříme</h1>
<p class="body" style="left:128px;top:760px;width:1200px;color:#bdbcb6">Jak generátor zátěže přijde právě o ty nejhorší vzorky.</p>`,
    notes: `Začněme tím, co vlastně měříme.`,
  },

  {
    id: 'smycka',
    cls: 'paper',
    section: '01 · Co měříme',
    foot: 'full',
    sec: 70,
    html: `
<h2 class="h2" style="left:128px;top:128px;width:1600px">Generátor čeká na odpověď, než pošle další</h2>
<p class="kicker nowrap" style="left:128px;top:250px;width:1600px">Pošli → čekej na odpověď → zapiš čas → pošli další${cite('5,6')}</p>
<svg aria-label="Plánované a skutečně odeslané požadavky" style="left:128px;top:420px" width="1664" height="260" viewBox="0 0 1664 260">
  <line x1="0" y1="50" x2="1664" y2="50" stroke="#B9B8B3" stroke-width="2"/>
  <line x1="0" y1="190" x2="1664" y2="190" stroke="#B9B8B3" stroke-width="2"/>
  ${dotsRow({ y: 50, from: 40, to: 1640, step: 40, r: 9, fill: '#2E4BF5' })}
  ${dotsRow({ y: 190, from: 40, to: 1640, step: 40, r: 9, fill: '#141414', hollowFrom: 561, hollowTo: 1119, hollow: 'skip' })}
</svg>
<p class="kicker" style="left:128px;top:366px;width:560px;color:var(--blue)">Plán · 100 req/s</p>
<p class="kicker" style="left:128px;top:648px;width:560px">Skutečně odesláno</p>
<svg data-step="1" aria-label="Zaseknutí serveru, jeden požadavek čeká" style="left:128px;top:420px" width="1664" height="260" viewBox="0 0 1664 260">
  <rect x="560" y="0" width="560" height="260" fill="#F0432F" fill-opacity="0.14"/>
  <rect x="560" y="184" width="560" height="12" fill="#C8321F"/>
  <circle cx="560" cy="190" r="11" fill="#C8321F"/>
</svg>
<p class="kicker center" data-step="1" style="left:688px;top:366px;width:560px">Server stojí</p>
<p class="kicker center" data-step="1" style="left:688px;top:700px;width:560px">1 požadavek = 1 pomalý vzorek</p>
<svg data-step="2" aria-label="Neodeslané požadavky" style="left:128px;top:420px" width="1664" height="260" viewBox="0 0 1664 260">
  ${dotsRow({ y: 190, from: 600, to: 1080, step: 40, r: 9, fill: '#E9E8E4', hollowFrom: 600, hollowTo: 1080 })}
</svg>
<p class="body" data-step="2" style="left:128px;top:800px;width:1664px"><b>Dalších 13 požadavků nikdo neposlal</b>, a proto je nikdo ani nezměřil.</p>`,
    notes: `Většina klasických nástrojů pro zátěžové testy funguje v takzvané uzavřené smyčce. Každé spojení pošle požadavek, počká na odpověď, zapíše, jak dlouho to trvalo, a teprve potom pošle další. Horní modrá řada ukazuje, kdy jsme chtěli požadavky posílat, třeba sto za sekundu. Dokud server odpovídá rychle, spodní řada plán věrně kopíruje. [KLIK] Teď se server na chvíli zasekne, třeba kvůli garbage collectoru, zámku v databázi nebo přetížené síti. Požadavek, který zrovna běží, čeká, a generátor čeká s ním. Až odpověď dorazí, zapíše se jeden pomalý vzorek. [KLIK] A tady je ten problém. Všechny tyhle požadavky měly během zaseknutí odejít, ale generátor je neposlal, protože čekal. Kdo je neposlal, ten je ani nezměřil. Z celého výpadku tak v datech zůstane jediný pomalý vzorek mezi stovkami rychlých.`,
  },

  {
    id: 'definice',
    cls: 'blue',
    section: '01 · Co měříme',
    foot: 'full',
    sec: 45,
    html: `
<p class="kicker" style="left:128px;top:128px;width:900px;color:var(--lime)">Definice · Gil Tene${cite('1,3')}</p>
<h2 class="h1" data-split style="left:128px;top:220px;width:1600px;font-size:100px;letter-spacing:-3px;line-height:1;text-transform:none;color:var(--white)">Když systém zpomalí, měřič zpomalí s ním.</h2>
<p class="serif" data-step="1" style="left:128px;top:500px;width:1500px;font-size:72px;line-height:1.1;color:var(--lime)">Jako anketa spokojenosti, která se ptá jen lidí odcházejících od přepážky.</p>
<p class="body" data-step="2" style="left:128px;top:750px;width:1500px;color:var(--white)">Benchmark pak ukazuje <b>dobu obsluhy</b> (service time), ne <b>dobu odezvy</b> (response time), kterou zažije uživatel čekající ve frontě.</p>`,
    notes: `Gil Tene tomu říká coordinated omission. Měřený systém a měřicí nástroj se nevědomky sladí: když systém zpomalí, měřič zpomalí s ním a přestane se ptát. [KLIK] Je to jako anketa spokojenosti, kterou dělá někdo, kdo se ptá jen lidí odcházejících od přepážky. Když se přepážka na hodinu zavře, nikdo neodchází, a tedy si nikdo nestěžuje. Fronta venku do statistiky vůbec nevstoupí. [KLIK] Výsledek pak popisuje jen dobu obsluhy, anglicky service time, tedy jak dlouho trvalo vyřídit požadavek, když na něj přišla řada. Nepopisuje dobu odezvy, response time, kterou zažije uživatel, který musel nejdřív čekat ve frontě.`,
  },

  {
    id: 'pokus',
    cls: 'paper',
    section: '01 · Co měříme',
    foot: 'full',
    sec: 75,
    html: `
<p class="kicker" style="left:128px;top:128px;width:900px;color:var(--muted)">Myšlenkový pokus · Gil Tene${cite('1,8')}</p>
<h2 class="h2" style="left:128px;top:168px;width:1664px">100 s běží, 100 s stojí</h2>
<div style="left:128px;top:270px;width:832px;height:64px;background:var(--blue)"></div>
<div style="left:960px;top:270px;width:832px;height:64px;background:var(--red)"></div>
<p class="kicker" style="left:152px;top:287px;width:780px;color:var(--white)">0–100 s · 100 req/s · 1 ms</p>
<p class="kicker" style="left:984px;top:287px;width:780px">100–200 s · zmrazeno (Ctrl+Z)</p>
${[472, 544, 616, 688, 760].map((t) => `<div style="left:128px;top:${t}px;width:1664px;height:2px;background:var(--line)"></div>`).join('')}
<div style="left:128px;top:400px;width:620px;display:flex;flex-direction:column">
  <p class="kicker muted" style="line-height:72px">Metrika</p>
  <p class="body" style="line-height:72px">Počet vzorků</p>
  <p class="body" style="line-height:72px">Průměr</p>
  <p class="body" style="line-height:72px">Medián (p50)</p>
  <p class="body" style="line-height:72px">75. percentil</p>
  <p class="body" style="line-height:72px">99,99. percentil</p>
</div>
<div style="left:780px;top:400px;width:460px;display:flex;flex-direction:column">
  <p class="kicker muted" style="line-height:72px">Co nahlásí benchmark</p>
  <p class="big" style="font-size:44px;line-height:72px;letter-spacing:-1px"><span data-roll>10 001</span></p>
  <p class="big" style="font-size:44px;line-height:72px;letter-spacing:-1px"><span data-roll>11</span> ms</p>
  <p class="big" style="font-size:44px;line-height:72px;letter-spacing:-1px"><span data-roll>1</span> ms</p>
  <p class="big" style="font-size:44px;line-height:72px;letter-spacing:-1px"><span data-roll>1</span> ms</p>
  <p class="big" style="font-size:44px;line-height:72px;letter-spacing:-1px"><span data-roll>1</span> ms</p>
</div>
<div data-step="1" class="nomove" style="left:1276px;top:400px;width:8px;height:432px;background:var(--red)"></div>
<div data-step="1" style="left:1312px;top:400px;width:480px;display:flex;flex-direction:column">
  <p class="kicker redink" style="line-height:72px">Co zažijí uživatelé</p>
  <p class="big" style="font-size:44px;line-height:72px;letter-spacing:-1px"><span data-roll>20 000</span></p>
  <p class="big" style="font-size:44px;line-height:72px;letter-spacing:-1px">≈ <span data-roll>25</span> s</p>
  <p class="big" style="font-size:44px;line-height:72px;letter-spacing:-1px">≈ <span data-roll>1</span> ms</p>
  <p class="big" style="font-size:44px;line-height:72px;letter-spacing:-1px">≈ <span data-roll>50</span> s</p>
  <p class="big" style="font-size:44px;line-height:72px;letter-spacing:-1px">≈ <span data-roll>100</span> s</p>
</div>
<p class="small muted" data-step="2" style="left:128px;top:850px;width:1664px">Server je v obou sloupcích stejný. Liší se jen způsob měření.</p>`,
    notes: `Jak velký to má dopad? Tene ve své přednášce používá jednoduchý myšlenkový pokus. Systém sto sekund odpovídá za jednu milisekundu při zátěži sto požadavků za sekundu. Pak ho na sto sekund zmrazíme, v terminálu na to stačí Ctrl+Z. Generátor v uzavřené smyčce nasbírá deset tisíc vzorků po jedné milisekundě a jeden jediný vzorek o délce sto sekund. Průměr vyjde necelých jedenáct milisekund a i 99,99. percentil ukazuje jednu milisekundu. Vypadá to jako skvělý systém. [KLIK] Teď spočítejme, co by zažili uživatelé, kteří by chodili dál rovnoměrně, sto za sekundu. Během zmrazení by přišlo dalších deset tisíc požadavků a ty by čekaly v průměru padesát sekund. Průměr přes celých dvě stě sekund je kolem pětadvaceti sekund, 75. percentil padesát sekund a 99,99. percentil sto sekund. Medián je pořád jedna milisekunda, takže ani medián vás nezachrání. [KLIK] A všimněte si: server je v obou sloupcích stejný. Liší se jen způsob měření.`,
  },

  {
    id: 'nasobek',
    cls: 'red',
    section: '01 · Co měříme',
    foot: 'full',
    sec: 40,
    html: `
<p class="kicker" style="left:128px;top:128px;width:1600px">wrk2 · 2 000 req/s · 30 s · server pozastaven na 1,4 s${cite(2)}</p>
<h1 class="big" style="left:100px;top:170px;width:1664px;font-size:400px;line-height:0.85;letter-spacing:-18px"><span data-roll>200</span>×</h1>
<div style="left:128px;top:600px;width:760px;display:flex;flex-direction:column;gap:12px">
  <p class="big" style="font-size:100px"><span data-roll>6,04</span> ms</p>
  <p class="kicker">p99 bez korekce</p>
</div>
<div data-step="1" style="left:1000px;top:600px;width:792px;display:flex;flex-direction:column;gap:12px">
  <p class="big" style="font-size:100px"><span data-roll>1 270</span> ms</p>
  <p class="kicker">p99 s korekcí</p>
</div>
<p class="body" data-step="2" style="left:128px;top:810px;width:1664px">Stejný běh, stejný server. Liší se jen to, odkud se počítá čas.</p>`,
    notes: `A není to jen teorie. Gil Tene napsal nástroj wrk2, který měří správně a umí vypsat i nekorigovaná čísla, takže jde obojí porovnat na jednom běhu. V příkladu z jeho dokumentace běží test třicet sekund při dvou tisících požadavcích za sekundu a server se uprostřed na 1,4 sekundy pozastaví. Nekorigovaný 99. percentil vyjde šest milisekund. [KLIK] Korigovaný vyjde 1 270 milisekund. To je zhruba dvousetnásobek. [KLIK] Stejný běh, stejný server. Rozdíl je jen v tom, že korigovaná verze počítá čas od chvíle, kdy požadavek MĚL odejít, a ne od chvíle, kdy skutečně odešel. (Nech číslo dvě stě chvíli viset.)`,
  },

  {
    id: 'd2',
    cls: 'dark',
    foot: 'num',
    sec: 10,
    html: `
<p class="kicker" style="left:128px;top:128px;width:600px;color:var(--lime)">02 / 03</p>
<h1 class="h1" data-split style="left:116px;top:320px;width:1600px;font-size:200px;letter-spacing:-8px;line-height:0.88">Jak to<br>shrneme</h1>
<p class="body" style="left:128px;top:760px;width:1200px;color:#bdbcb6">Tři pasti, do kterých vede průměr, i když jsou data v pořádku.</p>`,
    notes: `Teď předpokládejme, že měříme správně a data máme v pořádku. Pořád je musíme nějak shrnout do čísla, které někomu ukážeme. A tady čekají tři pasti.`,
  },

  {
    id: 'past1',
    cls: 'paper',
    section: '02 · Jak to shrneme',
    foot: 'full',
    sec: 45,
    html: `
<p class="kicker muted" style="left:128px;top:128px;width:900px">Past 1 · průměr</p>
<h2 class="h2" style="left:128px;top:168px;width:1664px">Stejný průměr, jiný svět</h2>
<p class="kicker" style="left:128px;top:280px;width:600px">Systém A</p>
<p class="kicker" style="left:1024px;top:280px;width:600px">Systém B</p>
<svg aria-label="Systém A: vše za 50 ms" style="left:128px;top:330px" width="768" height="320" viewBox="0 0 768 320">
  <rect x="31" y="18" width="24" height="300" fill="#2E4BF5"/>
  <line x1="0" y1="319" x2="768" y2="319" stroke="#141414" stroke-width="2"/>
  <line x1="43" y1="0" x2="43" y2="318" stroke="#141414" stroke-width="4" stroke-dasharray="10 8"/>
</svg>
<svg aria-label="Systém B: 95 % za 10 ms, 5 % za 810 ms" style="left:1024px;top:330px" width="768" height="320" viewBox="0 0 768 320">
  <rect x="0" y="33" width="24" height="285" fill="#2E4BF5"/>
  <rect x="679" y="303" width="24" height="15" fill="#C8321F"/>
  <line x1="0" y1="319" x2="768" y2="319" stroke="#141414" stroke-width="2"/>
  <line x1="43" y1="0" x2="43" y2="318" stroke="#141414" stroke-width="4" stroke-dasharray="10 8"/>
</svg>
<p class="kicker" style="left:188px;top:340px;width:500px">← průměr 50 ms</p>
<p class="kicker" style="left:1084px;top:340px;width:500px">← průměr 50 ms</p>
<p class="kicker right redink" style="left:1532px;top:590px;width:260px">5 % · 810 ms</p>
<p class="kicker muted" style="left:128px;top:662px;width:300px">0 ms</p>
<p class="kicker muted right" style="left:596px;top:662px;width:300px">900 ms</p>
<p class="kicker muted" style="left:1024px;top:662px;width:300px">0 ms</p>
<p class="kicker muted right" style="left:1492px;top:662px;width:300px">900 ms</p>
<p class="body" style="left:128px;top:730px;width:768px">Každý požadavek trvá 50 ms.<br><b>Průměr 50 ms · p99 50 ms</b></p>
<p class="body" style="left:1024px;top:730px;width:768px">95 % požadavků za 10 ms, 5 % za 810 ms.</p>
<p class="body" data-step="1" style="left:1024px;top:773px;width:768px"><b>Průměr 50 ms · <span class="redink">p99 810 ms</span></b></p>`,
    notes: `První past: průměr nic neříká o tvaru rozdělení. Systém A odpoví na každý požadavek za padesát milisekund. Systém B odpoví na 95 procent požadavků za deset milisekund a na zbylých pět procent za 810 milisekund. Spočítejte si to: 0,95 krát 10 plus 0,05 krát 810 je přesně padesát. Oba mají stejný průměr. [KLIK] Ale 99. percentil systému B je 810 milisekund, šestnáctkrát víc. Latence v reálných systémech nemá tvar Gaussova zvonu. Má dlouhý ocas doprava, často víc vrcholů, a průměr i směrodatná odchylka tiše předpokládají tvar, který tam není. Proto se hlásí percentily a maximum, ne jedno číslo.`,
  },

  {
    id: 'past2',
    cls: 'paper',
    section: '02 · Jak to shrneme',
    foot: 'full',
    sec: 55,
    html: `
<p class="kicker muted" style="left:128px;top:128px;width:900px">Past 2 · průměr percentilů${cite(1)}</p>
<h2 class="h2" style="left:128px;top:168px;width:1664px">Percentily se nedají průměrovat</h2>
<p class="kicker" style="left:128px;top:276px;width:1000px">Každý sloupec = p99 jedné minuty</p>
<svg aria-label="60 minutových p99: 59× 20 ms, jednou 5 s" style="left:128px;top:320px" width="1664" height="260" viewBox="0 0 1664 260">
  ${minuteBars}
  <line x1="0" y1="260" x2="1664" y2="260" stroke="#141414" stroke-width="2"/>
</svg>
<p class="kicker" style="left:1300px;top:336px;width:480px">← výpadek · p99 = 5 s</p>
<p class="kicker" style="left:128px;top:510px;width:700px">ostatní minuty · p99 = 20 ms</p>
<p class="kicker muted" style="left:128px;top:592px;width:300px">0. min</p>
<p class="kicker muted right" style="left:1492px;top:592px;width:300px">60. min</p>
<div style="left:128px;top:650px;width:760px;display:flex;flex-direction:column;gap:12px">
  <p class="big" style="font-size:100px"><span data-roll>103</span> ms</p>
  <p class="kicker">Průměr minutových p99</p>
</div>
<div data-step="1" style="left:1000px;top:650px;width:792px;display:flex;flex-direction:column;gap:12px">
  <p class="big redink" style="font-size:100px"><span data-roll>5 000</span> ms</p>
  <p class="kicker">Skutečné p99 za celou hodinu</p>
</div>
<p class="muted" data-step="1" style="left:128px;top:836px;width:1664px;font-size:24px;line-height:1.3">Předpoklad: stejný provoz každou minutu, ve výpadku trvá každý požadavek 5 s. Pomalých je tedy 1/60 ≈ 1,7 % požadavků, víc než 1 %.</p>`,
    notes: `Druhá past je zrádnější, protože ji najdete skoro v každém dashboardu. Monitoring spočítá 99. percentil za každou minutu a pro hodinový pohled ho pak zprůměruje. Tady je hodina, kde 59 minut má p99 dvacet milisekund a jedna minuta je výpadek, kdy každý požadavek trvá pět sekund. Průměr minutových p99 vyjde 103 milisekund. Vypadá to jako mírné zhoršení, nikdo se nevzbudí. [KLIK] Jenže při rovnoměrném provozu tvoří ta jedna minuta šedesátinu všech požadavků, tedy asi 1,7 procenta. To je víc než jedno procento, takže skutečný 99. percentil za hodinu je pět sekund. Tene to v přednášce říká přímo: percentily průměrovat nejde, taková matematika neexistuje. Pokud potřebujete agregovat přes čas nebo přes servery, slučujte celé histogramy a percentil spočítejte až z nich.`,
  },

  {
    id: 'past3',
    cls: 'paper',
    section: '02 · Jak to shrneme',
    foot: 'full',
    sec: 50,
    html: `
<p class="kicker muted" style="left:128px;top:128px;width:900px">Past 3 · fan-out · Dean &amp; Barroso${cite(4)}</p>
<h2 class="h2" style="left:128px;top:168px;width:1664px">Vzácné na serveru, běžné u uživatele</h2>
<div style="left:128px;top:300px;width:700px;display:flex;flex-direction:column;gap:8px">
  <p class="big" style="font-size:180px;letter-spacing:-8px"><span data-roll>1</span> %</p>
  <p class="kicker">1 server · pomalý 1 požadavek ze 100</p>
</div>
<div data-step="1" style="left:128px;top:560px;width:700px;display:flex;flex-direction:column;gap:8px">
  <p class="big redink" style="font-size:180px;letter-spacing:-8px"><span data-roll>63</span> %</p>
  <p class="kicker">Dotaz čeká na 100 serverů</p>
</div>
<svg aria-label="Pravděpodobnost pomalého dotazu 1 − 0,99^n podle počtu serverů" style="left:920px;top:290px" width="872" height="470" viewBox="0 0 872 470" font-family="JetBrains Mono, monospace" font-size="20">
  ${[0, 0.25, 0.5, 0.75, 1]
    .map(
      (p) =>
        `<line x1="80" y1="${py(p)}" x2="840" y2="${py(p)}" stroke="#C9C8C3" stroke-width="2"/><text x="66" y="${py(p) + 7}" text-anchor="end" fill="#5A5955">${p * 100} %</text>`
    )
    .join('')}
  <line x1="80" y1="380" x2="840" y2="380" stroke="#141414" stroke-width="2"/>
  <text x="80" y="414" text-anchor="middle" fill="#5A5955">1</text>
  <text x="460" y="414" text-anchor="middle" fill="#5A5955">50</text>
  <text x="840" y="414" text-anchor="middle" fill="#5A5955">100</text>
  <text x="460" y="456" text-anchor="middle" fill="#141414" letter-spacing="2">POČET SERVERŮ V DOTAZU</text>
  <circle cx="${px(1)}" cy="${py(0.01)}" r="9" fill="#2E4BF5"/>
  <g data-step="1">
    <polyline class="draw" style="--len:1000" points="${fanoutPts}" fill="none" stroke="#C8321F" stroke-width="5" stroke-linejoin="round"/>
    <line x1="80" y1="${py(0.634)}" x2="840" y2="${py(0.634)}" stroke="#C8321F" stroke-width="2" stroke-dasharray="8 8"/>
    <circle cx="${px(100)}" cy="${py(0.634)}" r="10" fill="#C8321F"/>
    <text x="826" y="${py(0.634) - 22}" text-anchor="end" fill="#C8321F" font-size="22">1 − 0,99¹⁰⁰ ≈ 63 %</text>
  </g>
</svg>
<p class="body" data-step="2" style="left:128px;top:822px;width:1664px">Medián ani p99 jednoho serveru neřekne, co zažije uživatel. <b>Rozhoduje ocas.</b></p>`,
    notes: `Třetí past: díváme se na jeden server, ale uživatel čeká na mnoho. Jeff Dean a Luiz Barroso z Googlu to popsali v článku The Tail at Scale. Představte si server, který obvykle odpoví za deset milisekund, ale jeden požadavek ze sta trvá celou sekundu. Pro jednotlivé volání je to jedno procento, ocas, který v průměru zmizí. [KLIK] Jenže jeden dotaz uživatele se ve velkém systému často rozpadne na desítky až stovky volání a odpověď je hotová, až když dorazí ta nejpomalejší. Když dotaz čeká na sto takových serverů, pravděpodobnost, že aspoň jeden bude pomalý, je jedna minus 0,99 na stou, tedy 63 procent. [KLIK] Co je na jednom serveru vzácný ocas, je pro uživatele běžný zážitek. Proto u latence nestačí sledovat průměr ani medián. Rozhoduje ocas.`,
  },

  {
    id: 'd3',
    cls: 'dark',
    foot: 'num',
    sec: 5,
    html: `
<p class="kicker" style="left:128px;top:128px;width:600px;color:var(--lime)">03 / 03</p>
<h1 class="h1" data-split style="left:116px;top:320px;width:1700px;font-size:200px;letter-spacing:-8px;line-height:0.88">Jak měřit<br>správně</h1>
<p class="body" style="left:128px;top:760px;width:1200px;color:#bdbcb6">Dvě opravy měření a dvě opravy shrnutí.</p>`,
    notes: `Co s tím tedy dělat?`,
  },

  {
    id: 'reseni',
    cls: 'paper',
    section: '03 · Jak měřit správně',
    foot: 'full',
    sec: 75,
    html: `
<p class="kicker muted" style="left:128px;top:128px;width:900px">Řešení</p>
<h2 class="h2" style="left:128px;top:168px;width:1664px">Dvě opravy měření, dvě opravy shrnutí</h2>
<div class="card" style="left:128px;top:280px;width:800px">
  <p class="n">01 · MĚŘENÍ</p>
  <p class="h3">Posílej podle plánu, ne podle odpovědí</p>
  <p class="small">Otevřený model: požadavky přicházejí stálým tempem bez ohledu na to, jak rychle server odpovídá.${cite('5,6')}</p>
  <p class="tool">wrk2: wrk -t2 -c100 -d30s -R2000 …<br>k6: executor 'constant-arrival-rate'</p>
</div>
<div class="card" data-step="1" style="left:992px;top:280px;width:800px">
  <p class="n">02 · MĚŘENÍ</p>
  <p class="h3">Počítej čas od plánovaného odeslání</p>
  <p class="small">Latence = konec − okamžik, kdy požadavek <i>měl</i> odejít. Chybějící vzorky lze doplnit i dodatečně.${cite('2,7')}</p>
  <p class="tool">HdrHistogram:<br>recordValueWithExpectedInterval()</p>
</div>
<div class="card" data-step="2" style="left:128px;top:600px;width:800px">
  <p class="n">03 · SHRNUTÍ</p>
  <p class="h3">Hlas rozdělení, ne jedno číslo</p>
  <p class="small">p50, p90, p99, p99,9 a maximum. Nejlépe celý graf percentilů.${cite(1)}</p>
</div>
<div class="card" data-step="3" style="left:992px;top:600px;width:800px">
  <p class="n">04 · SHRNUTÍ</p>
  <p class="h3">Slučuj histogramy, ne percentily</p>
  <p class="small">Histogramy se dají sčítat přes čas i servery. Percentil se počítá až z výsledku.${cite(7)}</p>
</div>`,
    notes: `Řešení má dvě části: opravit měření a opravit shrnutí. První oprava: zátěž se posílá podle plánu, ne podle odpovědí. Tomu se říká otevřený model. Požadavky přicházejí stálým tempem, stejně jako skuteční uživatelé, kterým je jedno, že server má zrovna problém. Rozdíl mezi otevřeným a uzavřeným modelem popsali už v roce 2006 Schroeder, Wierman a Harchol-Balter. V praxi to umí třeba wrk2 s parametrem -R nebo k6 s executorem constant-arrival-rate. [KLIK] Druhá oprava: čas se počítá od okamžiku, kdy požadavek MĚL odejít, ne kdy skutečně odešel. Knihovna HdrHistogram navíc umí chybějící vzorky doplnit i dodatečně, když jí řeknete, jaký byl plánovaný interval. [KLIK] Třetí: místo jednoho čísla hlásit rozdělení. Medián, devadesátý, devadesátý devátý percentil, tři devítky a maximum. Ideálně celý graf. [KLIK] A čtvrtá: když agregujete přes čas nebo přes servery, slučujte histogramy. Histogramy se dají sčítat, percentily ne.`,
  },

  {
    id: 'zaver',
    cls: 'dark',
    section: 'Závěr',
    foot: 'full',
    sec: 35,
    html: `
<p class="kicker" style="left:128px;top:128px;width:900px;color:var(--lime)">Závěr · tři otázky ke každému grafu latence</p>
<h2 class="h1" data-split style="left:128px;top:200px;width:1600px;font-size:96px;letter-spacing:-3px;line-height:1;text-transform:none">Server byl pokaždé stejný. Lhal jen způsob měření.</h2>
${[
  ['01', 'Odkud se počítá čas?', 'Od plánovaného odeslání, ne od skutečného.'],
  ['02', 'Je to průměr?', 'Chci vidět percentily a maximum.'],
  ['03', 'Jak se agregovalo?', 'Slučují se histogramy, ne percentily.'],
]
  .map(
    ([n, q, a], i) => `
<div data-step="${i + 1}" style="left:128px;top:${520 + i * 112}px;width:1664px;display:grid;grid-template-columns:120px 640px 1fr;align-items:baseline;border-top:2px solid #3a3a38;padding-top:24px">
  <p class="kicker" style="color:var(--lime)">${n}</p>
  <p style="font-size:44px;font-weight:800;letter-spacing:-1px">${q}</p>
  <p class="body" style="color:#bdbcb6">${a}</p>
</div>`
  )
  .join('')}`,
    notes: `Na závěr. Ve všech příkladech, které jsme viděli, byl server pokaždé stejný. Lhal jen způsob měření a způsob shrnutí. Až příště uvidíte graf latence, položte si tři otázky. [KLIK] Odkud se počítá čas? Od plánovaného odeslání, nebo až od skutečného? [KLIK] Je to průměr? Pokud ano, chtějte percentily a maximum. [KLIK] A jak se data agregovala? Pokud se průměrovaly percentily, číslo neplatí.`,
  },

  {
    id: 'zdroje',
    cls: 'paper',
    section: 'Zdroje',
    foot: 'full',
    sec: 10,
    html: `
<p class="kicker dash" style="left:128px;top:96px;width:900px">Zdroje</p>
<div style="left:128px;top:170px;width:800px;display:flex;flex-direction:column;gap:30px">
  <div class="src"><p class="i">[1]</p><div><p class="t">How NOT to Measure Latency <span>· G. Tene, přednáška, QCon San Francisco 2012</span></p><a href="https://qconsf.com/sf2012/dl/qcon-sanfran-2012/slides/GilTene_HowNotToMeasureLatency.pdf" target="_blank" rel="noopener">qconsf.com/sf2012/…/GilTene_HowNotToMeasureLatency.pdf</a></div></div>
  <div class="src"><p class="i">[2]</p><div><p class="t">wrk2: constant throughput, correct latency recording <span>· G. Tene, GitHub</span></p><a href="https://github.com/giltene/wrk2" target="_blank" rel="noopener">github.com/giltene/wrk2</a></div></div>
  <div class="src"><p class="i">[3]</p><div><p class="t">Coordinated Omission <span>· diskuse, skupina Mechanical Sympathy</span></p><a href="https://groups.google.com/g/mechanical-sympathy/c/icNZJejUHfE/m/BfDekfBEs_sJ" target="_blank" rel="noopener">groups.google.com/g/mechanical-sympathy/c/icNZJejUHfE</a></div></div>
  <div class="src"><p class="i">[4]</p><div><p class="t">The Tail at Scale <span>· J. Dean, L. A. Barroso, Communications of the ACM 56(2), 2013</span></p><a href="https://doi.org/10.1145/2408776.2408794" target="_blank" rel="noopener">doi.org/10.1145/2408776.2408794</a></div></div>
</div>
<div style="left:992px;top:170px;width:800px;display:flex;flex-direction:column;gap:30px">
  <div class="src"><p class="i">[5]</p><div><p class="t">Open Versus Closed: A Cautionary Tale <span>· B. Schroeder, A. Wierman, M. Harchol-Balter, NSDI 2006</span></p><a href="https://www.usenix.org/conference/nsdi-06/open-versus-closed-cautionary-tale" target="_blank" rel="noopener">usenix.org/conference/nsdi-06/open-versus-closed-cautionary-tale</a></div></div>
  <div class="src"><p class="i">[6]</p><div><p class="t">Open and closed models <span>· Grafana k6, dokumentace</span></p><a href="https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/" target="_blank" rel="noopener">grafana.com/docs/k6/latest/…/open-vs-closed</a></div></div>
  <div class="src"><p class="i">[7]</p><div><p class="t">HdrHistogram <span>· G. Tene a kol., GitHub</span></p><a href="https://github.com/HdrHistogram/HdrHistogram" target="_blank" rel="noopener">github.com/HdrHistogram/HdrHistogram</a></div></div>
  <div class="src"><p class="i">[8]</p><div><p class="t">How NOT to Measure Latency, přepis záznamu <span>· Amara</span></p><a href="https://amara.org/videos/0vqzbDPNIIbE/en/1317064/3393860/" target="_blank" rel="noopener">amara.org/videos/0vqzbDPNIIbE</a></div></div>
</div>
<p class="small muted" style="left:128px;top:800px;width:1664px">Čísla na slidech „Past 1“ a „Past 2“ jsou vlastní modelové výpočty.</p>`,
    notes: `Zdroje najdete tady, celá prezentace je online i s odkazy. Děkuji za pozornost a rád odpovím na otázky.`,
  },
];
