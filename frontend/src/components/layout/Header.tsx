import { useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { Heart, LogOut, Search, ShoppingBag, ShoppingCart, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth.store';
import { useLogout } from '@/features/auth/auth.api';
import { useCart } from '@/features/cart/cart.api';

export function Header() {
  const navigate = useNavigate();
  const { user, status } = useAuthStore();
  const logout = useLogout();
  const { data: cart } = useCart();
  const [query, setQuery] = useState('');

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : '/shop');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <ShoppingBag className="size-6 text-brand-600" /> ShopVerse
        </Link>

        <nav className="hidden gap-5 md:flex">
          <NavLink to="/shop" className={navClass}>Shop</NavLink>
        </nav>

        <form onSubmit={onSearch} className="relative ml-auto hidden max-w-sm flex-1 sm:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..."
            aria-label="Search products"
            className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white" />
        </form>

        <div className="ml-auto flex items-center gap-3 sm:ml-0">
          {status === 'authenticated' && user ? (
            <>
              <Link to="/wishlist" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Wishlist" title="Wishlist">
                <Heart className="size-5" />
              </Link>
              <Link to="/cart" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Cart" title="Cart">
                <ShoppingCart className="size-5" />
                {!!cart?.itemCount && (
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                    {cart.itemCount > 9 ? '9+' : cart.itemCount}
                  </span>
                )}
              </Link>
              <span className="hidden items-center gap-1.5 text-sm text-slate-700 md:flex">
                <UserIcon className="size-4" /> {user.name}
                {user.role === 'ADMIN' && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">Admin</span>}
              </span>
              <button onClick={() => logout.mutate()} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Log out" title="Log out">
                <LogOut className="size-4" />
              </button>
            </>
          ) : status === 'guest' ? (
            <Link to="/login" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Log in
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
