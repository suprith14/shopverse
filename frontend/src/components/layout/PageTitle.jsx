// import = bring in code from another file or package
import { useSiteContent } from '@/content/use-site-content';

// Sets the browser tab title. React 19 moves a <title> rendered anywhere into the page
// <head> by itself, so no extra library (like react-helmet) is needed.
// "Air Stride Runner" -> "Air Stride Runner · ShopVerse"
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function PageTitle({ title }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { brand } = useSiteContent();
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  // a ? b : c = ternary: if a then b else c
  // `text ${x}` = a template string: text with values inserted
  return <title>{title ? `${title} · ${brand.name}` : brand.defaultTitle}</title>;
}
