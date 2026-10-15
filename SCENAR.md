# Coordinated Omission a pasti průměrných časů: text k přednesu

Referát KIV/PTE (Pokročilé testování), ZČU FAV · Oldřich Švehla

Plánovaná délka **10:10** (1298 slov, zhruba 130 slov za minutu).
**[KLIK]** znamená posun na další krok (šipka → nebo mezerník).
V prezentaci otevře klávesa **P** režim řečníka s tímto textem, časovačem a náhledem dalšího kroku.

## 01 · Úvod

*0:00–0:30 · cca 30 s*

Dobrý den. Dnes vám chci ukázat, proč čísla z benchmarků a z monitoringu často lžou, i když je nikdo úmyslně nezfalšoval. Příčiny jsou dvě. První je coordinated omission, česky koordinované vynechání. Ten pojem zavedl Gil Tene ze společnosti Azul Systems. Druhou příčinou jsou průměry, a obecně to, jak z tisíců měření uděláme jedno číslo, které pak ukážeme v grafu nebo v tabulce. Graf na pozadí ukazuje celý problém v malém: měřič zapsal jediný pomalý vzorek a během výpadku pak nezapsal nic. Růžově je to, co by mezitím zažili uživatelé.

## 02 · Teze

*0:30–1:15 · cca 45 s*

Hned na začátek hlavní myšlenka. Coordinated omission je chyba v tom, CO naměříte. Měřicí nástroj zpomalí přesně ve chvíli, kdy zpomalí systém, a většina nejhorších okamžiků se do dat vůbec nedostane. To jsou ty prázdné kroužky vlevo. Průměr je chyba v tom, JAK naměřené shrnete. I s dokonalými daty jedno číslo schová ocas rozdělení, tedy ty nejpomalejší odpovědi vpravo. A právě ty si uživatelé pamatují. **[KLIK]** Takže: první chyba kazí data, druhá kazí závěry. A nejhorší je, když se potkají obě najednou.

## 03 · Předěl: Co měříme

*1:15–1:20 · cca 5 s*

Začněme tím, co vlastně měříme.

## 04 · Uzavřená smyčka

*1:20–2:35 · cca 75 s*

Většina klasických nástrojů pro zátěžové testy funguje v takzvané uzavřené smyčce. Tak funguje i běžná Thread Group v JMeteru, který používáme na cvičeních. Každé vlákno pošle požadavek, počká na odpověď, zapíše, jak dlouho to trvalo, a teprve potom pošle další. Horní řada ukazuje, kdy jsme chtěli požadavky posílat, třeba sto za sekundu. Dokud server odpovídá rychle, spodní řada plán věrně kopíruje. **[KLIK]** Teď se server na chvíli zasekne, třeba kvůli garbage collectoru, zámku v databázi nebo přetížené síti. Požadavek, který zrovna běží, čeká, a generátor čeká s ním. Až odpověď dorazí, zapíše se jeden pomalý vzorek. **[KLIK]** A tady je ten problém. Všechny tyhle požadavky měly během zaseknutí odejít, ale generátor je neposlal, protože čekal. Kdo je neposlal, ten je ani nezměřil. Z celého výpadku tak v datech zůstane jediný pomalý vzorek mezi stovkami rychlých.

## 05 · Definice

*2:35–3:20 · cca 45 s*

Gil Tene tomu říká coordinated omission. Měřený systém a měřicí nástroj se nevědomky sladí: když systém zpomalí, měřič zpomalí s ním a přestane se ptát. **[KLIK]** Je to jako anketa spokojenosti, kterou dělá někdo, kdo se ptá jen lidí odcházejících od přepážky. Když se přepážka na hodinu zavře, nikdo neodchází, a tedy si nikdo nestěžuje. Fronta venku do statistiky vůbec nevstoupí. **[KLIK]** Výsledek pak popisuje hlavně dobu obsluhy, anglicky service time, tedy jak dlouho trvalo vyřídit požadavek, když na něj přišla řada. Uživatel ale zažívá dobu odezvy, response time: čekání ve frontě plus obsluhu.

## 06 · Myšlenkový pokus: 100 s běží, 100 s stojí

*3:20–4:35 · cca 75 s*

Jak velký to má dopad? Tene ve své přednášce používá jednoduchý myšlenkový pokus. Systém sto sekund odpovídá za jednu milisekundu při zátěži sto požadavků za sekundu. Pak ho na sto sekund zmrazíme, v terminálu na to stačí Ctrl+Z. Generátor v uzavřené smyčce nasbírá deset tisíc vzorků po jedné milisekundě a jeden jediný vzorek o délce sto sekund. Průměr vyjde necelých jedenáct milisekund a i 99,99. percentil ukazuje jednu milisekundu. Vypadá to jako skvělý systém. **[KLIK]** Teď spočítejme, co by zažili uživatelé, kteří by chodili dál rovnoměrně, sto za sekundu. Během zmrazení by přišlo dalších deset tisíc požadavků a ty by čekaly v průměru padesát sekund. Průměr přes celých dvě stě sekund je kolem pětadvaceti sekund, 75. percentil padesát sekund a 99,99. percentil sto sekund. Medián je pořád zhruba jedna milisekunda, takže ani medián vás nezachrání. **[KLIK]** A všimněte si: server je v obou sloupcích stejný. Liší se jen způsob měření.

## 07 · wrk2: 200×

*4:35–5:15 · cca 40 s*

A není to jen teorie. Gil Tene napsal nástroj wrk2, který měří správně a umí vypsat i nekorigovaná čísla, takže jde obojí porovnat na jednom běhu. V příkladu z jeho dokumentace běží test třicet sekund při dvou tisících požadavcích za sekundu a během testu se server na 1,4 sekundy pozastaví. Nekorigovaný 99. percentil vyjde šest milisekund. **[KLIK]** Korigovaný vyjde 1 270 milisekund. To je zhruba dvousetnásobek. **[KLIK]** Stejný běh, stejný server. Rozdíl je jen v tom, že korigovaná verze počítá čas od chvíle, kdy požadavek MĚL odejít, a ne od chvíle, kdy skutečně odešel. (Nech číslo dvě stě chvíli viset.)

## 08 · Předěl: Jak to shrneme

*5:15–5:25 · cca 10 s*

Teď předpokládejme, že měříme správně a data máme v pořádku. Pořád je musíme nějak shrnout do čísla, které někomu ukážeme. A tady čekají tři pasti.

## 09 · Past 1: stejný průměr, jiný svět

*5:25–6:10 · cca 45 s*

První past: průměr nic neříká o tvaru rozdělení. Systém A odpoví na každý požadavek za padesát milisekund. Systém B odpoví na 95 procent požadavků za deset milisekund a na zbylých pět procent za 810 milisekund. Spočítejte si to: 0,95 krát 10 plus 0,05 krát 810 je přesně padesát. Oba mají stejný průměr. **[KLIK]** Ale 99. percentil systému B je 810 milisekund, šestnáctkrát víc než u systému A. Latence v reálných systémech obvykle nemá tvar Gaussova zvonu. Mívá dlouhý ocas doprava a často víc vrcholů, takže průměr ani směrodatná odchylka její tvar nepopíšou. Proto se hlásí percentily a maximum, ne jedno číslo.

## 10 · Past 2: percentily se nedají průměrovat

*6:10–7:05 · cca 55 s*

Druhá past je zrádnější, protože ji najdete skoro v každém dashboardu. Monitoring spočítá 99. percentil za každou minutu a pro hodinový pohled ho pak zprůměruje. Tady je hodina, kde 59 minut má p99 dvacet milisekund a jedna minuta je výpadek, kdy každý požadavek trvá pět sekund. Pozor, osa je logaritmická. Průměr minutových p99 vyjde 103 milisekund. Vypadá to jako mírné zhoršení, nikdo se nevzbudí. **[KLIK]** Jenže při rovnoměrném provozu tvoří ta jedna minuta šedesátinu všech požadavků, tedy asi 1,7 procenta. To je víc než jedno procento, takže skutečný 99. percentil za hodinu je pět sekund. Tene to v přednášce říká přímo: percentily průměrovat nejde, taková matematika neexistuje. Pokud potřebujete agregovat přes čas nebo přes servery, slučujte celé histogramy a percentil spočítejte až z nich.

## 11 · Past 3: fan-out (The Tail at Scale)

*7:05–7:55 · cca 50 s*

Třetí past: díváme se na jeden server, ale uživatel čeká na mnoho. Jeff Dean a Luiz Barroso z Googlu to popsali v článku The Tail at Scale. Představte si server, který obvykle odpoví za deset milisekund, ale jeho 99. percentil je jedna sekunda. Jeden požadavek ze sta tedy trvá sekundu nebo déle. Pro jednotlivé volání je to jedno procento, ocas, který v průměru zmizí. **[KLIK]** Jenže jeden dotaz uživatele se ve velkém systému často rozpadne na desítky až stovky paralelních volání a odpověď je hotová, až když dorazí ta nejpomalejší. Když dotaz čeká na sto takových serverů, pravděpodobnost, že aspoň jeden bude pomalý, je jedna minus 0,99 na stou, tedy 63 procent. **[KLIK]** Co je na jednom serveru vzácný ocas, je pro uživatele běžný zážitek. Proto u latence nestačí sledovat průměr ani medián. Rozhoduje ocas.

## 12 · Předěl: Jak měřit správně

*7:55–8:00 · cca 5 s*

Co s tím tedy dělat?

## 13 · Řešení: dvě opravy měření, dvě opravy shrnutí

*8:00–9:25 · cca 85 s*

Řešení má dvě části: opravit měření a opravit shrnutí. První oprava: zátěž se posílá podle plánu, ne podle odpovědí. Tomu se říká otevřený model. Požadavky přicházejí stálým tempem, stejně jako skuteční uživatelé, kterým je jedno, že server má zrovna problém. Rozdíl mezi otevřeným a uzavřeným modelem popsali už v roce 2006 Schroeder, Wierman a Harchol-Balter. V JMeteru k tomu slouží Open Model Thread Group, která je v něm od verze 5.5. Plánuje příchody požadavků místo počtu souběžných vláken. Podobně to umí k6 s executorem constant-arrival-rate nebo wrk2 s parametrem -R. **[KLIK]** Druhá oprava: čas se počítá od okamžiku, kdy požadavek MĚL odejít, ne kdy skutečně odešel. Knihovna HdrHistogram navíc umí chybějící vzorky dopočítat, když jí řeknete, jaký byl plánovaný interval mezi požadavky. **[KLIK]** Třetí: místo jednoho čísla hlásit rozdělení. Medián, devadesátý, devadesátý devátý percentil, tři devítky a maximum. Ideálně celý graf. **[KLIK]** A čtvrtá: když agregujete přes čas nebo přes servery, slučujte histogramy. Histogramy se dají sčítat, percentily ne.

## 14 · Závěr

*9:25–10:00 · cca 35 s*

Na závěr. Ve všech příkladech s měřením byl server pokaždé stejný. Rozdíl dělal jen způsob, jak jsme čísla získali a jak jsme je shrnuli. Číslo je jen tak dobré jako způsob, jakým vzniklo. Až příště uvidíte graf latence, položte si tři otázky. **[KLIK]** Odkud se počítá čas? Od plánovaného odeslání, nebo až od skutečného? **[KLIK]** Je to průměr? Pokud ano, chtějte percentily a maximum. **[KLIK]** A jak se data agregovala? Pokud se průměrovaly percentily, číslo neplatí.

## 15 · Zdroje a poděkování

*10:00–10:10 · cca 10 s*

Zdroje najdete tady, celá prezentace je online i s odkazy. Děkuji za pozornost a rád odpovím na otázky.

---

Tento soubor se generuje ze `src/slides.js` příkazem `npm run scenar`. Text upravuj tam.
