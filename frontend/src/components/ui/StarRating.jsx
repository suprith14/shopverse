import { Star } from 'lucide-react';

export function StarRating({ value, count, size = 'sm' }) {
  const px = size === 'sm' ? 'size-3.5' : 'size-5';
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${px} ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
      {count !== undefined && <span className="ml-1 text-xs text-slate-500">({count})</span>}
    </div>
  );
}
