import { site } from '@/content/site';

// Sets the browser tab title. React 19 moves a <title> rendered anywhere into the page
// <head> by itself, so no extra library (like react-helmet) is needed.
// "Air Stride Runner" -> "Air Stride Runner · ShopVerse"
export function PageTitle({ title }) {
  return <title>{title ? `${title} · ${site.name}` : site.defaultTitle}</title>;
}
