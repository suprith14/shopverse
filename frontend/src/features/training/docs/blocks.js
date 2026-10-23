// Small helpers so the two documents (spec.js, guide.js) read almost like the PDFs.
export const p = (text) => ({ type: 'p', text });
export const h = (text) => ({ type: 'h3', text });
export const li = (...items) => ({ type: 'list', items });
export const ol = (...items) => ({ type: 'olist', items });
export const table = (head, rows) => ({ type: 'table', head, rows });
export const code = (lang, source) => ({ type: 'code', lang, code: source });
// kind: why | mistake | interview | answer (from the PDF) | review (our correction)
export const note = (kind, text) => ({ type: 'callout', kind, text });
