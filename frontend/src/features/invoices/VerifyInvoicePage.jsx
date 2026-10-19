import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { BadgeCheck, RotateCcw, ShieldAlert } from 'lucide-react';
import { PageTitle } from '@/components/layout/PageTitle';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api-client';
import { formatDate, formatPrice } from '@/lib/format';
import { useSiteContent } from '@/content/use-site-content';

// /verify/:token, opened by scanning the QR code on an invoice. PUBLIC: no login, because the
// person checking may not be the customer (an accountant, an employer, a tax officer).
// It shows only what's needed to match the paper copy, never personal details.
export function VerifyInvoicePage() {
  const { t } = useTranslation();
  const { brand } = useSiteContent();
  const { token = '' } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['verify-invoice', token],
    queryFn: async () => (await api.get(`/invoices/verify/${token}`)).data.invoice,
    retry: false, // "not found" won't change by asking again
  });

  const notFound = isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400);

  return (
    <div className="mx-auto max-w-md py-10">
      <PageTitle title={t('invoice.pageTitle')} />
      <div className="rounded-2xl border border-slate-200 bg-surface p-6 text-center shadow-sm">
        {isLoading && (
          <div className="space-y-3" role="status" aria-label={t('invoice.checking')}>
            <Skeleton className="mx-auto size-12 rounded-full" />
            <Skeleton className="mx-auto h-5 w-2/3" />
            <Skeleton className="mx-auto h-4 w-1/2" />
          </div>
        )}

        {data && (
          <>
            {data.status === 'PAID' ? (
              <BadgeCheck className="mx-auto size-12 text-green-600" aria-hidden />
            ) : (
              <RotateCcw className="mx-auto size-12 text-amber-600" aria-hidden />
            )}
            <h1 className="mt-3 text-xl font-bold">
              {data.status === 'PAID' ? t('invoice.genuine', { brand: brand.name }) : t('invoice.genuineRefunded')}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{t('invoice.compare')}</p>
            <dl className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 text-left text-sm">
              <Row label={t('invoice.number')} value={<span className="font-mono">{data.number}</span>} />
              <Row
                label={t('invoice.issued')}
                value={formatDate(data.issuedAt, { day: 'numeric', month: 'long', year: 'numeric' })}
              />
              <Row label={t('invoice.total')} value={formatPrice(data.total)} />
              <Row label={t('invoice.status')} value={data.status === 'PAID' ? t('invoice.paid') : t('invoice.refunded')} />
            </dl>
            <p className="mt-4 text-xs text-slate-400">
              {t('invoice.privacy')}
            </p>
          </>
        )}

        {error && (
          <>
            <ShieldAlert className="mx-auto size-12 text-red-600" aria-hidden />
            <h1 className="mt-3 text-xl font-bold">{notFound ? t('invoice.notFound') : t('invoice.cantCheck')}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {notFound
                ? t('invoice.notFoundText', { brand: brand.name })
                : t('invoice.tryLater')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
