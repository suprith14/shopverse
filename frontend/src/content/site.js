// ✏️ The store's text, in one place.
//
// Change the words here and every page that uses them updates. You don't need to touch any
// components. What's here: the brand name, the home page, the footer and site-wide notices.
// What's NOT here: small UI labels ("Add to cart", "Log out") and error messages. Those stay next
// to the code that uses them, so the code still reads clearly.
//
// The brand name is also used by index.html (tab title and start-up loader): vite.config.js
// fills in every %SITE_NAME% there from `site.name` below.

const name = 'ShopVerse';

export const site = {
  name,
  // Browser tab title on pages without their own title (the home page). Also used by Google.
  defaultTitle: `${name}: sneakers, electronics, books & home decor`,

  // Home page
  hero: {
    eyebrow: 'New season',
    title: 'Everything you love, in one place.',
    text: 'Sneakers, gadgets, books and home decor. Smart search, verified reviews and secure checkout.',
    cta: { label: 'Start shopping', to: '/shop' },
  },
  home: {
    categoriesHeading: 'Shop by category',
    featuredHeading: 'Featured products',
    viewAllLabel: 'View all',
    featuredCount: 8, // how many top-rated products to show
  },

  footer: `${name}, a portfolio project. Payments run in Stripe test mode.`,

  // Shown at the top of the page when a request has taken more than 4 seconds
  slowServerNotice:
    'Waking up the server. This demo runs on free hosting that sleeps when idle, so the first load can take up to a minute.',
};
