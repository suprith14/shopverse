// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
import { Link } from 'react-router';

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function NotFound() {
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="py-24 text-center">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <h1 className="text-4xl font-bold">404</h1>
      {/* Link = a link to another page of this app (no full page reload)
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <Link to="/" className="mt-4 inline-block text-brand-600 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
