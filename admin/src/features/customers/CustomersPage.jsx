import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Ban, CheckCircle2, Lock, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States';
import { formatDateTime, formatPrice, formatTimeAgo, getErrorMessage } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { useGetCustomersQuery, useUnblockCustomerMutation } from './customersApi';
import { BlockDialog, DeleteDialog } from './CustomerDialogs';

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'online', label: 'Online now' },
  { value: 'blocked', label: 'Blocked' },
];

export function CustomersPage() {
  const [params, setParams] = useSearchParams();
  const filters = {
    status: params.get('status') ?? 'all',
    q: params.get('q') ?? undefined,
    page: Number(params.get('page') ?? 1),
  };

  const setFilter = (patch) => {
    const next = { ...filters, page: 1, ...patch };
    const search = new URLSearchParams();
    if (next.status !== 'all') search.set('status', next.status);
    if (next.q) search.set('q', next.q);
    if (next.page > 1) search.set('page', String(next.page));
    setParams(search);
  };

  const [text, setText] = useState(filters.q ?? '');
  const debounced = useDebounce(text);
  useEffect(() => {
    if ((debounced || undefined) !== filters.q) setFilter({ q: debounced || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced text
  }, [debounced]);

  // "Online" goes stale on its own, so refresh the list every minute while the page is open.
  const { data, isLoading, isFetching, error } = useGetCustomersQuery(filters, { pollingInterval: 60_000 });
  const [unblock] = useUnblockCustomerMutation();
  const [blocking, setBlocking] = useState(null); // the customer whose dialog is open
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="mt-1 text-sm text-slate-500">
          &quot;Online&quot; means active in the last 15 minutes (updated every few minutes).
        </p>
      </div>

      <div role="tablist" className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={filters.status === t.value}
            onClick={() => setFilter({ status: t.value })}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${filters.status === t.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}
          >
            {t.label}
            {filters.status === t.value && data && <span className="ml-1.5 text-xs text-slate-300">{data.total}</span>}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Name or email"
          aria-label="Search customers"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500"
        />
      </div>

      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <CheckCircle2 className="size-4 shrink-0" /> {notice}
        </div>
      )}
      {isLoading && <Spinner />}
      {error && <ErrorState message={getErrorMessage(error)} />}
      {data && data.items.length === 0 && <EmptyState title="No customers found" hint="Try another tab or search." />}

      {data && data.items.length > 0 && (
        <div
          className={`overflow-x-auto rounded-xl border border-slate-200 bg-white ${isFetching ? 'opacity-60' : ''}`}
        >
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Spent</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar customer={c} />
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <CustomerStatus customer={c} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(c.createdAt)}</td>
                  <td className="px-4 py-3 text-right">{c.orderCount}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(c.totalSpent)}</td>
                  <td className="px-4 py-3">
                    {c.protected ? (
                      // A shared demo account (PROTECTED_ACCOUNTS on the server): its login is public,
                      // so it can't be blocked or deleted. The server refuses anyway; this explains why.
                      <div className="flex justify-end">
                        <span
                          className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                          title="Shared demo account: it can't be blocked or deleted, so every visitor can log in with it."
                        >
                          <Lock className="size-3" aria-hidden /> Demo account
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        {c.blockedAt ? (
                          <Button
                            variant="ghost"
                            onClick={async () => {
                              await unblock(c.id).unwrap();
                              setNotice(`${c.name} was unblocked and can log in again.`);
                            }}
                          >
                            Unblock
                          </Button>
                        ) : (
                          <Button variant="ghost" onClick={() => setBlocking(c)} aria-label={`Block ${c.name}`}>
                            <Ban className="size-4" /> Block
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => setDeleting(c)}
                          aria-label={`Delete ${c.name}`}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" disabled={data.page <= 1} onClick={() => setFilter({ page: data.page - 1 })}>
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={data.page >= data.totalPages}
            onClick={() => setFilter({ page: data.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}

      {blocking && (
        <BlockDialog
          customer={blocking}
          onClose={() => setBlocking(null)}
          onDone={() => {
            setNotice(`${blocking.name} was blocked and will be logged out within 15 minutes.`);
            setBlocking(null);
          }}
        />
      )}
      {deleting && (
        <DeleteDialog
          customer={deleting}
          onClose={() => setDeleting(null)}
          onDone={(result) => {
            setNotice(
              result.mode === 'deleted'
                ? `${deleting.name}'s account was deleted.`
                : `${deleting.name}'s personal data was removed. Their ${result.orderCount} order(s) are kept for the accounts, as "Deleted customer".`,
            );
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}

function Avatar({ customer }) {
  if (customer.avatarUrl) return <img src={customer.avatarUrl} alt="" className="size-9 rounded-full object-cover" />;
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
      {customer.name.charAt(0).toUpperCase()}
    </span>
  );
}

// Colour + text (+ dot), never colour alone.
function CustomerStatus({ customer }) {
  if (customer.blockedAt) {
    return (
      <span title={customer.blockedReason ?? undefined}>
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Blocked</span>
        {customer.blockedReason && (
          <span className="mt-0.5 block text-xs text-slate-500">{customer.blockedReason}</span>
        )}
      </span>
    );
  }
  if (customer.online) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
        <span className="size-2 rounded-full bg-green-500" aria-hidden /> Online
      </span>
    );
  }
  return (
    <span className="text-xs text-slate-500">
      {customer.lastSeenAt ? `Last seen ${formatTimeAgo(customer.lastSeenAt)}` : 'Never active'}
    </span>
  );
}
