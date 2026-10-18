import { NavLink, Outlet } from 'react-router';
import { ExternalLink, FileText, LayoutDashboard, LogOut, Package, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useLogoutMutation } from '@/features/auth/authApi';
import { STORE_URL } from '@/lib/config';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/content', label: 'Content', icon: FileText },
];

// Sidebar + top bar around every admin page. <Outlet /> is where the current page renders.
export function AdminLayout() {
  const user = useAppSelector((s) => s.auth.user);
  const [logout] = useLogoutMutation();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-slate-900 text-slate-300">
        <div className="flex items-center gap-2 px-5 py-5 text-white">
          <ShieldCheck className="size-6 text-brand-500" />
          <span className="font-bold">ShopVerse Admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/60 hover:text-white'}`
              }
            >
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <a
          href={STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="mx-3 mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-800/60 hover:text-white"
        >
          <ExternalLink className="size-4" /> View store
        </a>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-3 border-b border-slate-200 bg-white px-6">
          <span className="text-sm text-slate-600">
            {user?.name} · {user?.email}
          </span>
          <button
            onClick={() => logout()}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
