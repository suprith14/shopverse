import { Trans, useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import { useLogin } from './auth.api';
import { useRetryCountdown } from '@/lib/use-retry-countdown';
import { PageTitle } from '@/components/layout/PageTitle';
import { useSiteContent } from '@/content/use-site-content';

export function LoginPage() {
  const { t } = useTranslation();
  const { brand } = useSiteContent();
  const navigate = useNavigate();
  const location = useLocation();
  // If the user was redirected here from a protected page, send them back after login.
  const from = location.state?.from ?? '/';
  const login = useLogin();
  const retry = useRetryCountdown(login.error); // 429 -> live "try again in 14:05"
  const [form, setForm] = useState({ email: '', password: '' });

  const onSubmit = (e) => {
    e.preventDefault();
    login.mutate(form, { onSuccess: () => navigate(from, { replace: true }) });
  };

  return (
    <div className="mx-auto max-w-sm py-12">
      <PageTitle title={t('auth.loginTitle')} />
      <h1 className="text-2xl font-bold">{t('auth.welcomeBack')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('auth.loginSubtitle', { brand: brand.name })}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* While rate-limited, a live countdown replaces the generic error message */}
        {retry.blocked ? (
          <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <Trans
              i18nKey="auth.rateLimited"
              values={{ time: retry.label }}
              components={[
                <b key="time" className="tabular-nums" />,
                <Link key="reset" to="/forgot-password" className="font-medium underline" />,
              ]}
            />
          </div>
        ) : (
          login.isError && <ErrorState error={login.error} />
        )}
        <Input
          label={t('auth.email')}
          name="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label={t('auth.password')}
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="-mt-2 text-right">
          <Link to="/forgot-password" className="text-sm text-brand-600 dark:text-brand-300 hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={login.isPending} disabled={retry.blocked}>
          {retry.blocked ? t('auth.tryAgainIn', { time: retry.label }) : t('auth.loginTitle')}
        </Button>
      </form>

      <div className="mt-4 rounded-lg bg-brand-50 p-3 text-xs text-brand-700 dark:text-brand-300">
        <Trans
          i18nKey="auth.demoAccount"
          values={{ email: 'demo@shopverse.dev', password: 'Demo@12345' }}
          components={[<b key="email" />, <b key="password" />]}
        />
        <button
          type="button"
          className="ml-2 underline"
          onClick={() => setForm({ email: 'demo@shopverse.dev', password: 'Demo@12345' })}
        >
          {t('auth.fillIn')}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t('auth.newHere')}{' '}
        <Link to="/register" className="font-medium text-brand-600 dark:text-brand-300 hover:underline">
          {t('auth.createAnAccount')}
        </Link>
      </p>
    </div>
  );
}
