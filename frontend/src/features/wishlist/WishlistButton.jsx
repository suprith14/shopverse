// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useLocation = the current URL (pathname, search) and any state passed to it
// useNavigate = gives navigate(url) to change page from code
import { useLocation, useNavigate } from 'react-router';
// import = bring in code from another file or package
import { Heart } from 'lucide-react';
// import = bring in code from another file or package
import { useAuthStore } from '@/features/auth/auth.store';
// import = bring in code from another file or package
import { useToggleWishlist, useWishlistIds } from './wishlist.api';
// import = bring in code from another file or package
import { notify } from '@/lib/notify';

// The heart button. Used on product cards and on the product page.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
export function WishlistButton({ productId, className = '' }) {
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
  // const = a name for a value that is never reassigned
  const savedIds = useWishlistIds();
  // const = a name for a value that is never reassigned
  const toggle = useToggleWishlist();

  // Optimistic UI, the simple way: while the request is running, show what the user
  // asked for. When it finishes, the real data from the server takes over.
  // If the request fails, it falls back to the real (unchanged) data on its own.
  // While the request runs, show the NEW state already (feels instant); otherwise what the server says
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // isPending = the request is running right now
  const saved = toggle.isPending ? toggle.variables.save : savedIds.has(productId);

  // const = a name for a value that is never reassigned
  // onClick = what happens on click/tap
  // => = an arrow function (a short function)
  const onClick = (e) => {
    // On a product card the heart sits inside a link. Don't open the product page.
    // the button sits inside a product card link: don't open the product
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // and don't let the click reach the card
    // stopPropagation = stop the event reaching parent elements
    e.stopPropagation();
    // if (...) = run the next part only when the condition is true
    // !== = not strictly equal
    if (status !== 'authenticated') {
      navigate('/login', { state: { from: location.pathname + location.search } });
      // return = give this value back and stop the function here
      return;
    }
    // const = a name for a value that is never reassigned
    // ! = NOT: flips true/false
    const save = !saved;
    // mutate = run the mutation (send the change)
    toggle.mutate(
      { productId, save },
      {
        // onSuccess = runs after the request succeeded
        // => = an arrow function (a short function)
        onSuccess: () =>
          // a ? b : c = ternary: if a then b else c
          save
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            // onClick = what happens on click/tap
            // => = an arrow function (a short function)
            ? notify.success(t('wishlist.saved'), { label: t('common.view'), onClick: () => navigate('/wishlist') })
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            : notify.success(t('wishlist.removed')),
        // onError = runs if the request failed
        onError: notify.error,
      },
    );
  };

  // return = give this value back and stop the function here
  return (
    <button
      // onClick = what happens on click/tap
      // { } in JSX = run JavaScript here and show its result
      onClick={onClick}
      // screen readers announce it as a toggle: pressed = saved
      // aria-pressed = a toggle button's on/off state
      // { } in JSX = run JavaScript here and show its result
      aria-pressed={saved}
      // aria-label = the name screen readers read for this element
      // { } in JSX = run JavaScript here and show its result
      // a ? b : c = ternary: if a then b else c
      // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
      aria-label={saved ? t('wishlist.remove') : t('wishlist.save')}
      // { } in JSX = run JavaScript here and show its result
      // a ? b : c = ternary: if a then b else c
      // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
      title={saved ? t('wishlist.remove') : t('wishlist.save')}
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      // { } in JSX = run JavaScript here and show its result
      // `text ${x}` = a template string: text with values inserted
      className={`flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 ${className}`}
    >
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         `text ${x}` = a template string: text with values inserted
         a ? b : c = ternary: if a then b else c */}
      <Heart className={`size-5 ${saved ? 'fill-red-500 text-red-500' : 'text-night/70'}`} />
    </button>
  );
}
