import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Spinner } from '@/components/ui/States';
import { AddressForm } from './AddressForm';
import { AddressLines } from './AddressCard';
import { useAddAddress, useProfile } from './account.api';

// "Deliver to" at checkout: pick a saved address (the default is pre-selected) or add one.
// Only the chosen address id goes to the backend, which copies the address into the order.
export function DeliveryAddressPicker({ value, onChange }) {
  const { data: profile, isLoading } = useProfile();
  const add = useAddAddress();
  const [adding, setAdding] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Pre-select the default address once the profile loads (or if the chosen one was deleted).
  useEffect(() => {
    if (!profile) return;
    if (!value || !profile.addresses.some((a) => a.id === value)) onChange(profile.defaultAddressId);
  }, [profile, value, onChange]);

  if (isLoading || !profile) return <Spinner label="Loading addresses..." />;

  const selected = profile.addresses.find((a) => a.id === value);
  const noAddresses = profile.addresses.length === 0;

  // No address yet, or "add new" clicked: show the form. A new address becomes the choice.
  if (noAddresses || adding) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">{noAddresses ? 'Where should we deliver?' : 'New address'}</p>
        <AddressForm
          defaultName={profile.name}
          defaultPhone={profile.phone}
          submitLabel="Use this address"
          saving={add.isPending}
          error={add.error}
          onSubmit={(input) =>
            add.mutate(input, {
              onSuccess: (p) => {
                // The new address is the one whose id wasn't in the list before.
                const before = new Set(profile.addresses.map((a) => a.id));
                const created = p.addresses.find((a) => !before.has(a.id));
                onChange(created?.id ?? p.defaultAddressId);
                setAdding(false);
              },
            })
          }
          onCancel={noAddresses ? undefined : () => setAdding(false)}
        />
      </div>
    );
  }

  // Collapsed: show the chosen address with a "Change" link (like most stores).
  if (!showAll && selected) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Deliver to</p>
          <button onClick={() => setShowAll(true)} className="text-sm text-brand-600 hover:underline">
            Change
          </button>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <AddressLines address={selected} />
        </div>
      </div>
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-medium">Deliver to</legend>
      {profile.addresses.map((a) => (
        <label
          key={a.id}
          className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${a.id === value ? 'border-brand-500 bg-brand-50/40' : 'border-slate-200'}`}
        >
          <input
            type="radio"
            name="delivery-address"
            checked={a.id === value}
            onChange={() => {
              onChange(a.id);
              setShowAll(false);
            }}
            className="mt-1"
          />
          <div>
            {(a.label || a.isDefault) && (
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {a.label}
                {a.label && a.isDefault && ' · '}
                {a.isDefault && 'Default'}
              </p>
            )}
            <AddressLines address={a} />
          </div>
        </label>
      ))}
      {profile.addresses.length < 10 && (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 text-sm text-brand-600 hover:underline"
        >
          <Plus className="size-4" /> Add a new address
        </button>
      )}
    </fieldset>
  );
}
