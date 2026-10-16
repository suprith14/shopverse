import { useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import type { Review } from '@/types/api';
import { useDeleteReview, useSaveReview } from './reviews.api';
import { notify } from '@/lib/notify';

const labels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

// Write a new review, or edit / delete your existing one.
export function ReviewForm({ productId, existing, onDone }: { productId: string; existing: Review | null; onDone: () => void }) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const save = useSaveReview(productId);
  const remove = useDeleteReview(productId);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate({ rating, title, body }, { onSuccess: () => { onDone(); notify.success(existing ? 'Review updated' : 'Thanks! Your review is posted'); } });
  };

  const shown = hover || rating;

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold">{existing ? 'Edit your review' : 'Write a review'}</h3>

      {/* Star picker: hover previews, click sets. Buttons so it works with the keyboard too. */}
      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Your rating</span>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-pressed={rating === n}>
              <Star className={`size-7 transition ${n <= shown ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
            </button>
          ))}
          <span className="ml-2 text-sm text-slate-500">{labels[shown]}</span>
        </div>
      </div>

      <Input label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100}
        placeholder="Sum it up in a few words" required />

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Review</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={2000} required
          placeholder="What did you like or dislike? How did you use it?"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
      </label>

      {/* The backend's validation messages, e.g. "Review must be at least 10 characters" */}
      {(save.isError || remove.isError) && <ErrorState error={save.error ?? remove.error} />}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" loading={save.isPending} disabled={rating === 0}>
          {existing ? 'Save changes' : 'Post review'}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        {existing && (
          <Button type="button" variant="ghost" className="ml-auto text-red-600 hover:bg-red-50" loading={remove.isPending}
            onClick={() => { if (confirm('Delete your review?')) remove.mutate(undefined, { onSuccess: () => { onDone(); notify.success('Review deleted'); } }); }}>
            Delete review
          </Button>
        )}
      </div>
    </form>
  );
}
