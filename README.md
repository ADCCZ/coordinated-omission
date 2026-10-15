# Coordinated Omission a pasti průměrných časů

Referát z předmětu **FJP** (ZČU FAV), cca 10 minut. Webová prezentace ve stylu „švýcarského plakátu“: 15 slidů, krokované odhalování, rolující čísla a režim řečníka s textem k přednesu.

Text k přednesu je v [`SCENAR.md`](SCENAR.md).

## Ovládání

| Klávesa | Akce |
| --- | --- |
| → / mezerník / Enter / PgDn | další krok |
| ← / PgUp / Backspace | předchozí krok |
| Home / End | první / poslední slide |
| F | celá obrazovka |
| N | poznámky přímo pod slidem |
| P | režim řečníka v novém okně (poznámky, časovač, náhled dalšího kroku; synchronizuje se s hlavním oknem) |

Klik do pravé části slidu = dál, do levé třetiny = zpět. Na mobilu funguje swipe. URL nese pozici (`#/6/1` = slide 6, krok 1).

## Vývoj

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # výstup do dist/
npm run scenar   # přegeneruje SCENAR.md z poznámek ve src/slides.js
```

Obsah slidů i poznámky jsou v `src/slides.js`, logika v `src/main.js`, vzhled v `src/style.css`.

## Nasazení na Vercel

1. Na [vercel.com/new](https://vercel.com/new) zvol **Import Git Repository** a vyber tenhle repozitář.
2. Framework se rozpozná sám (**Vite**): build `npm run build`, výstup `dist`. Nic dalšího není potřeba nastavovat.
3. **Deploy.** Každý další `git push` do `main` se nasadí automaticky.

## Zdroje

1. G. Tene: *How NOT to Measure Latency*, QCon San Francisco 2012 ([slidy](https://qconsf.com/sf2012/dl/qcon-sanfran-2012/slides/GilTene_HowNotToMeasureLatency.pdf), [přepis](https://amara.org/videos/0vqzbDPNIIbE/en/1317064/3393860/))
2. [wrk2](https://github.com/giltene/wrk2), G. Tene
3. [Coordinated Omission](https://groups.google.com/g/mechanical-sympathy/c/icNZJejUHfE/m/BfDekfBEs_sJ), diskuse v Mechanical Sympathy
4. J. Dean, L. A. Barroso: [The Tail at Scale](https://doi.org/10.1145/2408776.2408794), CACM 56(2), 2013
5. B. Schroeder, A. Wierman, M. Harchol-Balter: [Open Versus Closed: A Cautionary Tale](https://www.usenix.org/conference/nsdi-06/open-versus-closed-cautionary-tale), NSDI 2006
6. Grafana k6: [Open and closed models](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/)
7. [HdrHistogram](https://github.com/HdrHistogram/HdrHistogram)

Vizuální styl je inspirovaný prezentací [SWEBOK v4 a ASVS 5.0](https://swebok-asvs.vercel.app/).
