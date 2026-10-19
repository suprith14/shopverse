// One product tile in a grid (home page, shop, wishlist): image, brand, name, stars, price.
// The whole card is a link to the product page; the heart button sits on top of the image.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
import { Link } from 'react-router';
// import = bring in code from another file or package
import { StarRating } from '@/components/ui/StarRating';
// import = bring in code from another file or package
import { formatPrice } from '@/lib/format';
// import = bring in code from another file or package
import { WishlistButton } from '@/features/wishlist/WishlistButton';

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function ProductCard({ product }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // return = give this value back and stop the function here
  return (
    // Link = a link to another page of this app (no full page reload)
    <Link
      // { } in JSX = run JavaScript here and show its result
      // `text ${x}` = a template string: text with values inserted
      to={`/products/${product.slug}`}
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      className="group overflow-hidden rounded-xl border border-slate-200 bg-surface transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true */}
        {product.image && (
          <img
            // { } in JSX = run JavaScript here and show its result
            src={product.image}
            // alt = text describing the image for screen readers (empty = decorative)
            // { } in JSX = run JavaScript here and show its result
            alt={product.name}
            // images below the screen load only when scrolled near
            // loading="lazy" = load the image only when it gets near the screen
            loading="lazy"
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        {/* Every variant sold out: a dark "Sold out" badge on the photo (night = dark in both themes) */}
        {/* { } in JSX = run JavaScript here and show its result
           ! = NOT: flips true/false
           a && b = AND; in JSX: show b only when a is true */}
        {!product.inStock && (
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          <span className="absolute left-2 top-2 rounded-full bg-night/80 px-2 py-0.5 text-xs font-medium text-white">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('catalog.soldOut')}
          </span>
        )}
        {/* Its click handler stops the card's link from opening (see WishlistButton) */}
        {/* { } in JSX = run JavaScript here and show its result
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <WishlistButton productId={product.id} className="absolute right-2 top-2" />
      </div>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="space-y-1 p-4">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result */}
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.brand}</p>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result */}
        <h3 className="line-clamp-1 font-semibold text-slate-900">{product.name}</h3>
        {/* { } in JSX = run JavaScript here and show its result */}
        <StarRating value={product.ratingAvg} count={product.ratingCount} />
        {/* basePrice = the cheapest variant, kept up to date by the backend */}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result */}
        <p className="pt-1 font-semibold text-brand-700 dark:text-brand-300">{formatPrice(product.basePrice)}</p>
      </div>
    </Link>
  );
}
