import { Trans, useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Loader2, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import { PageTitle } from '@/components/layout/PageTitle';
import { notify } from '@/lib/notify';
import { useForgotPassword, useResetPassword } from './auth.api';

// /forgot-password in two steps:
//   1. enter your email   -> we email a 6-digit code (if the account exists)
//   2. code + new password -> password changed, you're logged in
export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  // 'email' = ask for the email; 'code' = enter the code + new password
  const [step, setStep] = useState('email');

  return (
    <div className="mx-auto max-w-sm py-12">
      <PageTitle title={t('auth.resetTitle')} />
      <h1 className="text-2xl font-bold">{t('auth.resetHeading')}</h1>
      {step === 'email' ? (
        <EmailStep email={email} setEmail={setEmail} onSent={() => setStep('code')} />
      ) : (
        <CodeStep email={email} onChangeEmail={() => setStep('email')} />
      )}
      <p className="mt-6 text-center text-sm text-slate-600">
        {t('auth.remembered')}{' '}
        <Link to="/login" className="font-medium text-brand-600 dark:text-brand-300 hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  );
}

// Step 1: the email. The server answers the same way whether or not the account exists.
function EmailStep({ email, setEmail, onSent }) {
  const { t } = useTranslation();
  const forgot = useForgotPassword();
  const submit = (e) => {
    e.preventDefault();
    forgot.mutate({ email }, { onSuccess: onSent });
  };
  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <p className="text-sm text-slate-500">{t('auth.enterEmail')}</p>
      {forgot.isError && <ErrorState error={forgot.error} />}
      <Input
        label={t('auth.email')}
        name="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" className="w-full" loading={forgot.isPending}>
        {t('auth.sendCode')}
      </Button>
    </form>
  );
}

// Step 2: the 6-digit code from the email and the new password. Success logs the user in.
function CodeStep({ email, onChangeEmail }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reset = useResetPassword();
  // "Send a new code" calls the same endpoint again (limited to one email a minute)
  const resend = useForgotPassword();
  const [form, setForm] = useState({ code: '', newPassword: '', confirm: '' });
  const mismatch = form.confirm.length > 0 && form.confirm !== form.newPassword;

  const submit = (e) => {
    e.preventDefault();
    if (mismatch) return;
    reset.mutate(
      { email, code: form.code, newPassword: form.newPassword },
      {
        onSuccess: () => {
          notify.success(t('auth.resetDone'));
          navigate('/', { replace: true });
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {/* Worded so it doesn't confirm whether the account exists */}
      <div className="flex gap-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-800 dark:text-brand-300">
        <MailCheck className="size-5 shrink-0" />
        <p>
          <Trans i18nKey="auth.codeSent" values={{ email }} components={[<b key="email" />]} />
        </p>
      </div>
      {reset.isError && <ErrorState error={reset.error} />}
      {/* inputMode="numeric": number keypad on phones. autoComplete="one-time-code": phones can
           offer the code straight from the notification. */}
      <Input
        label={t('auth.code')}
        name="code"
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        pattern="\d{6}"
        autoFocus
        className="text-center font-mono text-lg tracking-[0.5em]"
        value={form.code}
        onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '') })}
      />
      <Input
        label={t('auth.newPassword')}
        name="newPassword"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        value={form.newPassword}
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
      />
      <Input
        label={t('auth.confirmPassword')}
        name="confirm"
        type="password"
        required
        autoComplete="new-password"
        value={form.confirm}
        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
      />
      {mismatch && <p className="text-sm text-red-600">{t('auth.mismatch')}</p>}
      <Button type="submit" className="w-full" loading={reset.isPending} disabled={mismatch || form.code.length !== 6}>
        {t('auth.resetButton')}
      </Button>
      <div className="flex justify-between text-sm">
        <button type="button" onClick={onChangeEmail} className="text-slate-500 hover:underline">
          {t('auth.differentEmail')}
        </button>
        <button
          type="button"
          disabled={resend.isPending}
          onClick={() =>
            resend.mutate(
              { email },
              { onSuccess: () => notify.success(t('auth.newCodeSent')) },
            )
          }
          className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-300 hover:underline disabled:opacity-50"
        >
          {resend.isPending && <Loader2 className="size-3.5 animate-spin" />}
          {t('auth.sendNewCode')}
        </button>
      </div>
    </form>
  );
}
