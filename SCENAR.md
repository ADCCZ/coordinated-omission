# Coordinated Omission a pasti průměrných časů: text k přednesu

Tučně jsou klíčové věty. Verze k tisku: SCENAR.pdf.

Referát KIV/PTE (Pokročilé testování), ZČU FAV · Oldřich Jan Švehla

Plánovaná délka **9:45** (1249 slov, zhruba 130 slov za minutu).
`[KLIK]` znamená posun na další krok (šipka → nebo mezerník).
V prezentaci otevře klávesa **P** režim řečníka s tímto textem, časovačem a náhledem dalšího kroku.

## 01 · Úvod

*0:00–0:55 · cca 55 s*

Dobrý den. U zátěžového testu nás většinou nejvíc zajímá doba odezvy. A já vám chci ukázat, **že tohle číslo umí lhát, i když ho nikdo nefalšuje**. Důvody jsou dva. Prvnímu se říká **coordinated omission**, česky koordinované vynechání. Pojem zavedl Gil Tene z firmy Azul Systems. Ten druhý znáte všichni: **jsou to průměry**, tedy jak z tisíců měření uděláme jedno číslo. Graf na pozadí ukazuje celý problém ve zjednodušené podobě. Na vodorovné ose je čas odeslání požadavku, na svislé doba odezvy. Žlutá čára je to, co naměřil testovací nástroj: **jeden pomalý vzorek a pak během výpadku nic**. Růžově je to, co mezitím zažili uživatelé. Kdo přišel na začátku výpadku, čekal celou dobu, kdo přišel těsně před koncem, skoro nic.

## 02 · Teze

*0:55–1:30 · cca 35 s*

Coordinated omission je **chyba v tom, co naměříte**. Měřicí nástroj se zasekne ve stejnou chvíli jako systém, a většina nejhorších okamžiků se tak do dat vůbec nedostane. To jsou ty prázdné kroužky na obrázku vlevo. Průměr je zase **chyba v tom, jak naměřené shrnete**. I kdyby byla data v pořádku, jedno číslo neřekne nic o nejpomalejších odpovědích, tedy o tom ocasu na obrázku vpravo. A právě ty si uživatelé pamatují. `[KLIK]` Zkráceně: **první chyba kazí data, druhá kazí závěry**.

## 03 · Předěl: Co měříme

*1:30–1:35 · cca 5 s*

Začnu tím měřením.

## 04 · Uzavřená smyčka

*1:35–2:40 · cca 65 s*

Většina nástrojů na zátěžové testy funguje **v takzvané uzavřené smyčce**. Třeba JMeter, open-source nástroj na zátěžové testy od Apache: v jeho běžné Thread Group hraje každé vlákno jednoho virtuálního uživatele. Vlákno pošle požadavek, počká na odpověď, zapíše si, jak dlouho to trvalo, a teprve potom pošle další. Horní řada ukazuje plán, třeba sto požadavků za sekundu. Dokud server odpovídá rychle, spodní řada ho přesně kopíruje. `[KLIK]` Teď se server na chvíli zasekne, třeba kvůli garbage collectoru nebo zámku v databázi. Požadavek, který zrovna běží, čeká, a vlákno čeká s ním. Když odpověď konečně přijde, zapíše se jeden pomalý vzorek. `[KLIK]` A tady je háček. Tyhle požadavky měly během zaseknutí odejít, jenže vlákno čekalo, a tak je nikdo neposlal. **A co nikdo neposlal, to nikdo nezměřil.** Z celého výpadku tak v datech zbude **jeden pomalý vzorek mezi stovkami rychlých**.

## 05 · Definice

*2:40–3:20 · cca 40 s*

Tene tomu říká coordinated omission, protože se měřený systém a měřicí nástroj nechtěně sladí: **když zpomalí systém, zpomalí i měření a přestane se ptát**. `[KLIK]` Představte si anketu spokojenosti, kde se ptáte jen lidí, kteří odcházejí od přepážky. Když se přepážka na hodinu zavře, nikdo neodchází, a tak si nikdo nestěžuje. Fronta venku se do výsledků vůbec nedostane. `[KLIK]` V jazyce teorie front: test pak měří hlavně dobu obsluhy, service time: jak dlouho trvalo vyřídit požadavek, když na něj přišla řada. Jenže **uživatel zažívá dobu odezvy, response time, a to je čekání ve frontě plus obsluha**.

## 06 · Myšlenkový pokus: 100 s běží, 100 s stojí

*3:20–4:50 · cca 90 s*

Jak velký ten rozdíl může být? Tene má na to myšlenkový pokus. Systém sto sekund odpovídá za jednu milisekundu, sto požadavků za sekundu. Pak se systém na sto sekund úplně zastaví. Nástroj v uzavřené smyčce nasbírá deset tisíc rychlých vzorků a jeden, který trvá sto sekund. Průměr mu vyjde necelých jedenáct milisekund. Připomenu, co je percentil: **99. percentil je hodnota, pod kterou leží 99 procent měření**, takže jen jeden požadavek ze sta je pomalejší. Náš pomalý vzorek je jeden z víc než deseti tisíc, a tak **i 99,99. percentil ukáže jednu milisekundu**. Vypadá to jako skvělý systém. `[KLIK]` Kdyby ale lidé chodili dál podle plánu, přišlo by během zmrazení dalších deset tisíc požadavků. Kdo přišel na začátku, čeká sto sekund, kdo na konci, skoro nic, **takže v průměru padesát sekund**. Polovina všech požadavků je rychlá a polovina čeká v průměru padesát sekund, proto **celkový průměr vychází asi na pětadvacet sekund**. 75. percentil padne doprostřed té pomalé poloviny, na padesát sekund, a 99,99. percentil skoro na sto. Medián leží přesně na hranici obou polovin, a tak zůstane kolem milisekundy. `[KLIK]` Všimněte si, že **server je v obou sloupcích stejný. Liší se jen způsob měření.**

## 07 · wrk2: 200×

*4:50–5:25 · cca 35 s*

Není to jen teorie. Tene napsal wrk2, nástroj na zátěžové testy HTTP, který vypíše čísla s korekcí i bez ní. V příkladu z jeho dokumentace se server během třicetisekundového testu na 1,4 sekundy pozastaví. **Bez korekce vyjde 99. percentil šest milisekund.** `[KLIK]` **S korekcí 1 270 milisekund**, zhruba dvěstěkrát víc. `[KLIK]` Jediný rozdíl je v tom, odkud se počítá čas. Verze s korekcí ho **počítá od chvíle, kdy požadavek měl odejít**, ne od chvíle, kdy skutečně odešel.

## 08 · Předěl: Jak to shrneme

*5:25–5:35 · cca 10 s*

Řekněme, že už měříme správně. Data ale pořád musíme shrnout do čísla, které někomu ukážeme. A tady čekají tři pasti.

## 09 · Past 1: stejný průměr, jiný svět

*5:35–6:15 · cca 40 s*

První past je samotný průměr. Systém A odpoví na každý požadavek za padesát milisekund. Systém B odpoví v 95 procentech případů za deset milisekund a ve zbylých pěti procentech za 810. Když si to spočítáte, 0,95 krát 10 plus 0,05 krát 810 je přesně padesát. **Oba systémy mají stejný průměr.** `[KLIK]` Jenže **99. percentil systému B je 810 milisekund**, protože nejhorší procento leží v těch pomalých pěti procentech. To je šestnáctkrát víc než u systému A. **Proto se hlásí percentily a maximum, ne jedno číslo.**

## 10 · Past 2: percentily se nedají průměrovat

*6:15–7:10 · cca 55 s*

Druhou past najdete skoro v každém dashboardu. Monitoring spočítá 99. percentil za každou minutu a pro hodinový pohled je zprůměruje. Tady je taková hodina: 59 minut má p99 dvacet milisekund a jedna minuta je výpadek, kdy každý požadavek trvá pět sekund. **Pozor, osa je logaritmická**, jinak by dvacet milisekund vedle pěti sekund nebylo vidět. Průměr minutových p99 vyjde 103 milisekund, tedy mírné zhoršení. `[KLIK]` Jenže při stejném provozu je ta minuta šedesátina všech požadavků, asi 1,7 procenta. To je víc než jedno procento, a proto **skutečný 99. percentil za hodinu je pět sekund**. Tene to říká přímo: **percentily se průměrovat nedají**. Když sčítáte přes čas nebo přes servery, **slučujte celé histogramy** a percentil spočítejte až z nich.

## 11 · Past 3: fan-out (The Tail at Scale)

*7:10–8:05 · cca 55 s*

Třetí past popsali Jeff Dean a Luiz Barroso z Googlu v článku The Tail at Scale: díváme se na jeden server, ale uživatel čeká na mnoho serverů najednou. Vezměte server, jehož 99. percentil je jedna sekunda, takže jeden požadavek ze sta trvá sekundu nebo víc. `[KLIK]` Jeden dotaz uživatele se ale ve velkém systému rozpadne na desítky až stovky paralelních volání a hotovo je, až když dorazí to nejpomalejší. Když dotaz čeká na sto takových serverů, šance, že budou všechny rychlé, je 0,99 na stou, asi 37 procent. Pravděpodobnost, že aspoň jeden bude pomalý, je tedy **jedna minus 0,99 na stou, tedy 63 procent**. `[KLIK]` Co je na jednom serveru vzácnost, je pro uživatele běžný zážitek. **Rozhoduje ocas.**

## 12 · Předěl: Jak měřit správně

*8:05–8:10 · cca 5 s*

Tak co s tím?

## 13 · Řešení: dvě opravy měření, dvě opravy shrnutí

*8:10–9:05 · cca 55 s*

Opravy jsou dvě na měření a dvě na shrnutí. První: **posílat zátěž podle plánu, ne podle odpovědí**. Tomu se říká otevřený model. V JMeteru ho od verze 5.5 umí **Open Model Thread Group**, která neplánuje počet vláken, ale příchody požadavků. Podobně to umí nástroj k6 nebo wrk2. `[KLIK]` Druhá: **počítat čas od chvíle, kdy požadavek měl odejít**. Knihovna HdrHistogram, která ukládá latence do histogramu, umí chybějící vzorky i dopočítat. `[KLIK]` Třetí: místo jednoho čísla **hlásit rozdělení, tedy percentily a maximum**. `[KLIK]` A čtvrtá: při sčítání přes čas nebo servery **slučovat histogramy, ne percentily**. A jedna kontrola, kterou zvládnete hned: **sedí skutečná propustnost testu s plánovanou**? Propustnost je počet požadavků za sekundu. Pokud nástroj poslal méně požadavků, než měl, čekal.

## 14 · Závěr

*9:05–9:35 · cca 30 s*

Ve všech příkladech s měřením byl server pořád stejný. **Číslo je jen tak dobré jako způsob, jakým vzniklo.** Až příště uvidíte graf latence, zkuste si položit tři otázky. `[KLIK]` Odkud se počítá čas? Od plánovaného odeslání, nebo až od skutečného? `[KLIK]` Je to průměr? Pokud ano, chtějte percentily a maximum. `[KLIK]` A jak se data sčítala? Pokud někdo průměroval percentily, to číslo neplatí.

## 15 · Zdroje a poděkování

*9:35–9:45 · cca 10 s*

Zdroje najdete tady a celá prezentace je online i s odkazy. Děkuji za pozornost a rád odpovím na otázky.

---

Tento soubor se generuje ze `src/slides.js` příkazem `npm run scenar`. Text upravuj tam.
