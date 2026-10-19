// /register: create an account (name, email, password).
// On success the API logs the new user straight in, the page goes home and the
// "set up your profile" wizard opens. Validation rules live on the backend (auth.schema.js);
// the required/minLength attributes here only give quick feedback in the browser.

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import { useRegister } from './auth.api';
import { PageTitle } from '@/components/layout/PageTitle';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // the API call + its loading/error state (features/auth/auth.api.js)
  const register = useRegister();
  // opens the profile wizard (features/onboarding/)
  const startOnboarding = useOnboardingStore((s) => s.start);
  // one object for all fields; each input updates its own key
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const onSubmit = (e) => {
    // stop the browser's own form submit (page reload); React handles it
    e.preventDefault();
    register.mutate(form, {
      onSuccess: () => {
        // replace: Back won't return to the sign-up form
        navigate('/', { replace: true });
        startOnboarding(); // the "set up your profile" wizard, only after creating an account
      },
    });
  };

  return (
    <div className="mx-auto max-w-sm py-12">
      <PageTitle title={t('nav.createAccount')} />
      <h1 className="text-2xl font-bold">{t('auth.createTitle')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('auth.createSubtitle')}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* e.g. "An account with this email already exists" from the API */}
        {register.isError && <ErrorState error={register.error} />}
        <Input
          label={t('auth.name')}
          name="name"
          required
          minLength={2}
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
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
          minLength={8}
          // lets the browser suggest a strong password
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" className="w-full" loading={register.isPending}>
          {t('nav.createAccount')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-medium text-brand-600 dark:text-brand-300 hover:underline">
          {t('auth.loginTitle')}
        </Link>
      </p>
    </div>
  );
}
