// The store's text: FALLBACK copy.
//
// The real text now lives in the CMS (cms/) and is edited in the admin app (Content page).
// This file is what the store shows when it has nothing better: on a visitor's very first visit
// before the CMS answers, or when the CMS is down or asleep. Components never import this
// directly: they call useSiteContent() (./use-site-content.js), which merges CMS text on top.
//
// Same shape and same defaults as cms/src/content/content-types.js. Keep the two in sync.
// The brand name is also written into index.html at build time (see vite.config.js).

export const siteDefaults = {
  brand: {
    name: 'ShopVerse',
    defaultTitle: 'ShopVerse: sneakers, electronics, books & home decor',
  },
  home: {
    heroEyebrow: 'New season',
    heroTitle: 'Everything you love, in one place.',
    heroText: 'Sneakers, gadgets, books and home decor. Smart search, verified reviews and secure checkout.',
    heroCtaLabel: 'Start shopping',
    categoriesHeading: 'Shop by category',
    featuredHeading: 'Featured products',
    viewAllLabel: 'View all',
    featuredCount: 8,
  },
  footer: {
    text: 'ShopVerse, a portfolio project. Payments run in Stripe test mode.',
  },
  notices: {
    slowServer:
      'Waking up the server. This demo runs on free hosting that sleeps when idle, so the first load can take up to a minute.',
  },
};
