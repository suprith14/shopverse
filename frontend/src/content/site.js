// The store's text: FALLBACK copy.
//
// The real text lives in the CMS (cms/) and is edited in the admin app (Content page).
// This file is what the store shows when it has nothing better: on a visitor's very first visit
// before the CMS answers, or when the CMS is down or asleep. Components never import this
// directly: they call useSiteContent() (./use-site-content.js), which merges CMS text on top and
// picks the reader's language.
//
// Same shape and same defaults as cms/src/content/content-types.js. Keep the two in sync.
// Translated text is { en, kn }; an empty kn shows the English. The brand name isn't translated.
// The brand name is also written into index.html at build time (see vite.config.js).

export const siteDefaults = {
  brand: {
    name: 'ShopVerse',
    defaultTitle: {
      en: 'ShopVerse: sneakers, electronics, books & home decor',
      kn: 'ShopVerse: ಸ್ನೀಕರ್ಸ್, ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್, ಪುಸ್ತಕಗಳು ಮತ್ತು ಮನೆ ಅಲಂಕಾರ',
    },
  },
  home: {
    heroEyebrow: { en: 'New season', kn: 'ಹೊಸ ಸೀಸನ್' },
    heroTitle: { en: 'Everything you love, in one place.', kn: 'ನಿಮಗೆ ಇಷ್ಟವಾದ ಎಲ್ಲವೂ, ಒಂದೇ ಕಡೆ.' },
    heroText: {
      en: 'Sneakers, gadgets, books and home decor. Smart search, verified reviews and secure checkout.',
      kn: 'ಸ್ನೀಕರ್ಸ್, ಗ್ಯಾಜೆಟ್‌ಗಳು, ಪುಸ್ತಕಗಳು ಮತ್ತು ಮನೆ ಅಲಂಕಾರ. ಸ್ಮಾರ್ಟ್ ಹುಡುಕಾಟ, ದೃಢೀಕೃತ ವಿಮರ್ಶೆಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ಚೆಕ್‌ಔಟ್.',
    },
    heroCtaLabel: { en: 'Start shopping', kn: 'ಶಾಪಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ' },
    categoriesHeading: { en: 'Shop by category', kn: 'ವರ್ಗಗಳ ಪ್ರಕಾರ ಖರೀದಿಸಿ' },
    featuredHeading: { en: 'Featured products', kn: 'ವಿಶೇಷ ಉತ್ಪನ್ನಗಳು' },
    viewAllLabel: { en: 'View all', kn: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ' },
    featuredCount: 8,
  },
  // Image slides (uploaded in the admin app). None by default: the home page then shows the
  // purple banner made from `home` above.
  banner: {
    slides: [],
    intervalSeconds: 6,
  },
  footer: {
    tagline: {
      en: 'Books, gadgets, sneakers, home and more, all in one store.',
      kn: 'ಪುಸ್ತಕಗಳು, ಗ್ಯಾಜೆಟ್‌ಗಳು, ಸ್ನೀಕರ್‌ಗಳು, ಮನೆ ಮತ್ತು ಇನ್ನಷ್ಟು, ಎಲ್ಲವೂ ಒಂದೇ ಅಂಗಡಿಯಲ್ಲಿ.',
    },
    paymentNote: {
      en: 'Payments are handled by Stripe. Your card details go straight to Stripe and never reach our servers.',
      kn: 'ಪಾವತಿಗಳನ್ನು Stripe ನಿರ್ವಹಿಸುತ್ತದೆ. ನಿಮ್ಮ ಕಾರ್ಡ್ ವಿವರಗಳು ನೇರವಾಗಿ Stripe ಗೆ ಹೋಗುತ್ತವೆ, ನಮ್ಮ ಸರ್ವರ್‌ಗಳನ್ನು ಎಂದಿಗೂ ತಲುಪುವುದಿಲ್ಲ.',
    },
    testCardNote: {
      en: 'Demo mode: pay with card 4242 4242 4242 4242, any future date and any CVC. No real money is charged.',
      kn: 'ಡೆಮೊ ಮೋಡ್: 4242 4242 4242 4242 ಕಾರ್ಡ್, ಯಾವುದೇ ಭವಿಷ್ಯದ ದಿನಾಂಕ ಮತ್ತು ಯಾವುದೇ CVC ಬಳಸಿ ಪಾವತಿಸಿ. ನಿಜವಾದ ಹಣ ಕಡಿತವಾಗುವುದಿಲ್ಲ.',
    },
    text: {
      en: 'A portfolio project. Payments run in Stripe test mode.',
      kn: 'ಒಂದು ಪೋರ್ಟ್‌ಫೋಲಿಯೋ ಪ್ರಾಜೆಕ್ಟ್. ಪಾವತಿಗಳು Stripe ಟೆಸ್ಟ್ ಮೋಡ್‌ನಲ್ಲಿ ನಡೆಯುತ್ತವೆ.',
    },
  },
  notices: {
    slowServer: {
      en: 'Waking up the server. This demo runs on free hosting that sleeps when idle, so the first load can take up to a minute.',
      kn: 'ಸರ್ವರ್ ಎಚ್ಚರಗೊಳ್ಳುತ್ತಿದೆ. ಈ ಡೆಮೊ ಬಳಕೆಯಿಲ್ಲದಾಗ ನಿದ್ರಿಸುವ ಉಚಿತ ಹೋಸ್ಟಿಂಗ್‌ನಲ್ಲಿ ನಡೆಯುತ್ತದೆ, ಹಾಗಾಗಿ ಮೊದಲ ಲೋಡ್‌ಗೆ ಒಂದು ನಿಮಿಷದವರೆಗೆ ಬೇಕಾಗಬಹುದು.',
    },
  },
};
