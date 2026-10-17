import { baseQueryWithReauth } from '@/app/api';
import { store } from '@/app/store';

// Downloads a file from our API and saves it (e.g. an invoice PDF).
// It goes through the SAME base query as every RTK Query call, so the token is attached and an
// expired one is refreshed automatically. A plain <a href> couldn't send the Authorization header.
export async function downloadFile(url, filename) {
  const api = {
    dispatch: store.dispatch,
    getState: store.getState,
    signal: new AbortController().signal,
    abort: () => undefined,
    extra: undefined,
    endpoint: 'download',
    type: 'query',
  };
  // responseHandler: read the body as a file (Blob) instead of JSON.
  const result = await baseQueryWithReauth(
    { url, responseHandler: (res) => (res.ok ? res.blob() : res.json()) },
    api,
    {},
  );
  if (result.error) {
    const body = result.error.data;
    throw new Error(body?.error?.message ?? 'Download failed');
  }
  const objectUrl = URL.createObjectURL(result.data);
  const link = Object.assign(document.createElement('a'), { href: objectUrl, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
