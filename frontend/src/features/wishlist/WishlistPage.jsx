// /wishlist: the products this customer saved with the heart button.
// Data: useWishlist() -> GET /api/wishlist (features/wishlist/wishlist.api.js).

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
import { Link } from 'react-router';
// import = bring in code from another file or package
import { EmptyState, ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
// import = bring in code from another file or package
import { ProductCard } from '@/features/catalog/components/ProductCard';
// import = bring in code from another file or package
import { useWishlist } from './wishlist.api';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function WishlistPage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // isLoading = first load, no data yet
  // isError = the request failed
  const { data: items, isLoading, isError, error } = useWishlist();

  // grey placeholder cards while loading (no layout jump when real cards arrive)
  // if (...) = run the next part only when the condition is true
  // isLoading = first load, no data yet
  if (isLoading)
    // return = give this value back and stop the function here
    // { } in JSX = run JavaScript here and show its result
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    return <ProductGridSkeleton count={4} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" />;
  // if (...) = run the next part only when the condition is true
  // isError = the request failed
  // a || b = OR: a if it is truthy, else b
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  if (isError || !items) return <ErrorState error={error} />;

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="space-y-6">
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <PageTitle title={t('nav.wishlist')} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <h1 className="text-2xl font-bold">
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {t('wishlistPage.title')}{' '}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <span className="text-base font-normal text-slate-500">{t('wishlistPage.savedCount', { count: items.length })}</span>
      </h1>

      {/* Nothing saved yet: a friendly empty state with a link to the shop */}
      {/* { } in JSX = run JavaScript here and show its result
         a ? b : c = ternary: if a then b else c
         === = strictly equal (same value AND same type) */}
      {items.length === 0 ? (
        // <> </> = a fragment: groups elements without adding an extra HTML element
        <>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <EmptyState title={t('wishlistPage.empty')} hint={t('wishlistPage.emptyHint')} />
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="text-center">
            {/* Link = a link to another page of this app (no full page reload)
               className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Link to="/shop" className="text-brand-600 dark:text-brand-300 hover:underline">
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {t('wishlistPage.browse')}
            </Link>
          </div>
        </>
      ) : (
        // Same product cards as the shop. Tapping the heart here removes the item.
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {/* { } in JSX = run JavaScript here and show its result
             .map = make a new array by transforming each item (in JSX: one element per item)
             => = an arrow function (a short function) */}
          {items.map((entry) => (
            // key = a stable id for list items so React can track them between redraws
            // { } in JSX = run JavaScript here and show its result
            <ProductCard key={entry.product.id} product={entry.product} />
          ))}
        </div>
      )}
    </div>
  );
}
