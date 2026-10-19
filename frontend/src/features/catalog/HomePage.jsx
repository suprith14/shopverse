// The home page (/): banner, category tiles, featured products.
// Texts come from the CMS through useSiteContent() (edited in admin -> Content); categories and
// products come from the shop API through TanStack Query hooks (catalog.api.js).

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ArrowRight, BookOpen, Footprints, Lamp, Smartphone } from 'lucide-react';
import { ErrorState } from '@/components/ui/States';
import { Skeleton, ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useCategories, useProducts } from './catalog.api';
import { ProductCard } from './components/ProductCard';
import { HeroCarousel } from './components/HeroCarousel';
import { PageTitle } from '@/components/layout/PageTitle';
import { useSiteContent } from '@/content/use-site-content';

// An icon per category slug. Unknown slugs fall back to the book icon.
const categoryIcons = {
  sneakers: Footprints,
  electronics: Smartphone,
  books: BookOpen,
  'home-decor': Lamp,
};

export function HomePage() {
  const { t } = useTranslation();
  const categories = useCategories();
  // the best-rated products, used for "Featured products"
  const topRated = useProducts({ sort: 'rating', page: 1 });
  // CMS text, already in the reader's language
  const { brand, home, banner } = useSiteContent();

  return (
    <div className="space-y-14">
      {/* No title given: the tab shows the default title from the CMS */}
      <PageTitle />
      {/* Image slides from the CMS when there are any, otherwise the purple text banner */}
      {banner.slides.length > 0 ? (
        <>
          {/* Slide titles are h2s, so the page still needs ONE h1 (screen readers, search engines) */}
          <h1 className="sr-only">{brand.defaultTitle}</h1>
          <HeroCarousel slides={banner.slides} intervalSeconds={banner.intervalSeconds} />
        </>
      ) : (
        <section className="rounded-3xl bg-gradient-to-br from-night via-brand-700 to-brand-500 px-8 py-16 text-white md:px-14">
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">{home.heroEyebrow}</p>
          <h1 className="mt-3 max-w-xl text-4xl font-bold leading-tight md:text-5xl">{home.heroTitle}</h1>
          <p className="mt-4 max-w-lg text-white/80">{home.heroText}</p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-night hover:bg-white/85"
          >
            {home.heroCtaLabel} <ArrowRight className="size-4" />
          </Link>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold">{home.categoriesHeading}</h2>
        {/* Four grey tiles while the categories load */}
        {categories.isLoading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        )}
        {categories.isError && <ErrorState error={categories.error} />}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.data?.map((c) => {
            const Icon = categoryIcons[c.slug] ?? BookOpen;
            return (
              <Link
                key={c.id}
                to={`/shop?category=${c.slug}`}
                className="group rounded-2xl border border-slate-200 bg-surface p-6 transition hover:border-brand-500 hover:shadow-md"
              >
                <Icon className="size-8 text-brand-600 dark:text-brand-300" />
                {/* Translated by slug; the database name is the fallback */}
                <h3 className="mt-4 font-semibold">{t(`category.${c.slug}`, { defaultValue: c.name })}</h3>
                <p className="text-sm text-slate-500">{t('catalog.productCount', { count: c._count.products })}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">{home.featuredHeading}</h2>
          <Link to="/shop" className="text-sm font-medium text-brand-600 dark:text-brand-300 hover:underline">
            {home.viewAllLabel}
          </Link>
        </div>
        {topRated.isLoading && <ProductGridSkeleton />}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* How many to show is a CMS setting (4-16) */}
          {topRated.data?.items.slice(0, home.featuredCount).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
