import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/format';
import { Link, useLocation } from 'react-router';
import { BadgeCheck, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState, Spinner } from '@/components/ui/States';
import { StarRating } from '@/components/ui/StarRating';
import { useAuthStore } from '@/features/auth/auth.store';
import { useMyReview, useReviews } from './reviews.api';
import { ReviewForm } from './ReviewForm';

// The "Customer reviews" section at the bottom of a product page.
export function ProductReviews({ productId }) {
  const { t } = useTranslation();
  // which page of reviews (newest first)
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, isFetching } = useReviews(productId, page);

  return (
    <section className="space-y-6 border-t border-slate-200 pt-10">
      <h2 className="text-xl font-bold">{t('reviews.title')}</h2>

      {isLoading && <Spinner />}
      {isError && <ErrorState error={error} />}

      {data && (
        <div className="grid gap-10 md:grid-cols-[280px_1fr]">
          {/* Summary: average + how many of each star */}
          <div className="space-y-4">
            <div>
              <p className="text-4xl font-bold">{data.ratingCount ? data.ratingAvg.toFixed(1) : '–'}</p>
              <StarRating value={data.ratingAvg} size="md" />
              <p className="mt-1 text-sm text-slate-500">
                {t('reviews.count', { count: data.ratingCount })}
              </p>
            </div>
            <ul className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = data.distribution[star];
                // share of reviews with this many stars, for the bar
                const percent = data.ratingCount ? Math.round((count / data.ratingCount) * 100) : 0;
                return (
                  <li key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-14 text-slate-600">{t('reviews.stars', { count: star })}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-9 text-right text-slate-500">{percent}%</span>
                  </li>
                );
              })}
            </ul>
            <MyReviewBox productId={productId} />
          </div>

          {/* The reviews themselves */}
          <div className={isFetching ? 'opacity-60' : ''}>
            {data.items.length === 0 ? (
              <p className="text-slate-500">{t('reviews.none')}</p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {data.items.map((review) => (
                  <li key={review.id} className="space-y-1.5 py-5 first:pt-0">
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} />
                      <span className="font-semibold">{review.title}</span>
                    </div>
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      {review.author} · {formatDate(review.createdAt)}
                      {review.verifiedPurchase && (
                        <span className="flex items-center gap-0.5 font-medium text-green-700">
                          <BadgeCheck className="size-3.5" /> {t('reviews.verified')}
                        </span>
                      )}
                    </p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{review.body}</p>
                  </li>
                ))}
              </ul>
            )}

            {data.totalPages > 1 && (
              <div className="mt-4 flex items-center gap-3">
                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  {t('reviews.newer')}
                </Button>
                <span className="text-sm text-slate-500">
                  {t('common.pageOf', { page, total: data.totalPages })}
                </span>
                <Button variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                  {t('reviews.older')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// What the current visitor can do: log in / write / edit, or why they can't review.
function MyReviewBox({ productId }) {
  const { t } = useTranslation();
  const status = useAuthStore((s) => s.status);
  const location = useLocation();
  const { data: mine } = useMyReview(productId);
  const [editing, setEditing] = useState(false);

  // Guests: "Log in to review this product"
  if (status === 'guest') {
    return (
      <p className="text-sm text-slate-600">
        {/* <0> in the text becomes the link, so each language can put it where its grammar needs it */}
        <Trans
          i18nKey="reviews.logInToReview"
          components={[
            <Link
              key="login"
              to="/login"
              state={{ from: location.pathname }}
              className="font-medium text-brand-600 dark:text-brand-300 hover:underline"
            />,
          ]}
        />
      </p>
    );
  }
  if (!mine) return null;

  // The form takes over the summary column while open.
  if (editing) return <ReviewForm productId={productId} existing={mine.review} onDone={() => setEditing(false)} />;

  if (mine.review) {
    return (
      <Button variant="secondary" className="w-full" onClick={() => setEditing(true)}>
        <Pencil className="size-4" /> {t('reviews.edit')}
      </Button>
    );
  }
  // Bought it and no review yet: "Write a review"
  if (mine.canReview) {
    return (
      <Button className="w-full" onClick={() => setEditing(true)}>
        {t('reviews.write')}
      </Button>
    );
  }
  // Otherwise the server says why not (e.g. "Only customers who bought this can review it")
  return <p className="text-sm text-slate-500">{mine.reason}</p>;
}
