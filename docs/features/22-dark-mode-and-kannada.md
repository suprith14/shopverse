# Feature 22: Dark Mode + Kannada (store)

**Status:** ✅ Done: dark mode, Kannada store text, Kannada CMS text.

| Step | What | Status |
|---|---|---|
| 1 | Dark mode: System / Light / Dark switch in the header | ✅ |
| 2 | Kannada for the store's own text: header, home, shop, product, reviews, cart, checkout, orders, wishlist, login/register/reset, account, onboarding, invoice check, 404 (323 keys) | ✅ |
| 3 | Kannada for CMS text (home page, banner slides, footer, notices): English + Kannada per field, edited in admin | ✅ |

## Dark mode

**The switch:** the header button cycles **System** (follows the device, the default) → **Light** → **Dark**. The
choice is saved in `localStorage` (`shopverse:theme`); "System" follows the device live (e.g. a phone switching at sunset).

**How it works: design tokens, not per-component classes.** Tailwind 4 utilities read CSS variables
(`bg-slate-100` = `var(--color-slate-100)`), so `src/index.css` redefines the colours themselves inside `.dark`:

| Token | Light | Dark | Used for |
|---|---|---|---|
| `slate-50` … `slate-950` | light → dark greys | **flipped**: dark → light | page background, text, borders, chips |
| `surface` (new) | white | `#0f172a` | cards, panels, header, dialogs (instead of `bg-white`) |
| `night` (new) | `#0f172a` | `#0f172a` (**never changes**) | things on photos: carousel fade, image badges, dialog backdrops |
| `brand-50/100` | light indigo tints | deep indigo | selected states, focus rings |
| red/green/amber/blue 50-200, 600-900 | light tints, dark text | dark tints, light text | alerts, badges, errors |

So most components needed **no change**: "`bg-slate-50 text-slate-900`" means "page background, main text" in both
themes. The few exceptions were changed on purpose:
- `bg-white` → `bg-surface` (white must stay white for text on buttons)
- brand-coloured text gets `dark:text-brand-300` (indigo-600 is too dim on a dark card)
- dark "selected" chips use `text-slate-50` so they invert together with their background
- on photos (carousel, hero, image badges): `night`, `white`, `white/80`, which stay the same in both themes

**No white flash:** an inline script in `index.html` sets the `dark` class before anything is painted (the app's
JavaScript loads later). The start-up loader has dark colours too (`src/splash.css`), and toasts follow the theme.
`color-scheme: dark` makes native controls (selects, scrollbars, date pickers) dark as well.

**Files:** `src/index.css`, `src/lib/theme.js`, `src/components/layout/ThemeToggle.jsx`, `index.html`,
`src/splash.css`, plus class changes in 32 components.

## Kannada (step 2)

**The switch:** the header shows the *other* language in its own script ("ಕನ್ನಡ" while reading English, "English" while
reading Kannada), so someone who can't read the current language still recognises theirs. The choice is saved
(`shopverse:lang`); on a first visit a browser that prefers Kannada gets Kannada. `<html lang>` follows the choice.

**How it works:** `react-i18next`. Every piece of store text lives in `src/i18n/en.js` and `src/i18n/kn.js` under the
same key; components call `t('product.addToCart')`. Missing Kannada keys fall back to English.
- Values: `t('catalog.resultsFor', { query })` fills `{{query}}`.
- Plurals: `t('reviews.count', { count })` picks `count_one` / `count_other` using each language's plural rules.
- A link inside a sentence: `<Trans>` with `<0>…</0>` in the text, so each language puts the link where its grammar needs it.
- Category names come from the database, so they're translated by slug (`category.home-decor`), with the database name as fallback.
- Dates follow the language (`formatDate`, `formatDateTime` in `lib/format.js`); prices stay `$` in every language.
- Country names come from the browser (`Intl.DisplayNames`), which already knows them in Kannada (ಭಾರತ, ಜರ್ಮನಿ).
- Font: **Noto Sans Kannada** from Google Fonts. Its stylesheet is split by character range, so the font only downloads when Kannada text is on the page.

**Not translated (by design):** product names and descriptions, product details, and messages written by the API
(e.g. "Only 2 left in stock"). CMS text gets its Kannada version in step 3.

**Checks:** `en.js` and `kn.js` must have the same keys (a missing Kannada key silently shows English); a sweep of the components found no hard-coded English left.

**Terms:** shopping words use the loanwords Kannada shoppers see on Indian stores (ಕಾರ್ಟ್, ಆರ್ಡರ್, ವಿಶ್‌ಲಿಸ್ಟ್).

## Kannada CMS text (step 3)

**Localized fields** (the approach Contentful and Sanity use): each CMS text field is stored as `{ en, kn }`.
Images, links and numbers are shared, so a banner image is uploaded once, not per language. The brand name is
`localized: false` (one value).

- **Admin:** each text field shows two boxes, *English* and *ಕನ್ನಡ · Kannada (optional)*, each with its own counter,
  "Use default" and errors (`slides.0.title.kn`).
- **Validation:** English is required where the field is; Kannada is always optional; both have the length limit.
- **Store:** `/cms/content` sends both languages. `useSiteContent()` picks the reader's language and falls back to
  English when the Kannada box is empty, so switching language is instant (no new request).
- **Older data:** text saved before this as a plain string is read as English (`normalizeValues`). If it was never
  changed from the default English, the default Kannada is used too, so untouched fields aren't left untranslated.
- **Defaults** (CMS and `site.js`) include Kannada for every text.

## Why these choices

| Choice | Alternatives | Why |
|---|---|---|
| Theme tokens (redefine colours in `.dark`) | `dark:` classes on every element | One place defines the dark palette; 38 files of `dark:bg-... dark:text-... dark:border-...` would be hard to keep consistent |
| `class` on `<html>` + saved choice | Only `prefers-color-scheme` | Visitors can override their device; "System" stays the default |
| Inline script before paint | Set the class from React | React runs after the first paint: dark-mode users would see a white flash |
| `react-i18next` | A hand-written dictionary + hook; FormatJS (react-intl) | The most used React i18n library: plurals, values, `<Trans>` for links inside sentences, fallbacks. react-intl is equally good; i18next is simpler to start with |
| Text in JS files (`en.js`, `kn.js`) | JSON files; a translation service (Crowdin, Lokalise) | Comments for translators, and no extra service. A service is worth it with many languages and professional translators |
| Localized fields `{ en, kn }` | A whole copy of each content type per language | Images, links and numbers stay shared; only text differs. A copy per language would mean uploading every banner twice |
| English fallback for empty Kannada | Required Kannada | Content can go live in English first and be translated later, without ever showing an empty box |
| Both languages in one response | `?lang=kn` per request | Switching language needs no new request, and the CDN caches one response instead of one per language |
| Show the other language in its own script | A flag, or "Language" | Flags are countries, not languages; a reader of only Kannada recognises "ಕನ್ನಡ" |
| System → Light → Dark cycle | A dropdown | One small icon in a crowded header; the tooltip says what the next click does |

## Concepts to be able to explain

1. What is a design token, and why does redefining CSS variables beat adding `dark:` everywhere?
2. Why must the theme be set by an inline script in `index.html`, not by React?
3. Why does `night` exist, and why can't `bg-white` simply flip in dark mode?
