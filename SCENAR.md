# Coordinated Omission a pasti průměrných časů: text k přednesu

Tučně jsou klíčové věty. Verze k tisku: SCENAR.pdf.

Referát KIV/PTE (Pokročilé testování), ZČU FAV · Oldřich Jan Švehla

Plánovaná délka **10:35** (855 slov; čas je odhadnutý podle zkoušky nanečisto, asi 80 slov za minutu včetně pauz a kliků).
`[KLIK]` znamená posun na další krok (šipka → nebo mezerník).
V prezentaci otevře klávesa **P** režim řečníka s tímto textem, časovačem a náhledem dalšího kroku.

## 01 · Úvod

*0:00–0:55 · cca 55 s*

Dobrý den. U zátěžových testů nás nejvíc zajímá doba odezvy. Dnes ukážu, **proč to číslo umí lhát, i když ho nikdo nefalšuje**. Příčiny jsou dvě: **coordinated omission**, česky koordinované vynechání, pojem od Gila Tene, a **průměry**. Graf na pozadí to ukazuje zjednodušeně. Vodorovně je čas, svisle doba odezvy. Žlutě je, co naměřil testovací nástroj: **jeden pomalý vzorek a pak nic**. Růžově je, co zažili uživatelé: kdo přišel na začátku výpadku, čekal nejdéle.

## 02 · Teze

*0:55–1:30 · cca 35 s*

Coordinated omission je **chyba v tom, co naměříte**: nástroj se zasekne spolu se systémem a nejhorší chvíle v datech chybí. To jsou prázdné kroužky na obrázku vlevo. Průměr je **chyba v tom, jak to shrnete**: schová ocas, tedy nejpomalejší odpovědi na obrázku vpravo. `[KLIK]` Zkrátka: **první kazí data, druhá závěry**.

## 03 · Předěl: Co měříme

*1:30–1:35 · cca 5 s*

Začnu měřením.

## 04 · Uzavřená smyčka

*1:35–2:30 · cca 55 s*

Většina nástrojů na zátěžové testy funguje **v uzavřené smyčce**, třeba běžná Thread Group v JMeteru. Každé vlákno pošle požadavek, počká na odpověď, zapíše čas a teprve pak pošle další. Nahoře je plán, dole to, co se opravdu odeslalo. `[KLIK]` Teď se server zasekne. Vlákno čeká s ním a nakonec zapíše jeden pomalý vzorek. `[KLIK]` Jenže tyhle požadavky měly mezitím odejít. **Co nikdo neposlal, to nikdo nezměřil.** Z výpadku tak zbude **jeden pomalý vzorek mezi stovkami rychlých**.

## 05 · Definice

*2:30–3:10 · cca 40 s*

Tene říká, že se systém a měřič nechtěně sladí: **když zpomalí systém, zpomalí i měření**. `[KLIK]` Je to jako anketa, která se ptá jen lidí odcházejících od přepážky. Když je přepážka zavřená, nikdo si nestěžuje. `[KLIK]` Test pak vidí hlavně dobu obsluhy. **Uživatel ale zažívá dobu odezvy: čekání ve frontě plus obsluhu.**

## 06 · Myšlenkový pokus: 100 s běží, 100 s stojí

*3:10–4:30 · cca 80 s*

Tene to ukazuje na pokusu. Systém sto sekund odpovídá za milisekundu, pak sto sekund stojí. Nástroj nasbírá deset tisíc rychlých vzorků a jeden stosekundový. Průměr vyjde necelých jedenáct milisekund. A protože **99. percentil je hodnota, pod kterou leží 99 procent měření**, jeden pomalý vzorek z deseti tisíc s ním nepohne: **i 99,99. percentil je milisekunda**. `[KLIK]` Kdyby lidé chodili dál, přišlo by během výpadku dalších deset tisíc požadavků. Kdo přišel na začátku, čeká sto sekund, kdo na konci, skoro nic, **takže v průměru padesát**. Polovina požadavků je rychlá a polovina čeká padesát, **celkem tedy asi pětadvacet sekund**. `[KLIK]` **Server je v obou sloupcích stejný. Liší se jen měření.**

## 07 · wrk2: 200×

*4:30–5:20 · cca 50 s*

A v praxi? Tene napsal wrk2, nástroj na zátěžové testy, který vypíše čísla dvakrát: jednou měřená od skutečného odeslání, jednou od plánovaného. Tomu druhému se říká korekce. V jeho příkladu server na 1,4 sekundy stojí. **Bez korekce je 99. percentil šest milisekund.** `[KLIK]` **S korekcí 1 270**, zhruba dvěstěkrát víc. `[KLIK]` Rozdíl je jen v tom, že korekce **počítá čas od chvíle, kdy požadavek měl odejít**.

## 08 · Předěl: Jak to shrneme

*5:20–5:25 · cca 5 s*

I při správném měření čekají tři pasti.

## 09 · Past 1: stejný průměr, jiný svět

*5:25–6:05 · cca 40 s*

První je samotný průměr. Systém A odpoví vždy za padesát milisekund. Systém B v 95 procentech za deset a v pěti procentech za 810. **Průměr mají oba padesát.** `[KLIK]` Ale **99. percentil systému B je 810 milisekund**, protože nejhorší procento leží v těch pomalých pěti. **Proto se hlásí percentily a maximum.**

## 10 · Past 2: percentily se nedají průměrovat

*6:05–7:10 · cca 65 s*

Druhá past je skoro v každém dashboardu: 99. percentil za každou minutu a pak jejich průměr za hodinu. Tady má 59 minut dvacet milisekund a jedna minuta pět sekund. Pozor, osa je logaritmická. Průměr vyjde 103 milisekund. `[KLIK]` Jenže ta minuta je šedesátina provozu, asi 1,7 procenta, tedy víc než jedno procento. **Skutečný 99. percentil je pět sekund.** Tene to říká jasně: **percentily průměrovat nejde**. Sčítat se mají histogramy. Histogram je jen počet měření v jednotlivých intervalech, takže se dá sčítat, a percentil se spočítá až ze součtu.

## 11 · Past 3: fan-out (The Tail at Scale)

*7:10–8:10 · cca 60 s*

Třetí past popsali Dean a Barroso z Googlu. Server je pomalý, tedy sekundu a víc, jen v jednom případě ze sta. `[KLIK]` Velké systémy ale rozdělí jeden dotaz na desítky až stovky paralelních volání a odpověď je hotová, až když dorazí to poslední. Řekněme, že dotaz čeká na sto serverů. Šance, že budou všechny rychlé, je 0,99 na stou, asi 37 procent. Takže **aspoň jeden pomalý je v 63 procentech**. `[KLIK]` Co je pro server vzácnost, je pro uživatele běžné. **Rozhoduje ocas.**

## 12 · Předěl: Jak měřit správně

*8:10–8:15 · cca 5 s*

Co s tím?

## 13 · Řešení: dvě opravy měření, dvě opravy shrnutí

*8:15–9:10 · cca 55 s*

Dvě opravy měření a dvě opravy shrnutí. První: **posílat zátěž podle plánu, ne podle odpovědí**. V JMeteru to umí **Open Model Thread Group**, která místo počtu vláken plánuje příchody požadavků. Podobně nástroj k6 nebo wrk2. `[KLIK]` Druhá: **počítat čas od plánovaného odeslání**. Knihovna HdrHistogram umí chybějící vzorky dopočítat. `[KLIK]` Třetí: **hlásit percentily a maximum**. `[KLIK]` Čtvrtá: **slučovat histogramy, ne percentily**. A rychlá kontrola: **sedí skutečná propustnost s plánovanou**? Propustnost je počet požadavků za sekundu. Když je nižší, nástroj čekal.

## 14 · Závěr

*9:10–10:25 · cca 75 s*

**Číslo je jen tak dobré jako způsob, jakým vzniklo.** Takže u každého grafu latence: `[KLIK]` Odkud se počítá čas? **Má se počítat od chvíle, kdy požadavek podle plánu měl odejít, ne od chvíle, kdy ho nástroj skutečně poslal.** Jinak se čekání ve frontě do výsledku vůbec nedostane, přesně jako v tom myšlenkovém pokusu. `[KLIK]` Je to průměr? **Pak chtějte vidět percentily a maximum.** Průměr schová ocas rozdělení, tedy právě ty pomalé odpovědi, které uživatelé vnímají nejvíc. `[KLIK]` A jak se data sčítala? **Pokud někdo průměroval percentily po minutách nebo po serverech, výsledné číslo neplatí.** Správně se sčítají celé histogramy a percentil se spočítá až z výsledku.

## 15 · Zdroje a poděkování

*10:25–10:35 · cca 10 s*

Zdroje jsou tady i online. Děkuji za pozornost a rád odpovím na otázky.

---

Tento soubor se generuje ze `src/slides.js` příkazem `npm run scenar`. Text upravuj tam.
