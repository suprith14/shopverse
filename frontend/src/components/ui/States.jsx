import { useTranslation } from 'react-i18next';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/format';
import { isServerError } from '@/lib/server-error';

// Reusable loading / error / empty states, so every page handles them the same way.

// While data loads (pass a label like "Loading addresses...", or get the default text)
export function Spinner({ label }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
      <Loader2 className="size-5 animate-spin" /> {label ?? t('common.loading')}
    </div>
  );
}

// A red box with a readable message for a failed request. Server failures (5xx) are left to the
// global "Something went wrong" popup instead, so the page doesn't show both.
export function ErrorState({ error }) {
  if (isServerError(error)) return null; // the server-error popup explains it instead
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertCircle className="size-4 shrink-0" /> {getErrorMessage(error)}
    </div>
  );
}

// When a list has nothing in it yet ("Your cart is empty"), with an optional hint
export function EmptyState({ title, hint }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-surface py-16 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
