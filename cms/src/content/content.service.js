import { prisma } from '../lib/prisma.js';
import { badRequest, notFound } from '../lib/http-error.js';
import { contentTypes, defaultsFor, schemaFor, typeNames } from './content-types.js';

function assertType(type) {
  if (!typeNames.includes(type)) throw notFound(`Unknown content type "${type}"`);
}

// Saved values on top of the defaults. A field added to content-types.js later simply shows
// its default until someone saves the type again; a field removed there is dropped here.
function merge(type, data) {
  const defaults = defaultsFor(type);
  const saved = Object.fromEntries(Object.entries(data ?? {}).filter(([key]) => key in defaults));
  return { ...defaults, ...saved };
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
      fields: Object.entries(fields).map(([name, field]) => ({ name, ...field })),
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

  await prisma.contentEntry.upsert({
    where: { type },
    create: { type, data: result.data, updatedBy: userId },
    update: { data: result.data, updatedBy: userId },
  });
  return getContent(type);
}
