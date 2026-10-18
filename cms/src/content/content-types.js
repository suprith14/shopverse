import { z } from 'zod';

// ✏️ Every piece of content the CMS manages, described ONCE.
//
// From this one description the CMS builds:
//   - the validation for saving (Zod schemas, below)
//   - the defaults served before anyone has edited anything
//   - the form in the admin app (it asks GET /cms/admin/content and draws one input per field)
//
// To add a field: add it here with a default, then use it in the store. No database migration
// is needed: each type's fields are stored together as JSON.

const text = (label, { max = 80, default: value, help, multiline = false }) => ({
  kind: 'text',
  label,
  max,
  default: value,
  help,
  multiline,
});
const number = (label, { min, max, default: value, help }) => ({ kind: 'number', label, min, max, default: value, help });

export const contentTypes = {
  brand: {
    label: 'Brand',
    description: 'The store name and the browser tab title.',
    fields: {
      name: text('Store name', { max: 40, default: 'ShopVerse', help: 'Shown in the header and tab titles.' }),
      defaultTitle: text('Default tab title', {
        max: 70,
        default: 'ShopVerse: sneakers, electronics, books & home decor',
        help: 'Tab title on the home page. Google shows it in search results (keep it under 60 characters).',
      }),
    },
  },

  home: {
    label: 'Home page',
    description: 'The banner at the top of the home page and the section headings.',
    fields: {
      heroEyebrow: text('Banner: small text above the title', { max: 30, default: 'New season' }),
      heroTitle: text('Banner: title', { max: 60, default: 'Everything you love, in one place.' }),
      heroText: text('Banner: text', {
        max: 200,
        multiline: true,
        default: 'Sneakers, gadgets, books and home decor. Smart search, verified reviews and secure checkout.',
      }),
      heroCtaLabel: text('Banner: button text', { max: 30, default: 'Start shopping' }),
      categoriesHeading: text('Categories heading', { max: 40, default: 'Shop by category' }),
      featuredHeading: text('Featured products heading', { max: 40, default: 'Featured products' }),
      viewAllLabel: text('"View all" link text', { max: 20, default: 'View all' }),
      featuredCount: number('Featured products to show', { min: 4, max: 16, default: 8 }),
    },
  },

  footer: {
    label: 'Footer',
    description: 'The line at the bottom of every page.',
    fields: {
      text: text('Footer text', {
        max: 200,
        multiline: true,
        default: 'ShopVerse, a portfolio project. Payments run in Stripe test mode.',
      }),
    },
  },

  notices: {
    label: 'Notices',
    description: 'Messages the store shows in special situations.',
    fields: {
      slowServer: text('Slow server notice', {
        max: 300,
        multiline: true,
        default:
          'Waking up the server. This demo runs on free hosting that sleeps when idle, so the first load can take up to a minute.',
        help: 'Shown at the top of the page when a request has taken more than 4 seconds.',
      }),
    },
  },
};

export const typeNames = Object.keys(contentTypes);

// { name: 'ShopVerse', defaultTitle: '...' }
export const defaultsFor = (type) =>
  Object.fromEntries(Object.entries(contentTypes[type].fields).map(([key, field]) => [key, field.default]));

// Zod schema for saving a type: every field required, within its limits, and NOTHING else
// (.strict() rejects unknown keys, so a typo or an old form can't sneak junk into the database).
const fieldSchema = (field) =>
  field.kind === 'number'
    ? z.coerce.number().int().min(field.min).max(field.max)
    : z.string().trim().min(1, 'Required').max(field.max, `At most ${field.max} characters`);

export const schemaFor = (type) =>
  z.strictObject(
    Object.fromEntries(Object.entries(contentTypes[type].fields).map(([key, field]) => [key, fieldSchema(field)])),
  );
