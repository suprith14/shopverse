import { useState, type FormEvent } from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice, getErrorMessage } from '@/lib/format';
import { useCouponStore } from './coupon.store';
import type { useCouponPreview } from './coupons.api';

// The "Have a coupon?" box in the cart's order summary.
// The preview itself is loaded by the cart page (it also needs the numbers for the total).
export function CouponBox({ preview }: { preview: ReturnType<typeof useCouponPreview> }) {
  const { code, apply, remove } = useCouponStore();
  const [input, setInput] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) apply(input);
  };

  // No coupon applied yet: show the input.
  if (!code) {
    return (
      <form onSubmit={onSubmit} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Coupon code" aria-label="Coupon code"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-brand-500" />
        <Button type="submit" variant="secondary">Apply</Button>
      </form>
    );
  }

  // Coupon applied: show it as a chip, with either the saving or why it doesn't work.
  return (
    <div className={`rounded-lg border p-3 text-sm ${preview.isError ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <Tag className="size-4" /> {code}
        </span>
        <button onClick={() => { remove(); setInput(''); }} aria-label="Remove coupon" className="rounded p-0.5 hover:bg-black/5">
          <X className="size-4" />
        </button>
      </div>
      {preview.isError && <p className="mt-1 text-red-700">{getErrorMessage(preview.error)}</p>}
      {preview.data?.code === code && !preview.isError && (
        <p className="mt-1 text-green-700">{preview.data.description}: you save {formatPrice(preview.data.discount)}</p>
      )}
    </div>
  );
}
