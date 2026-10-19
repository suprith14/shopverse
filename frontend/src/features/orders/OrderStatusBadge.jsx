// The coloured pill showing an order's state: Awaiting payment, Paid, Shipped, Delivered...
// Colour + text together (never colour alone), so it's readable without seeing colour.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// Colours per status. They have dark-mode versions too (index.css).
// Labels: orders.status.* (i18n)
// const = a name for a value that is never reassigned
const styles = {
  PENDING: 'bg-amber-100 text-amber-800',
  PAID: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-slate-200 text-slate-800',
  CANCELLED: 'bg-slate-100 text-slate-500',
  REFUNDED: 'bg-purple-100 text-purple-800',
};

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function OrderStatusBadge({ status }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    // { } in JSX = run JavaScript here and show its result
    // `text ${x}` = a template string: text with values inserted
    // obj[key] = read the property whose name is stored in key
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
         `text ${x}` = a template string: text with values inserted */}
      {t(`orders.status.${status}`)}
    </span>
  );
}
