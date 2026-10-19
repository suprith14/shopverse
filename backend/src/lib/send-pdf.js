// Sends a PDF as a file download.
//  - Content-Disposition: attachment -> the browser saves it with this file name
//  - Cache-Control: private, no-store -> invoices contain personal data; no shared cache
//    (CDN, proxy) or browser cache should keep a copy
// export = other files can import this
// function = a named, reusable block of code
// { a, b } = destructuring: take properties a and b out of an object
export function sendPdf(res, { filename, pdf }) {
  res
    // res.status(code) = set the HTTP status code (201 created, 404...)
    .status(200)
    .set({
      'Content-Type': 'application/pdf',
      // `text ${x}` = a template string: text with values inserted
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdf.length),
      'Cache-Control': 'private, no-store',
    })
    .end(pdf);
}
