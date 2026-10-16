import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import { useLogin } from './auth.api';
import { PageTitle } from '@/components/layout/PageTitle';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // If the user was redirected here from a protected page, send them back after login.
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const login = useLogin();
  const [form, setForm] = useState({ email: '', password: '' });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(form, { onSuccess: () => navigate(from, { replace: true }) });
  };

  return (
    <div className="mx-auto max-w-sm py-12">
      <PageTitle title="Log in" />
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Log in to your ShopVerse account.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {login.isError && <ErrorState error={login.error} />}
        <Input label="Email" name="email" type="email" required autoComplete="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" name="password" type="password" required autoComplete="current-password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" className="w-full" loading={login.isPending}>Log in</Button>
      </form>

      <div className="mt-4 rounded-lg bg-brand-50 p-3 text-xs text-brand-700">
        Demo account: <b>demo@shopverse.dev</b> / <b>Demo@12345</b>
        <button type="button" className="ml-2 underline" onClick={() => setForm({ email: 'demo@shopverse.dev', password: 'Demo@12345' })}>
          Fill in
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        New here? <Link to="/register" className="font-medium text-brand-600 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
