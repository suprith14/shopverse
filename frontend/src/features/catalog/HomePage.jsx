// The home page (/): banner, category tiles, featured products.
// Texts come from the CMS through useSiteContent() (edited in admin -> Content); categories and
// products come from the shop API through TanStack Query hooks (catalog.api.js).

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
import { Link } from 'react-router';
// import = bring in code from another file or package
import { ArrowRight, BookOpen, Footprints, Lamp, Smartphone } from 'lucide-react';
// import = bring in code from another file or package
import { ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { Skeleton, ProductGridSkeleton } from '@/components/ui/Skeleton';
// import = bring in code from another file or package
import { useCategories, useProducts } from './catalog.api';
// import = bring in code from another file or package
import { ProductCard } from './components/ProductCard';
// import = bring in code from another file or package
import { HeroCarousel } from './components/HeroCarousel';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';
// import = bring in code from another file or package
import { useSiteContent } from '@/content/use-site-content';

// An icon per category slug. Unknown slugs fall back to the book icon.
// const = a name for a value that is never reassigned
const categoryIcons = {
  sneakers: Footprints,
  electronics: Smartphone,
  books: BookOpen,
  'home-decor': Lamp,
};

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function HomePage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  const categories = useCategories();
  // the best-rated products, used for "Featured products"
  // const = a name for a value that is never reassigned
  const topRated = useProducts({ sort: 'rating', page: 1 });
  // CMS text, already in the reader's language
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { brand, home, banner } = useSiteContent();

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="space-y-14">
      {/* No title given: the tab shows the default title from the CMS */}
      <PageTitle />
      {/* Image slides from the CMS when there are any, otherwise the purple text banner */}
      {/* { } in JSX = run JavaScript here and show its result
         a ? b : c = ternary: if a then b else c */}
      {banner.slides.length > 0 ? (
        // <> </> = a fragment: groups elements without adding an extra HTML element
        <>
          {/* Slide titles are h2s, so the page still needs ONE h1 (screen readers, search engines) */}
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result */}
          <h1 className="sr-only">{brand.defaultTitle}</h1>
          {/* { } in JSX = run JavaScript here and show its result */}
          <HeroCarousel slides={banner.slides} intervalSeconds={banner.intervalSeconds} />
        </>
      ) : (
        // <section> = a themed part of the page with its own heading
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <section className="rounded-3xl bg-gradient-to-br from-night via-brand-700 to-brand-500 px-8 py-16 text-white md:px-14">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result */}
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">{home.heroEyebrow}</p>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result */}
          <h1 className="mt-3 max-w-xl text-4xl font-bold leading-tight md:text-5xl">{home.heroTitle}</h1>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result */}
          <p className="mt-4 max-w-lg text-white/80">{home.heroText}</p>
          {/* Link = a link to another page of this app (no full page reload) */}
          <Link
            to="/shop"
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-night hover:bg-white/85"
          >
            {/* { } in JSX = run JavaScript here and show its result
               className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            {home.heroCtaLabel} <ArrowRight className="size-4" />
          </Link>
        </section>
      )}

      {/* <section> = a themed part of the page with its own heading */}
      <section>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result */}
        <h2 className="mb-4 text-xl font-bold">{home.categoriesHeading}</h2>
        {/* Four grey tiles while the categories load */}
        {/* { } in JSX = run JavaScript here and show its result
           isLoading = first load, no data yet
           a && b = AND; in JSX: show b only when a is true */}
        {categories.isLoading && (
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* { } in JSX = run JavaScript here and show its result
               => = an arrow function (a short function) */}
            {Array.from({ length: 4 }, (_, i) => (
              // key = a stable id for list items so React can track them between redraws
              // { } in JSX = run JavaScript here and show its result
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        )}
        {/* { } in JSX = run JavaScript here and show its result
           isError = the request failed
           a && b = AND; in JSX: show b only when a is true */}
        {categories.isError && <ErrorState error={categories.error} />}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* { } in JSX = run JavaScript here and show its result
             ?.() = call only if the function exists
             ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
             .map = make a new array by transforming each item (in JSX: one element per item)
             => = an arrow function (a short function) */}
          {categories.data?.map((c) => {
            // const = a name for a value that is never reassigned
            // obj[key] = read the property whose name is stored in key
            // a ?? b = a, unless a is null/undefined, then b
            const Icon = categoryIcons[c.slug] ?? BookOpen;
            // return = give this value back and stop the function here
            return (
              // Link = a link to another page of this app (no full page reload)
              <Link
                // key = a stable id for list items so React can track them between redraws
                // { } in JSX = run JavaScript here and show its result
                key={c.id}
                // { } in JSX = run JavaScript here and show its result
                // `text ${x}` = a template string: text with values inserted
                to={`/shop?category=${c.slug}`}
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                className="group rounded-2xl border border-slate-200 bg-surface p-6 transition hover:border-brand-500 hover:shadow-md"
              >
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <Icon className="size-8 text-brand-600 dark:text-brand-300" />
                {/* Translated by slug; the database name is the fallback */}
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                   { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                   `text ${x}` = a template string: text with values inserted */}
                <h3 className="mt-4 font-semibold">{t(`category.${c.slug}`, { defaultValue: c.name })}</h3>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                   { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                <p className="text-sm text-slate-500">{t('catalog.productCount', { count: c._count.products })}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* <section> = a themed part of the page with its own heading */}
      <section>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="mb-4 flex items-end justify-between">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result */}
          <h2 className="text-xl font-bold">{home.featuredHeading}</h2>
          {/* Link = a link to another page of this app (no full page reload)
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <Link to="/shop" className="text-sm font-medium text-brand-600 dark:text-brand-300 hover:underline">
            {/* { } in JSX = run JavaScript here and show its result */}
            {home.viewAllLabel}
          </Link>
        </div>
        {/* { } in JSX = run JavaScript here and show its result
           isLoading = first load, no data yet
           a && b = AND; in JSX: show b only when a is true */}
        {topRated.isLoading && <ProductGridSkeleton />}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* How many to show is a CMS setting (4-16) */}
          {/* { } in JSX = run JavaScript here and show its result
             ?.() = call only if the function exists
             ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
             .slice = a copy of part of an array/string
             .map = make a new array by transforming each item (in JSX: one element per item)
             => = an arrow function (a short function) */}
          {topRated.data?.items.slice(0, home.featuredCount).map((p) => (
            // key = a stable id for list items so React can track them between redraws
            // { } in JSX = run JavaScript here and show its result
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
