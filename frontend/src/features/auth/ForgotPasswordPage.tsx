import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { MailCheck } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');

  return (
    <div className="mx-auto max-w-sm py-12">
      <PageTitle title="Reset password" />
      <h1 className="text-2xl font-bold">Reset your password</h1>
      {step === 'email'
        ? <EmailStep email={email} setEmail={setEmail} onSent={() => setStep('code')} />
        : <CodeStep email={email} onChangeEmail={() => setStep('email')} />}
      <p className="mt-6 text-center text-sm text-slate-600">
        Remembered it? <Link to="/login" className="font-medium text-brand-600 hover:underline">Back to log in</Link>
      </p>
    </div>
  );
}

function EmailStep({ email, setEmail, onSent }: { email: string; setEmail: (v: string) => void; onSent: () => void }) {
  const forgot = useForgotPassword();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    forgot.mutate({ email }, { onSuccess: onSent });
  };
  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <p className="text-sm text-slate-500">Enter your account's email and we'll send you a 6-digit code.</p>
      {forgot.isError && <ErrorState error={forgot.error} />}
      <Input label="Email" name="email" type="email" required autoComplete="email" autoFocus
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button type="submit" className="w-full" loading={forgot.isPending}>Send code</Button>
    </form>
  );
}

function CodeStep({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const navigate = useNavigate();
  const reset = useResetPassword();
  const resend = useForgotPassword();
  const [form, setForm] = useState({ code: '', newPassword: '', confirm: '' });
  const mismatch = form.confirm.length > 0 && form.confirm !== form.newPassword;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (mismatch) return;
    reset.mutate(
      { email, code: form.code, newPassword: form.newPassword },
      {
        onSuccess: () => {
          notify.success('Password reset. You are logged in.');
          navigate('/', { replace: true });
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {/* Worded so it doesn't confirm whether the account exists */}
      <div className="flex gap-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-800">
        <MailCheck className="size-5 shrink-0" />
        <p>If <b>{email}</b> has an account, a 6-digit code is on its way. It works for 15 minutes.
          Check your spam folder too.</p>
      </div>
      {reset.isError && <ErrorState error={reset.error} />}
      {/* inputMode="numeric": number keypad on phones. autoComplete="one-time-code": phones can
          offer the code straight from the notification. */}
      <Input label="6-digit code" name="code" required inputMode="numeric" autoComplete="one-time-code" maxLength={6}
        pattern="\d{6}" autoFocus className="text-center font-mono text-lg tracking-[0.5em]"
        value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '') })} />
      <Input label="New password" name="newPassword" type="password" required minLength={8} autoComplete="new-password"
        value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
      <Input label="Confirm new password" name="confirm" type="password" required autoComplete="new-password"
        value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
      {mismatch && <p className="text-sm text-red-600">The two passwords don't match.</p>}
      <Button type="submit" className="w-full" loading={reset.isPending} disabled={mismatch || form.code.length !== 6}>
        Reset password
      </Button>
      <div className="flex justify-between text-sm">
        <button type="button" onClick={onChangeEmail} className="text-slate-500 hover:underline">Use a different email</button>
        <button type="button" disabled={resend.isPending}
          onClick={() => resend.mutate({ email }, { onSuccess: () => notify.success('If the account exists, a new code is on its way.') })}
          className="text-brand-600 hover:underline disabled:opacity-50">Send a new code</button>
      </div>
    </form>
  );
}
