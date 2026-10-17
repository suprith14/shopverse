import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Camera, KeyRound, MapPin, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
import type { Address, Profile } from '@/types/api';
import { AddressForm } from './AddressForm';
import { AddressLines } from './AddressCard';
import { PageTitle } from '@/components/layout/PageTitle';
import { notify } from '@/lib/notify';
import { useChangePassword } from '@/features/auth/auth.api';
import {
  useAddAddress,
  useDeleteAddress,
  useProfile,
  useRemoveAvatar,
  useSetDefaultAddress,
  useUpdateAddress,
  useUpdateProfile,
  useUploadAvatar,
} from './account.api';

export function AccountPage() {
  const { data: profile, isLoading, isError, error } = useProfile();
  if (isLoading) return <ListSkeleton rows={3} />;
  if (isError || !profile) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle title="My account" />
      <h1 className="text-2xl font-bold">My account</h1>
      <PhotoSection profile={profile} />
      {/* key: re-create the form with fresh values after a save */}
      <DetailsSection key={`${profile.name}|${profile.phone}|${profile.dateOfBirth}`} profile={profile} />
      <AddressBook profile={profile} />
      <PasswordSection />
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof UserIcon; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold"><Icon className="size-4 text-slate-500" /> {title}</h2>
      {children}
    </section>
  );
}

// ------------------------------------------------------------------ Photo

const MAX_PHOTO_MB = 5;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function PhotoSection({ profile }: { profile: Profile }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const [localError, setLocalError] = useState<string | null>(null);

  // Quick checks in the browser, so a 40 MB file fails instantly instead of after a long upload.
  // (Cloudinary enforces the formats too: the browser check is only for convenience.)
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;
    setLocalError(null);
    if (!PHOTO_TYPES.includes(file.type)) return setLocalError('Please choose a JPG, PNG or WebP image.');
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return setLocalError(`Please choose an image under ${MAX_PHOTO_MB} MB.`);
    upload.mutate(file, { onSuccess: () => notify.success('Profile photo updated') });
  };

  return (
    <Section title="Profile photo" icon={Camera}>
      <div className="flex items-center gap-5">
        <div className="size-20 shrink-0 overflow-hidden rounded-full bg-slate-100">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Your profile photo" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-2xl font-semibold text-slate-400">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input ref={fileInput} type="file" accept={PHOTO_TYPES.join(',')} onChange={onPick} className="hidden" />
            <Button variant="secondary" loading={upload.isPending} onClick={() => fileInput.current?.click()}>
              {profile.avatarUrl ? 'Change photo' : 'Upload photo'}
            </Button>
            {profile.avatarUrl && (
              <Button variant="ghost" loading={remove.isPending} onClick={() => remove.mutate(undefined, { onSuccess: () => notify.success('Profile photo removed') })}>Remove</Button>
            )}
          </div>
          <p className="text-xs text-slate-500">JPG, PNG or WebP, up to {MAX_PHOTO_MB} MB. It's cropped to a square around your face.</p>
          {localError && <p className="text-sm text-red-600">{localError}</p>}
          {(upload.isError || remove.isError) && <ErrorState error={upload.error ?? remove.error} />}
        </div>
      </div>
    </Section>
  );
}

// ------------------------------------------------------------------ Details

function DetailsSection({ profile }: { profile: Profile }) {
  const update = useUpdateProfile();
  const [form, setForm] = useState({ name: profile.name, phone: profile.phone ?? '', dateOfBirth: profile.dateOfBirth ?? '' });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // Empty fields are sent as null = "remove it".
    update.mutate(
      { name: form.name, phone: form.phone.trim() || null, dateOfBirth: form.dateOfBirth || null },
      { onSuccess: () => notify.success('Details saved') },
    );
  };

  return (
    <Section title="Your details" icon={UserIcon}>
      <form onSubmit={submit} className="space-y-3">
        {update.isError && <ErrorState error={update.error} />}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Name" name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
          {/* Email is shown but not editable: changing the login email needs re-verification. */}
          <Input label="Email" name="email" value={profile.email} disabled className="bg-slate-50 text-slate-500" />
          <Input label="Phone (optional)" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210" autoComplete="tel" />
          <Input label="Date of birth (optional)" name="dateOfBirth" type="date" value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} autoComplete="bday" />
        </div>
        <Button type="submit" loading={update.isPending}>Save details</Button>
      </form>
    </Section>
  );
}

// ------------------------------------------------------------------ Address book

// ------------------------------------------------------------------ Password

function PasswordSection() {
  const change = useChangePassword();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow] = useState(false);
  // Checked in the browser for instant feedback; the server checks the real rules.
  const mismatch = form.confirm.length > 0 && form.confirm !== form.newPassword;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (mismatch) return;
    change.mutate(
      { currentPassword: form.currentPassword, newPassword: form.newPassword },
      {
        onSuccess: () => {
          setForm({ currentPassword: '', newPassword: '', confirm: '' });
          notify.success('Password changed. You were signed out on your other devices.');
        },
      },
    );
  };

  return (
    <Section title="Password" icon={KeyRound}>
      <form onSubmit={submit} className="space-y-3">
        {change.isError && <ErrorState error={change.error} />}
        <Input label="Current password" name="currentPassword" type={show ? 'text' : 'password'} required
          autoComplete="current-password" value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          {/* autoComplete="new-password" lets the browser's password manager suggest a strong one */}
          <Input label="New password" name="newPassword" type={show ? 'text' : 'password'} required minLength={8}
            autoComplete="new-password" value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          <Input label="Confirm new password" name="confirm" type={show ? 'text' : 'password'} required
            autoComplete="new-password" value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </div>
        {mismatch && <p className="text-sm text-red-600">The two new passwords don't match.</p>}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
        </label>
        <p className="text-xs text-slate-500">At least 8 characters. Changing it signs you out on all your other devices.</p>
        <Button type="submit" loading={change.isPending} disabled={mismatch}>Change password</Button>
      </form>
    </Section>
  );
}

function AddressBook({ profile }: { profile: Profile }) {
  const [adding, setAdding] = useState(false);
  const add = useAddAddress();

  return (
    <Section title={`Delivery addresses (${profile.addresses.length}/10)`} icon={MapPin}>
      {profile.addresses.length === 0 && !adding && (
        <p className="mb-3 text-sm text-slate-500">No saved addresses yet. Add one to check out faster.</p>
      )}
      <ul className="space-y-3">
        {profile.addresses.map((a) => <AddressRow key={a.id} address={a} />)}
      </ul>

      <div className="mt-4">
        {adding ? (
          <div className="rounded-lg border border-slate-200 p-4">
            <AddressForm defaultName={profile.name} defaultPhone={profile.phone} submitLabel="Save address"
              saving={add.isPending} error={add.error}
              onSubmit={(input) => add.mutate(input, { onSuccess: () => { setAdding(false); notify.success('Address saved'); } })}
              onCancel={() => setAdding(false)} />
          </div>
        ) : (
          profile.addresses.length < 10 && (
            <Button variant="secondary" onClick={() => setAdding(true)}><Plus className="size-4" /> Add address</Button>
          )
        )}
      </div>
    </Section>
  );
}

function AddressRow({ address }: { address: Address }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateAddress();
  const setDefault = useSetDefaultAddress();
  const remove = useDeleteAddress();

  if (editing) {
    return (
      <li className="rounded-lg border border-slate-200 p-4">
        <AddressForm address={address} submitLabel="Save changes" saving={update.isPending} error={update.error}
          onSubmit={(input) => update.mutate({ id: address.id, ...input }, { onSuccess: () => { setEditing(false); notify.success('Address updated'); } })}
          onCancel={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className={`flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4 ${address.isDefault ? 'border-brand-500 bg-brand-50/40' : 'border-slate-200'}`}>
      <div>
        <div className="mb-1 flex items-center gap-2">
          {address.label && <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{address.label}</span>}
          {address.isDefault && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">Default</span>}
        </div>
        <AddressLines address={address} />
        {(setDefault.isError || remove.isError) && <div className="mt-2"><ErrorState error={setDefault.error ?? remove.error} /></div>}
      </div>
      <div className="flex flex-wrap gap-1">
        {!address.isDefault && (
          <Button variant="ghost" className="px-2 py-1 text-xs" loading={setDefault.isPending} onClick={() => setDefault.mutate(address.id)}>Make default</Button>
        )}
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setEditing(true)}>Edit</Button>
        <Button variant="ghost" className="px-2 py-1 text-xs text-red-600 hover:bg-red-50" loading={remove.isPending}
          onClick={() => { if (confirm('Delete this address? Past orders keep their own copy.')) remove.mutate(address.id, { onSuccess: () => notify.success('Address deleted') }); }}>
          <Trash2 className="size-3.5" /> Delete
        </Button>
      </div>
    </li>
  );
}
