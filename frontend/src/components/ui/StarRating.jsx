// Five stars for a product's rating, e.g. 4.3 -> four filled stars. Used on product cards,
// the product page and reviews. `count` (optional) shows the number of reviews next to the stars.

import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

export function StarRating({ value, count, size = 'sm' }) {
  const { t } = useTranslation();
  // small stars in lists, bigger ones on the product page
  const px = size === 'sm' ? 'size-3.5' : 'size-5';
  return (
    // Screen readers hear "Rated 4.3 out of 5" instead of five separate icons
    <div className="flex items-center gap-1" aria-label={t('product.rated', { value: value.toFixed(1) })}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          // star i is filled when the rounded rating reaches it
          className={`${px} ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
      {count !== undefined && <span className="ml-1 text-xs text-slate-500">({count})</span>}
    </div>
  );
}
