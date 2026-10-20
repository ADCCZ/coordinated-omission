# Coordinated Omission a pasti průměrných časů: text k přednesu

Tučně jsou klíčové věty. Verze k tisku: SCENAR.pdf.

Referát KIV/PTE (Pokročilé testování), ZČU FAV · Oldřich Jan Švehla

Plánovaná délka **8:45** (704 slov; čas je odhadnutý podle zkoušky nanečisto, asi 80 slov za minutu včetně pauz a kliků).
`[KLIK]` znamená posun na další krok (šipka → nebo mezerník).
V prezentaci otevře klávesa **P** režim řečníka s tímto textem, časovačem a náhledem dalšího kroku.

## 01 · Úvod

*0:00–0:50 · cca 50 s*

Dobrý den. U zátěžových testů nás nejvíc zajímá doba odezvy. Dnes ukážu, **proč to číslo umí lhát, i když ho nikdo nefalšuje**. Příčiny jsou dvě: **coordinated omission**, pojem od Gila Tene, a **průměry**. Graf na pozadí to ukazuje zjednodušeně. Vodorovně je čas, svisle doba odezvy. Žlutě je, co naměřil testovací nástroj: **jeden pomalý vzorek a pak nic**. Růžově je, co zažili uživatelé: kdo přišel na začátku výpadku, čekal nejdéle.

## 02 · Teze

*0:50–1:25 · cca 35 s*

Coordinated omission je **chyba v tom, co naměříte**: nástroj se zasekne spolu se systémem a nejhorší chvíle v datech chybí. To jsou prázdné kroužky na obrázku vlevo. Průměr je **chyba v tom, jak to shrnete**: schová ocas, tedy nejpomalejší odpovědi na obrázku vpravo. `[KLIK]` Zkrátka: **první kazí data, druhá závěry**.

## 03 · Předěl: Co měříme

*1:25–1:30 · cca 5 s*

Začnu měřením.

## 04 · Uzavřená smyčka

*1:30–2:25 · cca 55 s*

Většina nástrojů na zátěžové testy funguje **v uzavřené smyčce**, třeba běžná Thread Group v JMeteru. Každé vlákno pošle požadavek, počká na odpověď, zapíše čas a teprve pak pošle další. Nahoře je plán, dole to, co se opravdu odeslalo. `[KLIK]` Teď se server zasekne. Vlákno čeká s ním a nakonec zapíše jeden pomalý vzorek. `[KLIK]` Jenže tyhle požadavky měly mezitím odejít. **Co nikdo neposlal, to nikdo nezměřil.** Z výpadku tak zbude **jeden pomalý vzorek mezi stovkami rychlých**.

## 05 · Definice

*2:25–3:05 · cca 40 s*

Tene říká, že se systém a měřič nechtěně sladí: **když zpomalí systém, zpomalí i měření**. `[KLIK]` Je to jako anketa, která se ptá jen lidí odcházejících od přepážky. Když je přepážka zavřená, nikdo si nestěžuje. `[KLIK]` Test pak vidí hlavně dobu obsluhy. **Uživatel ale zažívá dobu odezvy: čekání ve frontě plus obsluhu.**

## 06 · Myšlenkový pokus: 100 s běží, 100 s stojí

*3:05–4:20 · cca 75 s*

Tene to ukazuje na pokusu. Systém sto sekund odpovídá za milisekundu, pak sto sekund stojí. Nástroj nasbírá deset tisíc rychlých vzorků a jeden stosekundový. Průměr vyjde necelých jedenáct milisekund. A protože **99. percentil je hodnota, pod kterou leží 99 procent měření**, jeden pomalý vzorek z deseti tisíc s ním nepohne: **i 99,99. percentil je milisekunda**. `[KLIK]` Kdyby lidé chodili dál, přišlo by během výpadku dalších deset tisíc požadavků a **v průměru by čekaly padesát sekund**. Celkový průměr je tak asi **pětadvacet sekund**. Medián zůstane na milisekundě, protože rychlá je pořád polovina. `[KLIK]` **Server je v obou sloupcích stejný. Liší se jen měření.**

## 07 · wrk2: 200×

*4:20–4:55 · cca 35 s*

A v praxi? Tene napsal nástroj wrk2, který ukáže obojí. V jeho příkladu server na 1,4 sekundy stojí. **Bez korekce je 99. percentil šest milisekund.** `[KLIK]` **S korekcí 1 270**, zhruba dvěstěkrát víc. `[KLIK]` Rozdíl je jen v tom, že korekce **počítá čas od chvíle, kdy požadavek měl odejít**.

## 08 · Předěl: Jak to shrneme

*4:55–5:05 · cca 10 s*

Teď předpokládejme, že měříme správně. Pořád nás čekají tři pasti.

## 09 · Past 1: stejný průměr, jiný svět

*5:05–5:45 · cca 40 s*

První je samotný průměr. Systém A odpoví vždy za padesát milisekund. Systém B v 95 procentech za deset a v pěti procentech za 810. **Průměr mají oba padesát.** `[KLIK]` Ale **99. percentil systému B je 810 milisekund**, protože nejhorší procento leží v těch pomalých pěti. **Proto se hlásí percentily a maximum.**

## 10 · Past 2: percentily se nedají průměrovat

*5:45–6:35 · cca 50 s*

Druhá past je skoro v každém dashboardu: p99 za každou minutu a pak jejich průměr za hodinu. Tady má 59 minut dvacet milisekund a jedna minuta pět sekund. Pozor, osa je logaritmická. Průměr vyjde 103 milisekund. `[KLIK]` Jenže ta minuta je šedesátina provozu, asi 1,7 procenta, tedy víc než jedno procento. **Skutečný 99. percentil je pět sekund.** Tene to říká jasně: **percentily průměrovat nejde**. Sčítat se mají histogramy.

## 11 · Past 3: fan-out (The Tail at Scale)

*6:35–7:20 · cca 45 s*

Třetí past popsali Dean a Barroso z Googlu. Server je pomalý jen v jednom případě ze sta. `[KLIK]` Jenže dotaz uživatele často čeká na sto serverů najednou. Šance, že budou všechny rychlé, je 0,99 na stou, asi 37 procent. Takže **aspoň jeden pomalý je v 63 procentech**. `[KLIK]` Co je pro server vzácnost, je pro uživatele běžné. **Rozhoduje ocas.**

## 12 · Předěl: Jak měřit správně

*7:20–7:25 · cca 5 s*

Co s tím?

## 13 · Řešení: dvě opravy měření, dvě opravy shrnutí

*7:25–8:10 · cca 45 s*

Dvě opravy měření a dvě opravy shrnutí. První: **posílat zátěž podle plánu, ne podle odpovědí**. V JMeteru to umí **Open Model Thread Group**, podobně nástroj k6 nebo wrk2. `[KLIK]` Druhá: **počítat čas od plánovaného odeslání**. Knihovna HdrHistogram umí chybějící vzorky dopočítat. `[KLIK]` Třetí: **hlásit percentily a maximum**. `[KLIK]` Čtvrtá: **slučovat histogramy, ne percentily**. A rychlá kontrola: **sedí skutečná propustnost s plánovanou**? Když ne, nástroj čekal.

## 14 · Závěr

*8:10–8:35 · cca 25 s*

Server byl ve všech příkladech stejný. **Číslo je jen tak dobré jako způsob, jakým vzniklo.** Takže u každého grafu latence: `[KLIK]` Odkud se počítá čas? `[KLIK]` Je to průměr? `[KLIK]` A jak se data sčítala?

## 15 · Zdroje a poděkování

*8:35–8:45 · cca 10 s*

Zdroje jsou tady i online. Děkuji za pozornost a rád odpovím na otázky.

---

Tento soubor se generuje ze `src/slides.js` příkazem `npm run scenar`. Text upravuj tam.
