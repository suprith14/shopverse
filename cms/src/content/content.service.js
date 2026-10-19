import { prisma } from '../lib/prisma.js';
import { badRequest, notFound } from '../lib/http-error.js';
import { contentTypes, defaultsFor, describeFields, normalizeValues, schemaFor, typeNames } from './content-types.js';
import { bannerPublicId, deleteImage } from '../lib/cloudinary.js';

function assertType(type) {
  if (!typeNames.includes(type)) throw notFound(`Unknown content type "${type}"`);
}

// Saved values on top of the defaults. A field added to content-types.js later simply shows
// its default until someone saves the type again; a field removed there is dropped here.
function merge(type, data) {
  const defaults = defaultsFor(type);
  const saved = Object.fromEntries(Object.entries(data ?? {}).filter(([key]) => key in defaults));
  // Older saved text was a plain string: read it as English (see normalizeValues).
  const values = { ...defaults, ...normalizeValues(contentTypes[type].fields, saved) };
  // Saved before Kannada existed but never changed from the default English? Then the default
  // Kannada still fits: use it, so an untouched field isn't left untranslated.
  for (const [key, field] of Object.entries(contentTypes[type].fields)) {
    const value = values[key];
    if (field.localized && !value.kn && value.en === field.default.en) values[key] = { ...value, kn: field.default.kn };
  }
  return values;
}

// PUBLIC: all content, ready for the store: { brand: {...}, home: {...}, footer: {...}, notices: {...} }
export async function getAllContent() {
  const rows = await prisma.contentEntry.findMany();
  const byType = Object.fromEntries(rows.map((row) => [row.type, row.data]));
  return Object.fromEntries(typeNames.map((type) => [type, merge(type, byType[type])]));
}

export async function getContent(type) {
  assertType(type);
  const row = await prisma.contentEntry.findUnique({ where: { type } });
  return merge(type, row?.data);
}

// ADMIN: everything the editor needs to draw its forms: each type's fields (labels, limits,
// help text) plus the current values and who saved them last.
export async function getEditorContent() {
  const rows = await prisma.contentEntry.findMany();
  const byType = Object.fromEntries(rows.map((row) => [row.type, row]));

  return typeNames.map((type) => {
    const { label, description, fields } = contentTypes[type];
    const row = byType[type];
    return {
      type,
      label,
      description,
      fields: describeFields(fields),
      values: merge(type, row?.data),
      updatedAt: row?.updatedAt ?? null,
      updatedBy: row?.updatedBy ?? null,
    };
  });
}

export async function saveContent(type, input, userId) {
  assertType(type);
  const result = schemaFor(type).safeParse(input);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    throw badRequest('Validation failed', details);
  }

  const previous = await prisma.contentEntry.findUnique({ where: { type } });
  await prisma.contentEntry.upsert({
    where: { type },
    create: { type, data: result.data, updatedBy: userId },
    update: { data: result.data, updatedBy: userId },
  });
  deleteRemovedImages(previous?.data, result.data);
  return getContent(type);
}

// A slide was removed or its image replaced: delete the old file from Cloudinary, so unused
// images don't pile up. In the background, after saving: a Cloudinary hiccup must never
// block or undo a save (worst case, one unused file stays behind).
function deleteRemovedImages(before, after) {
  const urls = (data) => (data?.slides ?? []).map((slide) => slide.imageUrl);
  const kept = new Set(urls(after));
  for (const url of urls(before)) {
    if (kept.has(url)) continue;
    let publicId = null;
    try {
      publicId = bannerPublicId(url);
    } catch {
      return; // uploads not configured: nothing to clean up
    }
    if (publicId) deleteImage(publicId).catch((err) => console.error('[banner] could not delete old image', err));
  }
}
