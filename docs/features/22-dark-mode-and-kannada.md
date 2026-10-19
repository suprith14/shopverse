# Feature 22: Dark Mode + Kannada (store)

**Status:** 🚧 Step 1 (dark mode) done. Step 2 (Kannada UI text) and step 3 (Kannada CMS text) next.

| Step | What | Status |
|---|---|---|
| 1 | Dark mode: System / Light / Dark switch in the header | ✅ |
| 2 | Kannada for the store's own text (buttons, menus, messages) | ⏳ |
| 3 | Kannada for CMS text (home page, banner, footer): English + Kannada per field, edited in admin | ⏳ |

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

## Why these choices

| Choice | Alternatives | Why |
|---|---|---|
| Theme tokens (redefine colours in `.dark`) | `dark:` classes on every element | One place defines the dark palette; 38 files of `dark:bg-... dark:text-... dark:border-...` would be hard to keep consistent |
| `class` on `<html>` + saved choice | Only `prefers-color-scheme` | Visitors can override their device; "System" stays the default |
| Inline script before paint | Set the class from React | React runs after the first paint: dark-mode users would see a white flash |
| System → Light → Dark cycle | A dropdown | One small icon in a crowded header; the tooltip says what the next click does |

## Concepts to be able to explain

1. What is a design token, and why does redefining CSS variables beat adding `dark:` everywhere?
2. Why must the theme be set by an inline script in `index.html`, not by React?
3. Why does `night` exist, and why can't `bg-white` simply flip in dark mode?
