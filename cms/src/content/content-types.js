import { z } from 'zod';
import { bannerPublicId } from '../lib/cloudinary.js';

// ✏️ Every piece of content the CMS manages, described ONCE.
//
// From this one description the CMS builds:
//   - the validation for saving (Zod schemas, below)
//   - the defaults served before anyone has edited anything
//   - the form in the admin app (it asks GET /cms/admin/content and draws one input per field)
//
// To add a field: add it here with a default, then use it in the store. No database migration
// is needed: each type's fields are stored together as JSON.

// Field kinds. The admin form draws a matching input for each one.
//   text    a line or a paragraph (multiline); optional: true allows it to be empty
//   number  a whole number between min and max
//   image   an uploaded banner image (a URL in OUR Cloudinary banners folder)
//   link    a page of the store, e.g. /shop?category=sneakers
//   list    up to `maxItems` items, each with its own fields (e.g. carousel slides)
const text = (label, { max = 80, default: value = '', help, multiline = false, optional = false }) => ({
  kind: 'text',
  label,
  max,
  default: value,
  help,
  multiline,
  optional,
});
const number = (label, { min, max, default: value, help }) => ({ kind: 'number', label, min, max, default: value, help });
const image = (label, { help } = {}) => ({ kind: 'image', label, default: '', help });
const link = (label, { help, optional = false } = {}) => ({ kind: 'link', label, default: '', help, optional, max: 200 });
const list = (label, { itemLabel, maxItems, fields, help }) => ({
  kind: 'list',
  label,
  itemLabel,
  maxItems,
  fields,
  default: [],
  help,
});

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

  banner: {
    label: 'Home page banner',
    description:
      'Image slides at the top of the home page, changing automatically. With no slides, the purple banner from "Home page" shows instead.',
    fields: {
      slides: list('Slides', {
        itemLabel: 'Slide',
        maxItems: 5,
        help: 'Up to 5. Wide photos work best (about 2400 x 1000). The text sits on the left, so keep that side calm.',
        fields: {
          imageUrl: image('Image'),
          imageAlt: text('Image description', {
            max: 120,
            help: 'What the picture shows, for people using screen readers. e.g. "Runner tying a white sneaker"',
          }),
          eyebrow: text('Small text above the title', { max: 30, optional: true }),
          title: text('Title', { max: 60 }),
          text: text('Text', { max: 160, multiline: true, optional: true }),
          buttonLabel: text('Button text', { max: 30, optional: true, help: 'Leave empty for no button.' }),
          buttonLink: link('Button link', {
            optional: true,
            help: 'A store page, e.g. /shop?category=sneakers or /shop?sort=newest',
          }),
        },
      }),
      intervalSeconds: number('Seconds per slide', { min: 3, max: 15, default: 6 }),
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

// Zod schema for saving a type: every field present, within its limits, and NOTHING else
// (strictObject rejects unknown keys, so a typo or an old form can't sneak junk into the database).
function fieldSchema(field) {
  switch (field.kind) {
    case 'number':
      return z.coerce.number().int().min(field.min).max(field.max);
    case 'image':
      // Only images uploaded through the CMS: never someone else's site (tracking pixels, hotlinking)
      return z.string().refine((url) => bannerPublicId(url) !== null, 'Upload an image');
    case 'link': {
      // Store pages only ("/..."), never "https://evil.example", "//evil.example" or "javascript:...":
      // a banner button must not become a way to send customers to another site.
      const path = z
        .string()
        .trim()
        .max(field.max)
        .regex(/^\/(?!\/)\S*$/, 'Must be a store page starting with /, e.g. /shop');
      return field.optional ? z.union([z.literal(''), path]) : path;
    }
    case 'list': {
      const item = z
        .strictObject(Object.fromEntries(Object.entries(field.fields).map(([key, f]) => [key, fieldSchema(f)])))
        // A button needs both its text and where it goes
        .superRefine((value, ctx) => {
          if ('buttonLabel' in value && Boolean(value.buttonLabel) !== Boolean(value.buttonLink)) {
            ctx.addIssue({
              code: 'custom',
              path: [value.buttonLabel ? 'buttonLink' : 'buttonLabel'],
              message: 'Fill in both the button text and its link, or neither',
            });
          }
        });
      return z.array(item).max(field.maxItems, `At most ${field.maxItems}`);
    }
    default: {
      const textSchema = z.string().trim().max(field.max, `At most ${field.max} characters`);
      return field.optional ? textSchema : textSchema.min(1, 'Required');
    }
  }
}

export const schemaFor = (type) =>
  z.strictObject(
    Object.fromEntries(Object.entries(contentTypes[type].fields).map(([key, field]) => [key, fieldSchema(field)])),
  );

// For the admin form: fields as a list (list fields carry their own item fields), in order.
export const describeFields = (fields) =>
  Object.entries(fields).map(([name, field]) =>
    field.kind === 'list' ? { name, ...field, fields: describeFields(field.fields) } : { name, ...field },
  );
