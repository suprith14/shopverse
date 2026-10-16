/// <reference types="vite/client" />

// The VITE_ environment variables this app reads (see lib/config.ts).
interface ImportMetaEnv {
  readonly VITE_STORE_URL?: string;
}
