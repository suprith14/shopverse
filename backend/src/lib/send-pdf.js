// Sends a PDF as a file download.
//  - Content-Disposition: attachment -> the browser saves it with this file name
//  - Cache-Control: private, no-store -> invoices contain personal data; no shared cache
//    (CDN, proxy) or browser cache should keep a copy
export function sendPdf(res, { filename, pdf }) {
  res
    .status(200)
    .set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdf.length),
      'Cache-Control': 'private, no-store',
    })
    .end(pdf);
}
