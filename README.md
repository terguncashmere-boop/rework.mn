# Өөрөөр ажиллая — Rework

«Өөрөөр ажиллая» (Rework) номын нэг хуудаст танилцуулга сайт. Figma дизайныг цэвэр HTML + CSS-ээр угсарсан — build хийх шаардлагагүй, framework, dependency ашиглаагүй.

**Дизайн:** [Figma — Tergun cashmere, `Home • Desktop` (19:199)](https://www.figma.com/design/MyKOqZNO8etQIevWSHyw08/Tergun-cashmere?node-id=19-199)

## Бүтэц

```
index.html          Бүх хуудас — navbar, hero, 3 алхам, footer
css/style.css       Figma-гийн design token-ууд CSS custom property болсон
assets/icons/       Figma-аас экспортлосон SVG: лого, алхмын icon, social icon
assets/img/         Hero зураг (WebP + JPEG fallback), OG зураг
```

## Локал дээр ажиллуулах

Build step байхгүй — `index.html`-г хөтөч дээр нээхэд болно:

```bash
start index.html          # Windows
```

Эсвэл жижиг сервер асаах:

```bash
npx serve .               # эсвэл  python -m http.server
```

## Онцлогууд

- **Design token-ууд.** Figma variable бүр CSS custom property болсон (`--heading-1`, `--padding-global`, `--scheme-4-background` гэх мэт), тул өнгө/хэмжээ солиход нэг газраас өөрчилнө.
- **Responsive.** 1024px ба 640px дээр breakpoint-тэй. Footer-ийн том бичиг контейнерийн өргөнтэй хамт масштаблагдана (`cqw`).
- **Зураг.** Hero зураг `<picture>`-ээр WebP хоёр хэмжээтэй (1280w = 177 KB, 2560w = 398 KB), `sizes` нь CSS-ийн padding breakpoint-уудтай таарсан. JPEG (3.1 MB) зөвхөн WebP дэмждэггүй хөтөчид очно.
- **Фонт.** Rubik (Google Fonts), 400/500/600/700 — кирилл бүрэн дэмжинэ.

## Хийгдээгүй үлдсэн зүйл

- Social link болон Privacy / Terms / Cookie холбоосууд `href="#"` хэвээр (дизайн дээр ч placeholder байсан).
- «Ном захиалах» товч одоогоор hero хэсэг рүү үсэрнэ — жинхэнэ захиалгын урсгал холбогдоогүй.
- Custom domain (`rework.mn`) холбовол `index.html`-ийн `og:url`, `og:image`, `canonical` дахь хаягийг шинэчлэх хэрэгтэй.
