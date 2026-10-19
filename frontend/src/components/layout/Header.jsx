// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useState } from 'react';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
// NavLink = a Link that knows if it's the current page (isActive) for highlighting
// useLocation = the current URL (pathname, search) and any state passed to it
import { Link, NavLink, useLocation } from 'react-router';
// import = bring in code from another file or package
import { Heart, LogOut, Menu, Package, ShoppingBag, ShoppingCart, User as UserIcon, X } from 'lucide-react';
// import = bring in code from another file or package
import { useAuthStore } from '@/features/auth/auth.store';
// import = bring in code from another file or package
import { useLogout } from '@/features/auth/auth.api';
// import = bring in code from another file or package
import { useCart } from '@/features/cart/cart.api';
// import = bring in code from another file or package
import { SearchBox } from '@/features/catalog/components/SearchBox';
// import = bring in code from another file or package
import { useProfile } from '@/features/account/account.api';
// import = bring in code from another file or package
import { useSiteContent } from '@/content/use-site-content';
// import = bring in code from another file or package
import { ThemeToggle } from './ThemeToggle';
// import = bring in code from another file or package
import { LanguageSwitch } from './LanguageSwitch';

// Wide screens: logo · Shop · search · orders · wishlist · cart · account · log out (one row).
// Phones (< md): logo · cart · account · ☰ menu, and the search bar gets its own full-width row,
// because on mobile search is how most shoppers find things.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function Header() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { brand } = useSiteContent();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { user, status } = useAuthStore();
  // const = a name for a value that is never reassigned
  const logout = useLogout();
  // for the number on the cart icon (only fetched when logged in)
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { data: cart } = useCart();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { data: profile } = useProfile(); // for the photo next to the name
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [menuOpen, setMenuOpen] = useState(false);
  // const = a name for a value that is never reassigned
  // useLocation = the current URL (pathname, search) and any state passed to it
  const location = useLocation();

  // Close the phone menu whenever the page changes, or on Escape.
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // return = give this value back and stop the function here
    if (!menuOpen) return;
    // const = a name for a value that is never reassigned
    // => = an arrow function (a short function)
    // === = strictly equal (same value AND same type)
    // a && b = AND; in JSX: show b only when a is true
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    // window = the browser tab (location, events, timers)
    // addEventListener = run a function when an event happens
    window.addEventListener('keydown', onKey);
    // return = give this value back and stop the function here
    // => = an arrow function (a short function)
    // window = the browser tab (location, events, timers)
    // removeEventListener = stop listening (cleanup)
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // status is 'loading' until the first refresh answers: show neither guest nor user buttons yet
  // const = a name for a value that is never reassigned
  // === = strictly equal (same value AND same type)
  // a && b = AND; in JSX: show b only when a is true
  // !!x = turn any value into true/false
  // ! = NOT: flips true/false
  const loggedIn = status === 'authenticated' && !!user;
  // NavLink passes isActive: the current page's link is highlighted
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // { a, b } = destructuring: take properties a and b out of an object
  const navClass = ({ isActive }) =>
    // `text ${x}` = a template string: text with values inserted
    // a ? b : c = ternary: if a then b else c
    `text-sm font-medium ${isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-600 hover:text-slate-900'}`;
  // const = a name for a value that is never reassigned
  const iconLink = 'rounded-lg p-2 text-slate-600 hover:bg-slate-100';

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-surface/90 backdrop-blur">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:gap-6">
        {/* Link = a link to another page of this app (no full page reload)
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result */}
          <ShoppingBag className="size-6 text-brand-600 dark:text-brand-300" /> {brand.name}
        </Link>

        {/* <nav> = a navigation area (screen readers can jump to it)
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <nav className="hidden gap-5 md:flex">
          {/* NavLink = a Link that knows if it's the current page (isActive) for highlighting
             className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result */}
          <NavLink to="/shop" className={navClass}>
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('nav.shop')}
          </NavLink>
        </nav>

        {/* Wide screens: search in the header row (phones get their own row below) */}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <SearchBox className="ml-auto hidden max-w-sm flex-1 md:block" />

        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-3">
          <LanguageSwitch />
          <ThemeToggle />
          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true */}
          {loggedIn && (
            // <> </> = a fragment: groups elements without adding an extra HTML element
            <>
              {/* Link = a link to another page of this app (no full page reload)
                 className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result
                 `text ${x}` = a template string: text with values inserted
                 aria-label = the name screen readers read for this element
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <Link to="/orders" className={`${iconLink} hidden md:block`} aria-label={t('nav.myOrders')} title={t('nav.myOrders')}>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <Package className="size-5" />
              </Link>
              {/* Link = a link to another page of this app (no full page reload)
                 className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result
                 `text ${x}` = a template string: text with values inserted
                 aria-label = the name screen readers read for this element
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <Link to="/wishlist" className={`${iconLink} hidden md:block`} aria-label={t('nav.wishlist')} title={t('nav.wishlist')}>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <Heart className="size-5" />
              </Link>
            </>
          )}
          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true */}
          {loggedIn && (
            // Link = a link to another page of this app (no full page reload)
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            // { } in JSX = run JavaScript here and show its result
            // `text ${x}` = a template string: text with values inserted
            // aria-label = the name screen readers read for this element
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            <Link to="/cart" className={`relative ${iconLink}`} aria-label={t('nav.cart')} title={t('nav.cart')}>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <ShoppingCart className="size-5" />
              {/* { } in JSX = run JavaScript here and show its result
                 !!x = turn any value into true/false
                 ! = NOT: flips true/false
                 ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
                 a && b = AND; in JSX: show b only when a is true */}
              {!!cart?.itemCount && (
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                  {/* Badge with the number of items; "9+" keeps it small */}
                  {/* { } in JSX = run JavaScript here and show its result
                     a ? b : c = ternary: if a then b else c */}
                  {cart.itemCount > 9 ? '9+' : cart.itemCount}
                </span>
              )}
            </Link>
          )}
          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true */}
          {loggedIn && (
            // Link = a link to another page of this app (no full page reload)
            <Link
              to="/account"
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              title={t('nav.myAccount')}
              // aria-label = the name screen readers read for this element
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              aria-label={t('nav.myAccount')}
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              className="flex items-center gap-1.5 rounded-lg p-1 text-sm text-slate-700 hover:bg-slate-100"
            >
              {/* { } in JSX = run JavaScript here and show its result
                 a ? b : c = ternary: if a then b else c
                 ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined */}
              {profile?.avatarUrl ? (
                // { } in JSX = run JavaScript here and show its result
                // alt = text describing the image for screen readers (empty = decorative)
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                <img src={profile.avatarUrl} alt="" className="size-7 rounded-full object-cover" />
              ) : (
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                <UserIcon className="size-5" />
              )}
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result */}
              <span className="hidden md:inline">{user.name}</span>
              {/* { } in JSX = run JavaScript here and show its result
                 === = strictly equal (same value AND same type)
                 a && b = AND; in JSX: show b only when a is true */}
              {user.role === 'ADMIN' && (
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                <span className="hidden rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 md:inline">
                  {/* { } in JSX = run JavaScript here and show its result
                     t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                  {t('nav.admin')}
                </span>
              )}
            </Link>
          )}
          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true */}
          {loggedIn && (
            <button
              // onClick = what happens on click/tap
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              // mutate = run the mutation (send the change)
              onClick={() => logout.mutate()}
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // { } in JSX = run JavaScript here and show its result
              // `text ${x}` = a template string: text with values inserted
              className={`${iconLink} hidden md:block`}
              // aria-label = the name screen readers read for this element
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              aria-label={t('nav.logOut')}
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              title={t('nav.logOut')}
            >
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <LogOut className="size-4" />
            </button>
          )}
          {/* Not logged in: a Log in button (hidden while the login check is still running) */}
          {/* { } in JSX = run JavaScript here and show its result
             === = strictly equal (same value AND same type)
             a && b = AND; in JSX: show b only when a is true */}
          {status === 'guest' && (
            // Link = a link to another page of this app (no full page reload)
            <Link
              to="/login"
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-700"
            >
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {t('nav.logIn')}
            </Link>
          )}

          {/* Phones: everything else lives in this menu */}
          <button
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // ! = NOT: flips true/false
            onClick={() => setMenuOpen((o) => !o)}
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            // { } in JSX = run JavaScript here and show its result
            // `text ${x}` = a template string: text with values inserted
            className={`${iconLink} md:hidden`}
            // aria-label = the name screen readers read for this element
            // { } in JSX = run JavaScript here and show its result
            // a ? b : c = ternary: if a then b else c
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            // aria-expanded = tells screen readers if the controlled panel is open
            // { } in JSX = run JavaScript here and show its result
            aria-expanded={menuOpen}
            // aria-controls = the id of the element this button opens/closes
            aria-controls="mobile-menu"
          >
            {/* { } in JSX = run JavaScript here and show its result
               a ? b : c = ternary: if a then b else c
               className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Phones: search on its own full-width row */}
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="px-4 pb-3 md:hidden">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <SearchBox className="w-full" />
      </div>

      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true */}
      {menuOpen && (
        // <nav> = a navigation area (screen readers can jump to it)
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <nav id="mobile-menu" className="border-t border-slate-200 bg-surface px-4 py-2 md:hidden">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <MobileLink to="/shop">{t('nav.shop')}</MobileLink>
          {/* { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c */}
          {loggedIn ? (
            // <> </> = a fragment: groups elements without adding an extra HTML element
            <>
              {/* { } in JSX = run JavaScript here and show its result */}
              <MobileLink to="/orders" icon={Package}>
                {/* { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                {t('nav.myOrders')}
              </MobileLink>
              {/* { } in JSX = run JavaScript here and show its result */}
              <MobileLink to="/wishlist" icon={Heart}>
                {/* { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                {t('nav.wishlist')}
              </MobileLink>
              {/* { } in JSX = run JavaScript here and show its result */}
              <MobileLink to="/account" icon={UserIcon}>
                {/* { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                {t('nav.myAccount')}
              </MobileLink>
              <button
                // onClick = what happens on click/tap
                // { } in JSX = run JavaScript here and show its result
                // => = an arrow function (a short function)
                // mutate = run the mutation (send the change)
                onClick={() => logout.mutate()}
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                   { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                <LogOut className="size-4" /> {t('nav.logOut')}
              </button>
            </>
          ) : (
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            <MobileLink to="/register">{t('nav.createAccount')}</MobileLink>
          )}
        </nav>
      )}
    </header>
  );
}

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// children = whatever is written between this component's opening and closing tags
function MobileLink({ to, icon: Icon, children }) {
  // return = give this value back and stop the function here
  return (
    // NavLink = a Link that knows if it's the current page (isActive) for highlighting
    <NavLink
      // { } in JSX = run JavaScript here and show its result
      to={to}
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      // { } in JSX = run JavaScript here and show its result
      // => = an arrow function (a short function)
      // { a, b } = destructuring: take properties a and b out of an object
      className={({ isActive }) =>
        // `text ${x}` = a template string: text with values inserted
        // a ? b : c = ternary: if a then b else c
        `flex items-center gap-3 rounded-lg px-2 py-3 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700 dark:text-brand-300' : 'text-slate-700 hover:bg-slate-50'}`
      }
    >
      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true
         className = CSS classes (Tailwind) for this element (class is a JS keyword)
         children = whatever is written between this component's opening and closing tags */}
      {Icon && <Icon className="size-4" />} {children}
    </NavLink>
  );
}
