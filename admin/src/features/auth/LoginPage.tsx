import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import { useAppSelector } from '@/app/hooks';
import { getErrorMessage } from '@/lib/format';
import { useLoginMutation } from './authApi';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const status = useAppSelector((s) => s.auth.status);
  const [login, { isLoading, error }] = useLoginMutation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [notAdmin, setNotAdmin] = useState(false);

  if (status === 'authenticated') return <Navigate to={from} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNotAdmin(false);
    try {
      // unwrap(): gives the response data, or throws the error, like a normal async function.
      const data = await login(form).unwrap();
      if (data.user.role !== 'ADMIN') setNotAdmin(true);
      else navigate(from, { replace: true });
    } catch {
      // the error is shown from `error` below
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="size-7 text-brand-600" />
          <div>
            <h1 className="text-xl font-bold">ShopVerse Admin</h1>
            <p className="text-sm text-slate-500">Staff only</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && <ErrorState message={getErrorMessage(error)} />}
          {notAdmin && <ErrorState message="This account is not an admin. Use the store to shop." />}
          <Input label="Email" name="email" type="email" required autoComplete="username"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" name="password" type="password" required autoComplete="current-password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" className="w-full py-2.5" loading={isLoading}>Log in</Button>
        </form>

        <div className="mt-4 rounded-lg bg-brand-50 p-3 text-xs text-brand-700">
          Demo admin: <b>admin@shopverse.dev</b> / <b>Admin@12345</b>
          <button type="button" className="ml-2 underline" onClick={() => setForm({ email: 'admin@shopverse.dev', password: 'Admin@12345' })}>
            Fill in
          </button>
        </div>
      </div>
    </div>
  );
}
