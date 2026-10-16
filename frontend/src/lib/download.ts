import { api } from './api-client';

// Downloads a file from our API and saves it.
// A plain <a href="/api/..."> can't send our Authorization header, and putting the token in
// the URL would leak it into browser history and server logs. So: fetch it with the token,
// turn the response into a temporary local URL, "click" a hidden link to save it, clean up.
export async function downloadFile(url: string, fallbackName: string) {
  const res = await api.get<Blob>(url, { responseType: 'blob' }).catch(async (err) => {
    // With responseType 'blob' even an error body arrives as a Blob: read the backend's
    // { error: { message } } back out of it so the user sees the real reason.
    const body = err?.response?.data;
    if (body instanceof Blob) {
      const message = await body.text().then((t) => JSON.parse(t)?.error?.message).catch(() => null);
      if (message) throw new Error(message);
    }
    throw err;
  });
  // Use the server's file name ("INV-2026-00042.pdf") when it sends one.
  const match = /filename="([^"]+)"/.exec(String(res.headers['content-disposition'] ?? ''));
  const objectUrl = URL.createObjectURL(res.data);
  const link = Object.assign(document.createElement('a'), { href: objectUrl, download: match?.[1] ?? fallbackName });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl); // free the memory
}
