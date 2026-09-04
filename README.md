# Өөрөөр ажиллая — Rework

«Өөрөөр ажиллая» (Rework) номын нэг хуудаст танилцуулга, захиалгын сайт. Figma дизайныг цэвэр HTML + CSS-ээр угсарсан — build хийх шаардлагагүй, framework ашиглаагүй. Захиалгын товч нь [Byl](https://byl.mn) checkout руу холбогдсон.

**Дизайн:** [Figma — Tergun cashmere, `Home • Desktop` (19:199)](https://www.figma.com/design/MyKOqZNO8etQIevWSHyw08/Tergun-cashmere?node-id=19-199)

## Бүтэц

```
index.html          Бүх хуудас — navbar, hero, 3 алхам, footer
css/style.css       Figma-гийн design token-ууд CSS custom property болсон
js/checkout.js      Захиалгын товчийг /api/checkout руу холбоно
api/checkout.js     Serverless function — Byl дээр checkout үүсгэнэ (token энд байна)
assets/icons/       Figma-аас экспортлосон SVG: лого, алхмын icon, social icon
assets/img/         Hero зураг (WebP + JPEG fallback), OG зураг
```

## Төлбөрийн урсгал

```
Харилцагч «Ном захиалах» дарна
  │
  ▼
js/checkout.js  →  POST /api/checkout
  │
  ▼
api/checkout.js  →  POST https://byl.mn/api/v1/projects/787/checkouts
  │                  (Authorization: Bearer  ← орчны хувьсагчаас)
  ▼
Byl-ийн төлбөрийн хуудас руу шилжинэ
  │
  ▼
Төлөгдвөл  /?checkout=success  руу буцна
```

**API token хэзээ ч хөтөч рүү очихгүй.** Клиент тал зөвхөн `{ "item": "rework" }` гэж явуулна; ямар үнэ, ямар тоо хэмжээ болохыг `api/checkout.js` доторх `CATALOG` шийднэ. Тиймээс хөтчөөс дүн, `price_id` өөрчлөх боломжгүй.

### Бүтээгдэхүүн солих / нэмэх

`api/checkout.js` доторх `CATALOG`-д мөр нэмнэ:

```js
const CATALOG = {
  rework: { priceId: 1630, quantity: 1 },   // 30,000₮
};
```

Дараа нь HTML дээрх товчид `data-checkout="<түлхүүр>"` гэж заана. Byl дээрх үнэнд lookup key тохируулсан бол `price_id`-ийн оронд `price: "<lookup key>"` ашиглаж болно — одоогоор энэ төсөлд lookup key бүртгэгдээгүй тул ID-гаар заасан.

## Орчны хувьсагч

| Нэр | Тайлбар |
|---|---|
| `BYL_PROJECT_ID` | Byl төслийн дугаар (`787`). Нууц биш. |
| `BYL_TOKEN` | Byl API token. **Нууц** — git-д хэзээ ч оруулахгүй. |

Локал дээр: `.env.example`-г `.env.local` нэрээр хуулж утгыг нь бөглөнө (`.env.local` нь `.gitignore`-д орсон).
Production дээр: Vercel → Project → Settings → Environment Variables.

## Локал дээр ажиллуулах

Statik хэсгийг харах бол ямар ч сервер болно, гэхдээ **захиалгын товч ажиллахгүй** (`/api/checkout` байхгүй):

```bash
npx serve .
```

Захиалгын урсгалыг бүтнээр нь турших бол Vercel CLI хэрэгтэй:

```bash
npm i -g vercel
vercel dev            # .env.local-оос хувьсагчийг уншина
```

## Deploy (Vercel)

1. [vercel.com/new](https://vercel.com/new) → `terguncashmere-boop/rework.mn` repo-г import хийнэ.
2. Framework Preset → **Other**. Build command, output directory хоосон орхино (build хийх зүйлгүй).
3. **Environment Variables** дээр `BYL_PROJECT_ID` = `787`, `BYL_TOKEN` = өөрийн token-оо нэмнэ.
4. Deploy.

`api/` доторх файлыг Vercel автоматаар serverless function болгоно — нэмэлт тохиргоо шаардлагагүй.

Deploy хийсний дараа `index.html`-ийн `canonical`, `og:url`, `og:image` гурван хаягийг жинхэнэ домэйноороо солино (файл дотор `ЗАСВАРЛАХ` гэсэн тэмдэглэл бий). `success_url` / `cancel_url` нь хүсэлтийн домэйноос автоматаар тодорхойлогддог тул тэднийг хөндөх шаардлагагүй.

## Онцлогууд

- **Design token-ууд.** Figma variable бүр CSS custom property болсон (`--heading-1`, `--padding-global`, `--scheme-4-background` гэх мэт).
- **Responsive.** 1024px ба 640px дээр breakpoint-тэй. Footer-ийн том бичиг контейнерийн өргөнтэй хамт масштаблагдана (`cqw`).
- **Зураг.** Hero зураг `<picture>`-ээр WebP хоёр хэмжээтэй (1280w = 177 KB, 2560w = 398 KB). JPEG (3.1 MB) зөвхөн WebP дэмждэггүй хөтөчид очно.
- **Фонт.** Rubik (Google Fonts), 400/500/600/700 — кирилл бүрэн дэмжинэ.

## Хийгдээгүй үлдсэн зүйл

- Byl webhook (`checkout.completed`) хүлээн авах endpoint бичигдээгүй — захиалга баталгаажсаныг өөрийн системд бүртгэх бол хэрэгтэй.
- Social link болон Privacy / Terms / Cookie холбоосууд `href="#"` хэвээр (дизайн дээр ч placeholder байсан).
