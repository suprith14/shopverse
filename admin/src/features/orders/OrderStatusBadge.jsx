// import = bring in code from another file or package
import { statusStyles } from './orderStatus';

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function OrderStatusBadge({ status }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // obj[key] = read the property whose name is stored in key
  const { label, className } = statusStyles[status];
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    // { } in JSX = run JavaScript here and show its result
    // `text ${x}` = a template string: text with values inserted
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
  );
}
