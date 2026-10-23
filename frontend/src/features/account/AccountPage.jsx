// /account ("My account"): profile photo, details, delivery addresses, password, project guide.
// Each card is its own small component below (PhotoSection, DetailsSection, AddressBook,
// PasswordSection, GuideSection) with its own save button, loading state and errors, so a
// problem in one never blocks the others. All data: useProfile() -> GET /api/profile.

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { BookA, BookOpen, Camera, ClipboardList, ExternalLink, GraduationCap, KeyRound, Lock, MapPin, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { PhotoPicker } from '@/components/ui/PhotoPicker';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
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

// The page: loads the profile once and hands it to each card.
export function AccountPage() {
  const { t } = useTranslation();
  const { data: profile, isLoading, isError, error } = useProfile();
  if (isLoading) return <ListSkeleton rows={3} />;
  if (isError || !profile) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle title={t('nav.myAccount')} />
      <h1 className="text-2xl font-bold">{t('nav.myAccount')}</h1>
      <PhotoSection profile={profile} />
      {/* key: re-create the form with fresh values after a save */}
      <DetailsSection key={`${profile.name}|${profile.phone}|${profile.dateOfBirth}`} profile={profile} />
      <AddressBook profile={profile} />
      <PasswordSection />
      <GuideSection />
      <TrainingSection />
    </div>
  );
}

// Link to the password-protected project guide (/account/guide)
function GuideSection() {
  const { t } = useTranslation();
  return (
    <Section title={t('guide.title')} icon={BookOpen}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-sm text-slate-600">{t('guide.teaser')}</p>
        <Link
          to="/account/guide"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-surface px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
        >
          <Lock className="size-4" /> {t('guide.open')}
        </Link>
      </div>
    </Section>
  );
}

// Opens the training portal in a NEW TAB (target="_blank"), so the account page stays where it
// was. rel="noopener" stops the new tab from controlling this one through window.opener.
function TrainingSection() {
  const { t } = useTranslation();
  return (
    <Section title={t('training.title')} icon={GraduationCap}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-sm text-slate-600">{t('training.teaser')}</p>
        <a
          href="/training"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 active:bg-brand-800"
        >
          <ExternalLink className="size-4" aria-hidden /> {t('training.open')}
          <span className="sr-only">{t('training.newTab')}</span>
        </a>
      </div>
      {/* The two source documents the training is based on */}
      <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-3">
        <DocButton href="/training/spec" icon={ClipboardList} title={t('training.spec')} hint={t('training.specHint')} />
        <DocButton href="/training/guide" icon={BookOpen} title={t('training.guide')} hint={t('training.guideHint')} />
        <DocButton href="/training/glossary" icon={BookA} title={t('training.glossary')} hint={t('training.glossaryHint')} />
      </div>
    </Section>
  );
}

// A document tile: lifts slightly on hover, presses down on tap; opens in a new tab
function DocButton({ href, icon: Icon, title, hint }) {
  const { t } = useTranslation();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-lg border border-slate-200 p-3 transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:translate-y-0 active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:text-brand-300">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-sm font-medium">
          {title} <ExternalLink className="size-3 text-slate-400" aria-hidden />
          <span className="sr-only">{t('training.newTab')}</span>
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
      </span>
    </a>
  );
}

// The white card with an icon + title that every section uses
function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-surface p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <Icon className="size-4 text-slate-500" /> {title}
      </h2>
      {children}
    </section>
  );
}

// ------------------------------------------------------------------ Photo

const MAX_PHOTO_MB = 5;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function PhotoSection({ profile }) {
  const { t } = useTranslation();
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const [localError, setLocalError] = useState(null);

  // Quick checks in the browser, so a 40 MB file fails instantly instead of after a long upload.
  // (Cloudinary enforces the formats too: the browser check is only for convenience.)
  // From the camera or a file: the same checks either way
  // Checked here first for a quick message; the server and Cloudinary check again
  const onPick = (file) => {
    setLocalError(null);
    if (!PHOTO_TYPES.includes(file.type)) return setLocalError(t('account.photoType'));
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return setLocalError(t('account.photoSize', { mb: MAX_PHOTO_MB }));
    upload.mutate(file, { onSuccess: () => notify.success(t('account.photoUpdated')) });
  };

  return (
    <Section title={t('account.photo')} icon={Camera}>
      <div className="flex items-center gap-5">
        <div className="size-20 shrink-0 overflow-hidden rounded-full bg-slate-100">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={t('account.photoAlt')} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-2xl font-semibold text-slate-400">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <PhotoPicker onFile={onPick} accept={PHOTO_TYPES.join(',')} loading={upload.isPending} />
            {profile.avatarUrl && (
              <Button
                variant="ghost"
                loading={remove.isPending}
                onClick={() => remove.mutate(undefined, { onSuccess: () => notify.success(t('account.photoRemoved')) })}
              >
                {t('cart.remove')}
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-500">{t('account.photoHint', { mb: MAX_PHOTO_MB })}</p>
          {localError && <p className="text-sm text-red-600">{localError}</p>}
          {(upload.isError || remove.isError) && <ErrorState error={upload.error ?? remove.error} />}
        </div>
      </div>
    </Section>
  );
}

// ------------------------------------------------------------------ Details

function DetailsSection({ profile }) {
  const { t } = useTranslation();
  const update = useUpdateProfile();
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone ?? '',
    dateOfBirth: profile.dateOfBirth ?? '',
  });

  const submit = (e) => {
    e.preventDefault();
    // Empty fields are sent as null = "remove it".
    update.mutate(
      { name: form.name, phone: form.phone.trim() || null, dateOfBirth: form.dateOfBirth || null },
      { onSuccess: () => notify.success(t('account.detailsSaved')) },
    );
  };

  return (
    <Section title={t('account.details')} icon={UserIcon}>
      <form onSubmit={submit} className="space-y-3">
        {update.isError && <ErrorState error={update.error} />}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={t('auth.name')}
            name="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoComplete="name"
          />
          {/* Email is shown but not editable: changing the login email needs re-verification. */}
          <Input
            label={t('auth.email')}
            name="email"
            value={profile.email}
            disabled
            className="bg-slate-50 text-slate-500"
          />
          <Input
            label={t('account.phoneOptional')}
            name="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
            autoComplete="tel"
          />
          <Input
            label={t('account.birthdayOptional')}
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            autoComplete="bday"
          />
        </div>
        <Button type="submit" loading={update.isPending}>
          {t('account.saveDetails')}
        </Button>
      </form>
    </Section>
  );
}

// ------------------------------------------------------------------ Address book

// ------------------------------------------------------------------ Password

function PasswordSection() {
  const { t } = useTranslation();
  const change = useChangePassword();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  // "Show passwords" checkbox: switches the inputs between type="password" and type="text"
  const [show, setShow] = useState(false);
  // Checked in the browser for instant feedback; the server checks the real rules.
  // only complain once something was typed in "Confirm"
  const mismatch = form.confirm.length > 0 && form.confirm !== form.newPassword;

  const submit = (e) => {
    e.preventDefault();
    if (mismatch) return;
    change.mutate(
      { currentPassword: form.currentPassword, newPassword: form.newPassword },
      {
        onSuccess: () => {
          setForm({ currentPassword: '', newPassword: '', confirm: '' });
          notify.success(t('account.passwordChanged'));
        },
      },
    );
  };

  return (
    <Section title={t('account.password')} icon={KeyRound}>
      <form onSubmit={submit} className="space-y-3">
        {change.isError && <ErrorState error={change.error} />}
        <Input
          label={t('account.currentPassword')}
          name="currentPassword"
          type={show ? 'text' : 'password'}
          required
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {/* autoComplete="new-password" lets the browser's password manager suggest a strong one */}
          <Input
            label={t('auth.newPassword')}
            name="newPassword"
            type={show ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          <Input
            label={t('auth.confirmPassword')}
            name="confirm"
            type={show ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </div>
        {mismatch && <p className="text-sm text-red-600">{t('account.passwordsMismatch')}</p>}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />{' '}
          {t('account.showPasswords')}
        </label>
        <p className="text-xs text-slate-500">{t('account.passwordHint')}</p>
        <Button type="submit" loading={change.isPending} disabled={mismatch}>
          {t('account.changePassword')}
        </Button>
      </form>
    </Section>
  );
}

// The list of saved addresses (max 10) + "Add address".
function AddressBook({ profile }) {
  const { t } = useTranslation();
  // true while the "new address" form is open
  const [adding, setAdding] = useState(false);
  const add = useAddAddress();

  return (
    <Section title={t('account.addresses', { count: profile.addresses.length })} icon={MapPin}>
      {profile.addresses.length === 0 && !adding && (
        <p className="mb-3 text-sm text-slate-500">{t('account.noAddresses')}</p>
      )}
      <ul className="space-y-3">
        {profile.addresses.map((a) => (
          <AddressRow key={a.id} address={a} />
        ))}
      </ul>

      <div className="mt-4">
        {adding ? (
          <div className="rounded-lg border border-slate-200 p-4">
            <AddressForm
              defaultName={profile.name}
              defaultPhone={profile.phone}
              submitLabel={t('account.saveAddress')}
              saving={add.isPending}
              error={add.error}
              onSubmit={(input) =>
                add.mutate(input, {
                  onSuccess: () => {
                    setAdding(false);
                    notify.success(t('account.addressSaved'));
                  },
                })
              }
              onCancel={() => setAdding(false)}
            />
          </div>
        ) : (
          profile.addresses.length < 10 && (
            <Button variant="secondary" onClick={() => setAdding(true)}>
              <Plus className="size-4" /> {t('account.addAddress')}
            </Button>
          )
        )}
      </div>
    </Section>
  );
}

// One saved address: shown normally, or as the edit form when "Edit" is clicked.
function AddressRow({ address }) {
  const { t } = useTranslation();
  // true while this address is shown as the edit form
  const [editing, setEditing] = useState(false);
  const update = useUpdateAddress();
  const setDefault = useSetDefaultAddress();
  const remove = useDeleteAddress();

  if (editing) {
    return (
      <li className="rounded-lg border border-slate-200 p-4">
        <AddressForm
          address={address}
          submitLabel={t('account.saveChanges')}
          saving={update.isPending}
          error={update.error}
          onSubmit={(input) =>
            update.mutate(
              { id: address.id, ...input },
              {
                onSuccess: () => {
                  setEditing(false);
                  notify.success(t('account.addressUpdated'));
                },
              },
            )
          }
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li
      className={`flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4 ${address.isDefault ? 'border-brand-500 bg-brand-50/40' : 'border-slate-200'}`}
    >
      <div>
        <div className="mb-1 flex items-center gap-2">
          {address.label && (
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{address.label}</span>
          )}
          {address.isDefault && (
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
              {t('address.default')}
            </span>
          )}
        </div>
        <AddressLines address={address} />
        {(setDefault.isError || remove.isError) && (
          <div className="mt-2">
            <ErrorState error={setDefault.error ?? remove.error} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {!address.isDefault && (
          <Button
            variant="ghost"
            className="px-2 py-1 text-xs"
            loading={setDefault.isPending}
            onClick={() => setDefault.mutate(address.id)}
          >
            {t('account.makeDefault')}
          </Button>
        )}
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setEditing(true)}>
          {t('account.edit')}
        </Button>
        <Button
          variant="ghost"
          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          loading={remove.isPending}
          onClick={() => {
            if (confirm(t('account.confirmDeleteAddress')))
              remove.mutate(address.id, { onSuccess: () => notify.success(t('account.addressDeleted')) });
          }}
        >
          <Trash2 className="size-3.5" /> {t('account.delete')}
        </Button>
      </div>
    </li>
  );
}
