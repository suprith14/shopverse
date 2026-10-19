import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { siteDefaults } from './site';

// The store's text, from the CMS, without ever making the page wait for it.
//
//   1. Instantly: the copy this browser saved last time (localStorage), or site.js on a first visit.
//   2. In the background: fetch fresh text from the CMS and swap it in when it arrives.
//   3. CMS down or asleep: keep showing (1). Nothing breaks, nothing waits.
//
// So the CMS being a separate (sleeping) server costs visitors nothing.
// This is "stale-while-revalidate" again, this time inside the browser.

const CMS_URL = import.meta.env.VITE_CMS_URL ?? '/cms'; // forwarded to cms/ by Vite (laptop) / Vercel (live)
const CACHE_KEY = 'shopverse:site-content';

// CMS text on top of the defaults, per type: a field the CMS doesn't send keeps its default.
const withDefaults = (content) =>
  Object.fromEntries(Object.entries(siteDefaults).map(([type, defaults]) => [type, { ...defaults, ...content?.[type] }]));

// Translated CMS text is { en, kn }. Pick the reader's language, or English when that box is empty.
// Plain strings (untranslated fields like the brand name, or older saved copies) pass through.
const isLocalized = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && 'en' in value;

function inLanguage(value, lng) {
  if (isLocalized(value)) return (value[lng] || '').trim() ? value[lng] : value.en;
  if (Array.isArray(value)) return value.map((item) => inLanguage(item, lng));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, inLanguage(v, lng)]));
  }
  return value;
}

function readSavedCopy() {
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    return saved ? JSON.parse(saved) : undefined;
  } catch {
    return undefined; // private mode, blocked storage, or a damaged value: just use the defaults
  }
}

async function fetchContent() {
  // A plain fetch, not the shop's axios client: a slow CMS must not trigger the
  // "waking up the server" banner, which is about the shop API.
  const res = await fetch(`${CMS_URL}/content`, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`CMS answered ${res.status}`);
  const content = withDefaults(await res.json());
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(content));
  } catch {
    // storage full or blocked: fine, we just won't have a copy next time
  }
  return content;
}

export function useSiteContent() {
  const { i18n } = useTranslation(); // re-renders on a language switch: no new request needed
  const { data } = useQuery({
    queryKey: ['site-content'],
    queryFn: fetchContent,
    // Shown immediately. updatedAt 0 = "old", so React Query still fetches the CMS right away.
    initialData: () => withDefaults(readSavedCopy()),
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60 * 1000, // then check again at most every 5 minutes
    retry: 1,
  });
  // Both languages are cached; components get plain strings in the current one.
  return useMemo(() => inLanguage(data, i18n.language), [data, i18n.language]);
}
