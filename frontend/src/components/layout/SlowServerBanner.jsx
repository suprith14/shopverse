import { Loader2 } from 'lucide-react';
import { useNetworkStatus } from '@/lib/network-status';
import { site } from '@/content/site';

// Shown while a request has taken more than a few seconds. On the free hosting plan the
// API sleeps when nobody uses it, and the first visit wakes it up. Saying so (instead of an
// endless spinner) keeps visitors from thinking the site is broken.
export function SlowServerBanner() {
  const slow = useNetworkStatus((s) => s.slow);
  if (!slow) return null;
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900"
    >
      <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
      {site.slowServerNotice}
    </div>
  );
}
