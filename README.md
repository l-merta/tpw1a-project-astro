# Kurzovna – katalog kurzů

Semestrální projekt do předmětu **KIT/TPW1A** (Komponentový SSG Web, varianta A).
Statický web postavený v [Astru](https://astro.build), který z JSON dat generuje katalog kurzů.

## Spuštění

Potřebujete Node.js 22.23.4 nebo novější (`node -v`).

```sh
npm ci            # nainstaluje závislosti
npm run dev       # vývojový server na http://localhost:4321
npm run build     # vygeneruje hotový statický web do složky dist/
npm run preview   # spustí server nad složkou dist/
```

## Stránky

| Adresa | Soubor | Co obsahuje |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | hero banner, doporučené kurzy, kategorie |
| `/kurzy/` | `src/pages/kurzy/index.astro` | všechny kurzy + filtr podle kategorie |
| `/kurzy/<slug>/` | `src/pages/kurzy/[slug].astro` | detail kurzu (jedna stránka pro každý kurz z JSON) |
| `/faq/` | `src/pages/faq.astro` | časté dotazy v akordeonu |
| `/kontakt/` | `src/pages/kontakt.astro` | kontaktní formulář s HTML5 validací |

Astro používá **file-based routing**: každý soubor ve složce `src/pages/` je jedna stránka.
Soubor `[slug].astro` je dynamická stránka. Funkce `getStaticPaths()` při buildu projde
všechny kurzy v JSON a pro každý vytvoří samostatné HTML. Výsledek je tedy čistě statický web
(žádné SPA ani SSR).

## Struktura projektu

```
src/
├── assets/          obrázky kurzů (optimalizuje je komponenta <Image />)
├── components/      znovupoužitelné komponenty
├── data/            JSON data (kurzy, FAQ, nastavení webu)
├── layouts/         BaseLayout.astro – společná kostra stránek a SEO meta tagy
├── pages/           stránky webu
├── styles/          CSS rozdělené podle vrstev
└── utils/           pomocné funkce (formátování ceny)
```

## Komponenty

Každá komponenta dostává data přes `Astro.props` a vzhled mění pomocí BEM modifikátorů.

| Komponenta | Props / sloty | Modifikátory |
| --- | --- | --- |
| `CourseCard` | `course`, `categoryName`, `featured`, `headingLevel`, slot `footer` | `course-card--featured` |
| `Button` | `href`, `variant`, `size`, `block`, `disabled` | `btn--primary`, `--secondary`, `--ghost`, `--small`, `--block`, `--disabled` |
| `Hero` | `title`, `text`, `eyebrow`, `variant`, sloty `actions` a `aside` | `hero--large`, `hero--compact` |
| `Badge` | `variant` | `badge--beginner`, `--intermediate`, `--advanced`, `--accent`, `--outline` |
| `Accordion` | `title`, `variant`, `open`, výchozí slot | `accordion--plain` |
| `Modal` | `id`, `title`, výchozí slot | – |
| `Header`, `Nav`, `Footer` | navigace se generuje ze `site.json` | `nav__link--active` |
| `CourseFilter` | `categories`, `total` | stav přes `aria-pressed` |
| `EnrollForm` | `courseTitle`, `idPrefix` | stavy `:focus-visible`, `:user-invalid`, `:disabled` |
| `ThemeToggle` | – | světlý / tmavý režim |

## Data (JSON)

- `src/data/courses.json` – kategorie a kurzy (název, úroveň, cena, lektor, témata…)
- `src/data/faq.json` – otázky a odpovědi
- `src/data/site.json` – název webu, položky menu, názvy úrovní

Stránka JSON naimportuje a pomocí `.map()` z každé položky vykreslí komponentu:

```astro
---
import courseData from '../data/courses.json';
---
{courseData.courses.map((course) => <CourseCard course={course} ... />)}
```

## CSS architektura

Vlastní CSS bez frameworků a preprocesorů. Hlavní soubor `src/styles/main.css`:

1. **Pořadí vrstev** `@layer reset, tokens, base, components, utilities;`
   Později uvedená vrstva vyhrává, takže utility (`.hidden`, `.text-center`…) vždy přebijí komponenty.
2. **Soubory podle vrstev** se připojují přes `@import`:
   - `reset.css` – `box-sizing: border-box`, vynulování okrajů
   - `tokens.css` – design tokeny v `:root` (barvy, písmo, mezery, zaoblení, stíny) a tmavý režim
   - `base.css` – vzhled HTML prvků, globální `:focus-visible`
   - `components/*.css` – jeden soubor na komponentu, pojmenování podle **BEM** (`blok__prvek--modifikátor`)
   - `utilities.css` – pomocné třídy

### Layout a responzivita

- **Mobile-First**: základní styly jsou pro mobil, větší displeje přidávají `@media (min-width: …)`.
- **Flexbox**: hlavička, navigace, tlačítka, patička karty.
- **Grid**: mřížka karet `repeat(auto-fill, minmax(…))` bez media queries, detail kurzu přes `grid-template-areas`, sticky footer (`.page`).
- **Container Query**: karta kurzu (`.course-card-wrapper` má `container-type: inline-size`). Když je karta široká aspoň 36rem, obrázek se přesune vedle textu. Je to vidět na úvodní stránce, kde je první doporučený kurz přes celou šířku.
- **Hamburger menu bez JavaScriptu**: skrytý checkbox `#menu-toggle` a selektor `:checked ~ .site-header__nav`.

## Přístupnost

- sémantické značky `header`, `nav`, `main`, `article`, `section`, `aside`, `footer`, `details/summary`, `dialog`, `dl`
- odkaz „Přeskočit na obsah“, viditelný `:focus-visible`, ovládání klávesnicí
- `aria-label`, `aria-current="page"`, `aria-pressed`, `aria-live`, `aria-describedby` u formulářových nápověd
- kontrast barev v obou režimech, `alt` u obrázků (dekorativní obrázky mají prázdný `alt=""`)
- `prefers-reduced-motion` vypne animace

## JavaScript (vanilla, jen vylepšení)

Web funguje i bez JavaScriptu. Skripty v komponentách jen přidávají pohodlí:

- `ThemeToggle` – přepínání režimu a uložení volby do `localStorage`
- `CourseFilter` – filtrování karet podle kategorie (bez JS se zobrazí všechny kurzy)
- `Modal` – otevření a zavření přihlášky (`<dialog>`)
- `EnrollForm` – po úspěšné HTML5 validaci zobrazí poděkování (web nemá server)

## SEO

`BaseLayout.astro` přebírá `title`, `description` a `image` a vypíše `<title>`, meta description,
canonical URL, Open Graph a Twitter Cards. Integrace `@astrojs/sitemap` při buildu vytvoří `sitemap-index.xml`.
