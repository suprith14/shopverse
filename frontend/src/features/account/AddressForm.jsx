import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import { COUNTRIES, countryName } from './countries';

// Add / edit an address. Used on the "My account" page and at checkout.
// Validation messages come from the backend (e.g. "Postcode should look like 560001").
export function AddressForm({ address, defaultName, defaultPhone, saving, error, submitLabel, onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    label: address?.label ?? '',
    fullName: address?.fullName ?? defaultName ?? '',
    phone: address?.phone ?? defaultPhone ?? '',
    line1: address?.line1 ?? '',
    line2: address?.line2 ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    postalCode: address?.postalCode ?? '',
    country: address?.country ?? 'IN',
  });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, label: form.label.trim() || null, line2: form.line2.trim() || null });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {!!error && <ErrorState error={error} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label={t('address.fullName')}
          name="fullName"
          required
          value={form.fullName}
          onChange={(e) => set({ fullName: e.target.value })}
          autoComplete="name"
        />
        <Input
          label={t('address.phone')}
          name="phone"
          required
          value={form.phone}
          onChange={(e) => set({ phone: e.target.value })}
          placeholder="+91 98765 43210"
          autoComplete="tel"
        />
      </div>
      <Input
        label={t('address.line1')}
        name="line1"
        required
        value={form.line1}
        onChange={(e) => set({ line1: e.target.value })}
        placeholder={t('address.line1Placeholder')}
        autoComplete="address-line1"
      />
      <Input
        label={t('address.line2')}
        name="line2"
        value={form.line2}
        onChange={(e) => set({ line2: e.target.value })}
        placeholder={t('address.line2Placeholder')}
        autoComplete="address-line2"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          label={t('address.city')}
          name="city"
          required
          value={form.city}
          onChange={(e) => set({ city: e.target.value })}
          autoComplete="address-level2"
        />
        <Input
          label={t('address.state')}
          name="state"
          required
          value={form.state}
          onChange={(e) => set({ state: e.target.value })}
          autoComplete="address-level1"
        />
        <Input
          label={t('address.postalCode')}
          name="postalCode"
          required
          value={form.postalCode}
          onChange={(e) => set({ postalCode: e.target.value })}
          autoComplete="postal-code"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('address.country')}</span>
          <select
            value={form.country}
            onChange={(e) => set({ country: e.target.value })}
            autoComplete="country"
            className="w-full rounded-lg border border-slate-300 bg-surface px-3 py-2.5 text-sm"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {countryName(c.code)}
              </option>
            ))}
          </select>
        </label>
        <Input
          label={t('address.label')}
          name="label"
          value={form.label}
          onChange={(e) => set({ label: e.target.value })}
          placeholder={t('address.labelPlaceholder')}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}
