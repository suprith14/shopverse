// /products/:slug: one product. Photos, price, options (sizes/colours = variants), quantity,
// Add to cart, details and reviews.
// The page is split in parts: ProductDetailPage loads the data, ProductView shows it, AddToCart
// handles the quantity and the cart call, Attributes lists the product details.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
// useLocation = the current URL (pathname, search) and any state passed to it
// useNavigate = gives navigate(url) to change page from code
// useParams = the :parts of the URL, e.g. :slug in /products/:slug
import { Link, useLocation, useNavigate, useParams } from 'react-router';
// import = bring in code from another file or package
import { Minus, Plus, ShoppingCart } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
// import = bring in code from another file or package
import { StarRating } from '@/components/ui/StarRating';
// import = bring in code from another file or package
import { formatPrice } from '@/lib/format';
// import = bring in code from another file or package
import { useAuthStore } from '@/features/auth/auth.store';
// import = bring in code from another file or package
import { useAddToCart } from '@/features/cart/cart.api';
// import = bring in code from another file or package
import { WishlistButton } from '@/features/wishlist/WishlistButton';
// import = bring in code from another file or package
import { ProductReviews } from '@/features/reviews/ProductReviews';
// import = bring in code from another file or package
import { useProduct } from './catalog.api';
// import = bring in code from another file or package
import { notify } from '@/lib/notify';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function ProductDetailPage() {
  // the :slug part of the URL, e.g. "air-stride-runner"
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // x = value (in parameters) = the default used when x is not given
  // useParams = the :parts of the URL, e.g. :slug in /products/:slug
  const { slug = '' } = useParams();
  // GET /api/catalog/products/:slug (catalog.api.js)
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // isLoading = first load, no data yet
  // isError = the request failed
  const { data: product, isLoading, isError, error } = useProduct(slug);

  // if (...) = run the next part only when the condition is true
  // isLoading = first load, no data yet
  // return = give this value back and stop the function here
  if (isLoading) return <ProductDetailSkeleton />;
  // if (...) = run the next part only when the condition is true
  // isError = the request failed
  // a || b = OR: a if it is truthy, else b
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  if (isError || !product) return <ErrorState error={error} />;
  // key={product.id} resets the selected image/variant when navigating to another product.
  // return = give this value back and stop the function here
  // key = a stable id for list items so React can track them between redraws
  // { } in JSX = run JavaScript here and show its result
  return <ProductView key={product.id} product={product} />;
}

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function ProductView({ product }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // which photo is shown big
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [imageIndex, setImageIndex] = useState(0);
  // Default to the first variant that is in stock.
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // .find = the first item that passes a test (or undefined)
  // => = an arrow function (a short function)
  // a ?? b = a, unless a is null/undefined, then b
  const [variantId, setVariantId] = useState((product.variants.find((v) => v.stock > 0) ?? product.variants[0])?.id);
  // the chosen option: its price and stock are what the page shows
  // const = a name for a value that is never reassigned
  // .find = the first item that passes a test (or undefined)
  // => = an arrow function (a short function)
  // === = strictly equal (same value AND same type)
  const variant = product.variants.find((v) => v.id === variantId);

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="space-y-4">
      {/* { } in JSX = run JavaScript here and show its result */}
      <PageTitle title={product.name} />
      {/* Breadcrumb: Shop / Category / Product name */}
      {/* <nav> = a navigation area (screen readers can jump to it)
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <nav className="text-sm text-slate-500">
        {/* Link = a link to another page of this app (no full page reload)
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Link to="/shop" className="hover:underline">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('nav.shop')}
        {/* { } in JSX = run JavaScript here and show its result */}
        </Link>{' '}
        /{' '}
        {/* Link = a link to another page of this app (no full page reload)
           { } in JSX = run JavaScript here and show its result
           `text ${x}` = a template string: text with values inserted
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Link to={`/shop?category=${product.category.slug}`} className="hover:underline">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
             `text ${x}` = a template string: text with values inserted */}
          {t(`category.${product.category.slug}`, { defaultValue: product.category.name })}
        {/* { } in JSX = run JavaScript here and show its result */}
        </Link>{' '}
        / <span className="text-slate-800">{product.name}</span>
      </nav>

      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="grid gap-10 md:grid-cols-2">
        {/* Image gallery */}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="space-y-3">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
            {/* { } in JSX = run JavaScript here and show its result
               obj[key] = read the property whose name is stored in key
               alt = text describing the image for screen readers (empty = decorative)
               className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <img src={product.images[imageIndex]} alt={product.name} className="size-full object-cover" />
          </div>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex gap-3">
            {/* { } in JSX = run JavaScript here and show its result
               .map = make a new array by transforming each item (in JSX: one element per item)
               => = an arrow function (a short function) */}
            {product.images.map((src, i) => (
              <button
                // key = a stable id for list items so React can track them between redraws
                // { } in JSX = run JavaScript here and show its result
                key={src}
                // onClick = what happens on click/tap
                // { } in JSX = run JavaScript here and show its result
                // => = an arrow function (a short function)
                onClick={() => setImageIndex(i)}
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                // { } in JSX = run JavaScript here and show its result
                // `text ${x}` = a template string: text with values inserted
                // a ? b : c = ternary: if a then b else c
                // === = strictly equal (same value AND same type)
                className={`size-20 overflow-hidden rounded-lg ring-2 ${i === imageIndex ? 'ring-brand-500' : 'ring-transparent'}`}
              >
                {/* { } in JSX = run JavaScript here and show its result
                   alt = text describing the image for screen readers (empty = decorative)
                   className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info + variant picker */}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="space-y-5">
          <div>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result */}
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{product.brand}</p>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <div className="flex items-start justify-between gap-4">
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result */}
              <h1 className="text-3xl font-bold">{product.name}</h1>
              {/* { } in JSX = run JavaScript here and show its result
                 className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <WishlistButton productId={product.id} className="shrink-0 border border-slate-200" />
            </div>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <div className="mt-2">
              {/* { } in JSX = run JavaScript here and show its result */}
              <StarRating value={product.ratingAvg} count={product.ratingCount} size="md" />
            </div>
          </div>

          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
             a ?? b = a, unless a is null/undefined, then b */}
          <p className="text-3xl font-semibold text-brand-700 dark:text-brand-300">{formatPrice(variant?.price ?? product.basePrice)}</p>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result */}
          <p className="leading-relaxed text-slate-600">{product.description}</p>

          <div>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <h2 className="mb-2 text-sm font-semibold">{t('product.chooseOption')}</h2>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <div className="flex flex-wrap gap-2">
              {/* One button per option; sold-out options are disabled and struck through */}
              {/* { } in JSX = run JavaScript here and show its result
                 .map = make a new array by transforming each item (in JSX: one element per item)
                 => = an arrow function (a short function) */}
              {product.variants.map((v) => (
                <button
                  // key = a stable id for list items so React can track them between redraws
                  // { } in JSX = run JavaScript here and show its result
                  key={v.id}
                  // onClick = what happens on click/tap
                  // { } in JSX = run JavaScript here and show its result
                  // => = an arrow function (a short function)
                  onClick={() => setVariantId(v.id)}
                  // disabled = can't be clicked or typed in
                  // { } in JSX = run JavaScript here and show its result
                  // === = strictly equal (same value AND same type)
                  disabled={v.stock === 0}
                  // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                  // { } in JSX = run JavaScript here and show its result
                  // `text ${x}` = a template string: text with values inserted
                  className={`rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${
                    // a ? b : c = ternary: if a then b else c
                    // === = strictly equal (same value AND same type)
                    v.id === variantId
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:text-brand-300'
                      : 'border-slate-300 bg-surface hover:border-slate-400'
                  }`}
                >
                  {/* { } in JSX = run JavaScript here and show its result */}
                  {v.name}
                </button>
              ))}
            </div>
            {/* { } in JSX = run JavaScript here and show its result
               a && b = AND; in JSX: show b only when a is true */}
            {variant && (
              <p
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                // { } in JSX = run JavaScript here and show its result
                // `text ${x}` = a template string: text with values inserted
                // a ? b : c = ternary: if a then b else c
                // a && b = AND; in JSX: show b only when a is true
                className={`mt-2 text-sm ${variant.stock > 0 && variant.stock <= 5 ? 'text-amber-600' : 'text-slate-500'}`}
              >
                {/* "Only 3 left!" in amber when 5 or fewer remain (a gentle nudge, and true) */}
                {/* { } in JSX = run JavaScript here and show its result
                   a ? b : c = ternary: if a then b else c
                   === = strictly equal (same value AND same type) */}
                {variant.stock === 0
                  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                  ? t('product.outOfStock')
                  // a ? b : c = ternary: if a then b else c
                  : variant.stock <= 5
                    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                    ? t('product.onlyLeft', { count: variant.stock })
                    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                    : t('product.inStock')}
              </p>
            )}
          </div>

          {/* key: picking another size resets the quantity to 1 */}
          {/* key = a stable id for list items so React can track them between redraws
             { } in JSX = run JavaScript here and show its result
             ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined */}
          <AddToCart key={variant?.id} variant={variant} productName={product.name} />

          {/* { } in JSX = run JavaScript here and show its result */}
          <Attributes attributes={product.attributes} />
        </div>
      </div>

      {/* Reviews load separately, so the product shows first */}
      {/* { } in JSX = run JavaScript here and show its result */}
      <ProductReviews productId={product.id} />
    </div>
  );
}

// Same cap as the backend (cart.schema.ts). The backend still enforces it and the stock.
// const = a name for a value that is never reassigned
const MAX_PER_ITEM = 10;

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function AddToCart({ variant, productName }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const status = useAuthStore((s) => s.status);
  // const = a name for a value that is never reassigned
  // useNavigate = gives navigate(url) to change page from code
  const navigate = useNavigate();
  // const = a name for a value that is never reassigned
  // useLocation = the current URL (pathname, search) and any state passed to it
  const location = useLocation();
  // POST /api/cart/items; on success the cart badge in the header updates (cart.api.js)
  // const = a name for a value that is never reassigned
  const addToCart = useAddToCart();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [quantity, setQuantity] = useState(1);
  // the + button stops at the stock or at 10, whichever is lower
  // const = a name for a value that is never reassigned
  // Math = number helpers (min, max, round, floor...)
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  const max = Math.max(1, Math.min(variant?.stock ?? 1, MAX_PER_ITEM));

  // const = a name for a value that is never reassigned
  // onClick = what happens on click/tap
  // => = an arrow function (a short function)
  const onClick = () => {
    // Guests are sent to login, then brought back to this product.
    // if (...) = run the next part only when the condition is true
    // !== = not strictly equal
    if (status !== 'authenticated') {
      navigate('/login', { state: { from: location.pathname } });
      // return = give this value back and stop the function here
      return;
    }
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // return = give this value back and stop the function here
    if (!variant) return;
    // mutate = run the mutation (send the change)
    addToCart.mutate(
      { variantId: variant.id, quantity },
      {
        // onSuccess = runs after the request succeeded
        // => = an arrow function (a short function)
        onSuccess: () =>
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          notify.success(t('product.added', { count: quantity, name: productName, variant: variant.name }), {
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            label: t('product.viewCart'),
            // onClick = what happens on click/tap
            // => = an arrow function (a short function)
            onClick: () => navigate('/cart'),
          }),
        // onError = runs if the request failed
        onError: notify.error, // e.g. "Only 2 left in stock"
      },
    );
  };

  // no option chosen, or it has no stock: the button is disabled
  // const = a name for a value that is never reassigned
  // ! = NOT: flips true/false
  // a || b = OR: a if it is truthy, else b
  // === = strictly equal (same value AND same type)
  const soldOut = !variant || variant.stock === 0;

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="space-y-2">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex gap-3">
        {/* Quantity stepper: buttons instead of a number box, which are easier to tap on phones
             and can't produce "0", "-3" or "1.5". Limited by stock and the per-item cap. */}
        <div
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="flex items-center rounded-lg border border-slate-300 bg-surface"
          // role = tells screen readers what this element is (status, tab, group...)
          role="group"
          // aria-label = the name screen readers read for this element
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          aria-label={t('product.quantity')}
        >
          <button
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // Math = number helpers (min, max, round, floor...)
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            // disabled = can't be clicked or typed in
            // { } in JSX = run JavaScript here and show its result
            // a || b = OR: a if it is truthy, else b
            disabled={soldOut || quantity <= 1}
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="p-3 hover:bg-slate-50 disabled:opacity-30"
            // aria-label = the name screen readers read for this element
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            aria-label={t('product.decrease')}
          >
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Minus className="size-4" />
          </button>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             aria-live = screen readers announce changes to this text */}
          <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
            {/* { } in JSX = run JavaScript here and show its result */}
            {quantity}
          </span>
          <button
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // Math = number helpers (min, max, round, floor...)
            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
            // disabled = can't be clicked or typed in
            // { } in JSX = run JavaScript here and show its result
            // a || b = OR: a if it is truthy, else b
            disabled={soldOut || quantity >= max}
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="p-3 hover:bg-slate-50 disabled:opacity-30"
            // aria-label = the name screen readers read for this element
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            aria-label={t('product.increase')}
          >
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Plus className="size-4" />
          </button>
        </div>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           onClick = what happens on click/tap
           { } in JSX = run JavaScript here and show its result
           loading="lazy" = load the image only when it gets near the screen
           isPending = the request is running right now
           disabled = can't be clicked or typed in */}
        <Button className="flex-1 py-3" onClick={onClick} loading={addToCart.isPending} disabled={soldOut}>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <ShoppingCart className="size-4" /> {soldOut ? t('product.outOfStock') : t('product.addToCart')}
        </Button>
      </div>
    </div>
  );
}

// Renders category-specific details: author/pages for books, specs for electronics, etc.
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function Attributes({ attributes }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // { author: "X", specs: { ram: "8 GB" } } -> [["author","X"], ["ram","8 GB"]]: one flat list of rows
  // const = a name for a value that is never reassigned
  // Object.entries = [key, value] pairs of an object
  // .flatMap = map, then flatten one level
  // => = an arrow function (a short function)
  // [a, b] = destructuring: take the first and second items of an array
  const flat = Object.entries(attributes).flatMap(([key, value]) =>
    // a ? b : c = ternary: if a then b else c
    // a && b = AND; in JSX: show b only when a is true
    // === = strictly equal (same value AND same type)
    // Object.entries = [key, value] pairs of an object
    value && typeof value === 'object' ? Object.entries(value) : [[key, value]],
  );
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  if (flat.length === 0) return null;

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="rounded-xl border border-slate-200 bg-surface">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">{t('product.details')}</h2>
      {/* <dl> = a list of terms (<dt>) and their values (<dd>)
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <dl className="divide-y divide-slate-100 text-sm">
        {/* { } in JSX = run JavaScript here and show its result
           .map = make a new array by transforming each item (in JSX: one element per item)
           => = an arrow function (a short function)
           [a, b] = destructuring: take the first and second items of an array */}
        {flat.map(([key, value]) => (
          // key = a stable id for list items so React can track them between redraws
          // { } in JSX = run JavaScript here and show its result
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          <div key={key} className="grid grid-cols-3 px-4 py-2.5">
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result */}
            <dt className="capitalize text-slate-500">{key}</dt>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result */}
            <dd className="col-span-2 text-slate-800">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
