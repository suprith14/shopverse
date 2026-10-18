import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Heart, LogOut, Menu, Package, ShoppingBag, ShoppingCart, User as UserIcon, X } from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth.store';
import { useLogout } from '@/features/auth/auth.api';
import { useCart } from '@/features/cart/cart.api';
import { SearchBox } from '@/features/catalog/components/SearchBox';
import { useProfile } from '@/features/account/account.api';
import { useSiteContent } from '@/content/use-site-content';

// Wide screens: logo · Shop · search · orders · wishlist · cart · account · log out (one row).
// Phones (< md): logo · cart · account · ☰ menu, and the search bar gets its own full-width row,
// because on mobile search is how most shoppers find things.
export function Header() {
  const { brand } = useSiteContent();
  const { user, status } = useAuthStore();
  const logout = useLogout();
  const { data: cart } = useCart();
  const { data: profile } = useProfile(); // for the photo next to the name
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the phone menu whenever the page changes, or on Escape.
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const loggedIn = status === 'authenticated' && !!user;
  const navClass = ({ isActive }) =>
    `text-sm font-medium ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`;
  const iconLink = 'rounded-lg p-2 text-slate-600 hover:bg-slate-100';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:gap-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <ShoppingBag className="size-6 text-brand-600" /> {brand.name}
        </Link>

        <nav className="hidden gap-5 md:flex">
          <NavLink to="/shop" className={navClass}>
            Shop
          </NavLink>
        </nav>

        <SearchBox className="ml-auto hidden max-w-sm flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-3">
          {loggedIn && (
            <>
              <Link to="/orders" className={`${iconLink} hidden md:block`} aria-label="My orders" title="My orders">
                <Package className="size-5" />
              </Link>
              <Link to="/wishlist" className={`${iconLink} hidden md:block`} aria-label="Wishlist" title="Wishlist">
                <Heart className="size-5" />
              </Link>
            </>
          )}
          {loggedIn && (
            <Link to="/cart" className={`relative ${iconLink}`} aria-label="Cart" title="Cart">
              <ShoppingCart className="size-5" />
              {!!cart?.itemCount && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                  {cart.itemCount > 9 ? '9+' : cart.itemCount}
                </span>
              )}
            </Link>
          )}
          {loggedIn && (
            <Link
              to="/account"
              title="My account"
              aria-label="My account"
              className="flex items-center gap-1.5 rounded-lg p-1 text-sm text-slate-700 hover:bg-slate-100"
            >
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="size-7 rounded-full object-cover" />
              ) : (
                <UserIcon className="size-5" />
              )}
              <span className="hidden md:inline">{user.name}</span>
              {user.role === 'ADMIN' && (
                <span className="hidden rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 md:inline">
                  Admin
                </span>
              )}
            </Link>
          )}
          {loggedIn && (
            <button
              onClick={() => logout.mutate()}
              className={`${iconLink} hidden md:block`}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="size-4" />
            </button>
          )}
          {status === 'guest' && (
            <Link
              to="/login"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Log in
            </Link>
          )}

          {/* Phones: everything else lives in this menu */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className={`${iconLink} md:hidden`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Phones: search on its own full-width row */}
      <div className="px-4 pb-3 md:hidden">
        <SearchBox className="w-full" />
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className="border-t border-slate-200 bg-white px-4 py-2 md:hidden">
          <MobileLink to="/shop">Shop</MobileLink>
          {loggedIn ? (
            <>
              <MobileLink to="/orders" icon={Package}>
                My orders
              </MobileLink>
              <MobileLink to="/wishlist" icon={Heart}>
                Wishlist
              </MobileLink>
              <MobileLink to="/account" icon={UserIcon}>
                My account
              </MobileLink>
              <button
                onClick={() => logout.mutate()}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="size-4" /> Log out
              </button>
            </>
          ) : (
            <MobileLink to="/register">Create account</MobileLink>
          )}
        </nav>
      )}
    </header>
  );
}

function MobileLink({ to, icon: Icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-2 py-3 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`
      }
    >
      {Icon && <Icon className="size-4" />} {children}
    </NavLink>
  );
}
