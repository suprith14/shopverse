import { AlertCircle, Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/format';
import { isServerError } from '@/lib/server-error';

// Reusable loading / error / empty states, so every page handles them the same way.

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
      <Loader2 className="size-5 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ error }) {
  if (isServerError(error)) return null; // the server-error popup explains it instead
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertCircle className="size-4 shrink-0" /> {getErrorMessage(error)}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
