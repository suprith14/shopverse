import { useSiteContent } from '@/content/use-site-content';

// Sets the browser tab title. React 19 moves a <title> rendered anywhere into the page
// <head> by itself, so no extra library (like react-helmet) is needed.
// "Air Stride Runner" -> "Air Stride Runner · ShopVerse"
export function PageTitle({ title }) {
  const { brand } = useSiteContent();
  return <title>{title ? `${title} · ${brand.name}` : brand.defaultTitle}</title>;
}
