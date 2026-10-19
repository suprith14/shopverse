import { useState } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import { PageTitle } from '@/components/layout/PageTitle';
import { api } from '@/lib/api-client';
import { useRetryCountdown } from '@/lib/use-retry-countdown';
import { useTheme } from '@/lib/theme';

// /account/guide: the project guide (system map, flows, code, data), behind a password.
// The server checks the password and only then sends the guide (POST /api/guide/unlock), so it
// is never in the store's own JavaScript. The guide is kept in memory only: leaving the page or
// reloading locks it again.
export function GuidePage() {
  const { t } = useTranslation();
  const theme = useTheme((s) => s.resolved);
  const [password, setPassword] = useState('');
  const unlock = useMutation({
    mutationFn: async (pw) => (await api.post('/guide/unlock', { password: pw })).data.html,
  });
  const retry = useRetryCountdown(unlock.error); // 429 -> "try again in 14:05"
  const html = unlock.data;

  if (html) {
    // A complete document for the frame, in the store's current theme (the guide reads data-theme).
    // sandbox: the guide's own script may run, but it can't touch the store's page, cookies or
    // storage (no allow-same-origin). Links may still open in a new tab.
    const doc = `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${html}</body></html>`;
    return (
      <div className="space-y-4">
        <PageTitle title={t('guide.title')} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/account"
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-300 hover:underline"
          >
            <ArrowLeft className="size-4" /> {t('nav.myAccount')}
          </Link>
          <Button variant="secondary" onClick={() => unlock.reset()}>
            <Lock className="size-4" /> {t('guide.lock')}
          </Button>
        </div>
        <iframe
          title={t('guide.title')}
          srcDoc={doc}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          className="h-[calc(100vh-11rem)] min-h-[32rem] w-full rounded-xl border border-slate-200 bg-surface"
        />
        <p className="text-xs text-slate-500">{t('guide.englishOnly')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <PageTitle title={t('guide.title')} />
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-surface p-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:text-brand-300">
          <BookOpen className="size-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-bold">{t('guide.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('guide.intro')}</p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            unlock.mutate(password);
          }}
        >
          {retry.blocked ? (
            <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {t('guide.tooMany', { time: retry.label })}
            </div>
          ) : (
            unlock.isError && <ErrorState error={unlock.error} />
          )}
          <Input
            label={t('guide.password')}
            name="guide-password"
            type="password"
            autoComplete="off"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" loading={unlock.isPending} disabled={retry.blocked}>
            <Lock className="size-4" /> {t('guide.unlock')}
          </Button>
        </form>
        <Link
          to="/account"
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-300 hover:underline"
        >
          <ArrowLeft className="size-4" /> {t('nav.myAccount')}
        </Link>
      </div>
    </div>
  );
}
