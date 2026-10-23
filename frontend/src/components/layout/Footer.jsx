import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ArrowUp, CreditCard, Lock, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth.store';
import { useCategories } from '@/features/catalog/catalog.api';
import { useSiteContent } from '@/content/use-site-content';

const MAX_CATEGORIES = 8; // more than this and the column gets long; "All products" covers the rest

// "4242 4242 4242 4242" must never break over two lines (someone copies it): join the groups
// of 4 digits with non-breaking spaces.
const keepCardNumbersTogether = (text) => text.replace(/(\d{4}) (?=\d{4})/g, '$1\u00A0');

// The footer on every page. Its texts (tagline, checkout note, test card hint, bottom line) come
// from the CMS, so they can be changed without a deploy. The links are never typed in by hand:
// Shop lists the real categories (the same cached request as the category tabs), Account follows
// the login state. So the footer can't link to a page or category that doesn't exist.
export function Footer() {
  const { t } = useTranslation();
  const { brand, footer } = useSiteContent();
  const { user, status } = useAuthStore();
  const { data: categories = [] } = useCategories();
  const loggedIn = status === 'authenticated' && !!user;

  const accountLinks = loggedIn
    ? [
        { to: '/account', label: t('nav.myAccount') },
        { to: '/orders', label: t('nav.myOrders') },
        { to: '/wishlist', label: t('nav.wishlist') },
        { to: '/cart', label: t('nav.cart') },
      ]
    : [
        { to: '/login', label: t('nav.logIn') },
        { to: '/register', label: t('nav.createAccount') },
        { to: '/forgot-password', label: t('auth.forgotPassword') },
      ];

  const backToTop = () => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  };

  return (
    <footer className="border-t border-slate-200 bg-surface text-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <ShoppingBag className="size-6 text-brand-600 dark:text-brand-300" aria-hidden /> {brand.name}
          </Link>
          <p className="mt-3 max-w-xs text-slate-600">{footer.tagline}</p>
        </div>

        <FooterLinks
          title={t('footer.shop')}
          links={[
            ...categories.slice(0, MAX_CATEGORIES).map((c) => ({ to: `/shop?category=${c.slug}`, label: c.name })),
            { to: '/shop', label: t('footer.allProducts') },
          ]}
        />
        <FooterLinks title={t('footer.account')} links={accountLinks} />

        <div className="col-span-2 md:col-span-1">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Lock className="size-4" aria-hidden /> {t('footer.checkout')}
          </h2>
          <p className="mt-3 text-slate-600">{footer.paymentNote}</p>
          {/* Empty in the CMS = hidden (e.g. once real payments are switched on) */}
          {footer.testCardNote && (
            <p className="mt-3 flex gap-2 rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
              <CreditCard className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{keepCardNumbersTogether(footer.testCardNote)}</span>
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {t('footer.copyright', { year: new Date().getFullYear(), brand: brand.name })} · {footer.text}
          </p>
          <button
            type="button"
            onClick={backToTop}
            className="inline-flex items-center gap-1 self-start rounded-md px-2 py-1 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 sm:self-auto"
          >
            <ArrowUp className="size-3.5" aria-hidden /> {t('footer.backToTop')}
          </button>
        </div>
      </div>
    </footer>
  );
}

// One link column. A <nav> with its own name, so screen readers can list and jump to it.
function FooterLinks({ title, links }) {
  return (
    <nav aria-label={title}>
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-slate-600 hover:text-slate-900 hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
