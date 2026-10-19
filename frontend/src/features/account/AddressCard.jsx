// import = bring in code from another file or package
import { countryName } from './countries';

// How an address is printed everywhere (account page, checkout, order page).
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function AddressLines({ address }) {
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="text-sm leading-relaxed text-slate-700">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <p className="font-medium text-slate-900">{address.fullName}</p>
      {/* { } in JSX = run JavaScript here and show its result */}
      <p>{address.line1}</p>
      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true */}
      {address.line2 && <p>{address.line2}</p>}
      <p>
        {/* { } in JSX = run JavaScript here and show its result */}
        {address.city}, {address.state} {address.postalCode}
      </p>
      {/* "IN" -> "India" / "ಭಾರತ" in the reader's language (countries.js) */}
      {/* { } in JSX = run JavaScript here and show its result */}
      <p>{countryName(address.country)}</p>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <p className="text-slate-500">{address.phone}</p>
    </div>
  );
}
