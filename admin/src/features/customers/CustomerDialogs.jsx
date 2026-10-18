import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/States';
import { getErrorMessage } from '@/lib/format';
import { useBlockCustomerMutation, useDeleteCustomerMutation } from './customersApi';

// A modal built on the browser's own <dialog>: it traps focus, closes on Escape and dims the
// page by itself, so no dialog library is needed.
function Dialog({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-full max-w-md rounded-xl p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="dialog-title"
    >
      <div className="space-y-4 p-6">
        <h2 id="dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}

export function BlockDialog({ customer, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [block, { isLoading, error }] = useBlockCustomerMutation();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await block({ id: customer.id, reason: reason.trim() || undefined }).unwrap();
      onDone();
    } catch {
      // shown below
    }
  };

  return (
    <Dialog title={`Block ${customer.name}?`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>They can&apos;t log in, place orders or reset their password.</li>
          <li>They&apos;re logged out everywhere within 15 minutes.</li>
          <li>Their orders and data stay. You can unblock them at any time.</li>
        </ul>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Reason (only admins see this)</span>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={200}
            placeholder="e.g. repeated chargebacks"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
        {error && <ErrorState message={getErrorMessage(error)} />}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={isLoading}>
            Block customer
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// Deleting can't be undone, so the admin types the customer's email to confirm
// (the same idea as GitHub's "type the repository name to delete it").
export function DeleteDialog({ customer, onClose, onDone }) {
  const [typed, setTyped] = useState('');
  const [remove, { isLoading, error }] = useDeleteCustomerMutation();
  const confirmed = typed.trim().toLowerCase() === customer.email.toLowerCase();

  const submit = async (e) => {
    e.preventDefault();
    if (!confirmed) return;
    try {
      onDone(await remove(customer.id).unwrap());
    } catch {
      // shown below
    }
  };

  return (
    <Dialog title={`Delete ${customer.name}?`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-600">
          {customer.orderCount === 0
            ? 'This customer has no orders, so the account is deleted completely.'
            : `This customer has ${customer.orderCount} order(s). Those must be kept for the accounts, so their name, email, phone, addresses, cart and wishlist are erased and the orders show "Deleted customer".`}{' '}
          <strong>This cannot be undone.</strong>
        </p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Type <span className="font-mono">{customer.email}</span> to confirm
          </span>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
        </label>
        {error && <ErrorState message={getErrorMessage(error)} />}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={isLoading} disabled={!confirmed}>
            Delete customer
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
