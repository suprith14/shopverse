import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Cake, Camera, MapPin, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import { notify } from '@/lib/notify';
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/features/account/account.api';
import { useOnboardingStore } from './onboarding.store';

const STEPS = ['Photo', 'Mobile number', 'Date of birth', 'Delivery address'];
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_MB = 5;

// "Set up your profile" wizard, shown once after sign-up.
//  - 4 small steps instead of one long form, each skippable.
//  - Every step SAVES on "Next", so closing half-way keeps what was entered.
//  - Built on the browser's <dialog>: showModal() keeps keyboard focus inside, Esc closes it,
//    and screen readers announce it as a dialog. No library needed.
export function OnboardingDialog() {
  const open = useOnboardingStore((s) => s.open);
  const finish = useOnboardingStore((s) => s.finish);
  const dialogRef = useRef(null);
  const [step, setStep] = useState(0);
  const { data: profile } = useProfile();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setStep(0);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    // onClose fires for Esc too, which counts as "skip the rest".
    <dialog
      ref={dialogRef}
      onClose={finish}
      aria-labelledby="onboarding-title"
      className="bg-surface text-slate-900 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 shadow-xl backdrop:bg-night/60"
    >
      {open && profile && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="onboarding-title" className="text-lg font-bold">
                Welcome, {profile.name.split(' ')[0]}! 👋
              </h2>
              <p className="text-sm text-slate-500">Let's set up your profile. It takes a minute.</p>
            </div>
            <button onClick={finish} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
              <X className="size-5" />
            </button>
          </div>

          {/* Progress: "Step 2 of 4" in words and as a bar */}
          <p className="mt-5 text-xs font-medium text-slate-500">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
          <div className="mt-1.5 flex gap-1.5" aria-hidden>
            {STEPS.map((s, i) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />
            ))}
          </div>

          <div className="mt-6">
            {step === 0 && <PhotoStep avatarUrl={profile.avatarUrl} initial={profile.name.charAt(0)} onNext={next} />}
            {step === 1 && <PhoneStep initial={profile.phone} onNext={next} onBack={back} />}
            {step === 2 && <BirthdayStep initial={profile.dateOfBirth} onNext={next} onBack={back} />}
            {step === 3 && <AddressStep onBack={back} />}
          </div>
        </div>
      )}
    </dialog>
  );
}

function StepFooter({ onBack, onSkip, children }) {
  return (
    <div className="mt-6 flex items-center gap-2">
      {onBack && (
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
      )}
      <div className="ml-auto flex gap-2">
        {onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}

function StepIntro({ icon: Icon, title, text }) {
  return (
    <div className="mb-4 flex gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:text-brand-300">
        <Icon className="size-5" />
      </span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ 1. Photo

function PhotoStep({ avatarUrl, initial, onNext }) {
  const fileInput = useRef(null);
  const upload = useUploadAvatar();
  const [localError, setLocalError] = useState(null);

  // Uploads as soon as a photo is picked, so "Next" just moves on.
  const onPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLocalError(null);
    if (!PHOTO_TYPES.includes(file.type)) return setLocalError('Please choose a JPG, PNG or WebP image.');
    if (file.size > MAX_PHOTO_MB * 1024 * 1024)
      return setLocalError(`Please choose an image under ${MAX_PHOTO_MB} MB.`);
    upload.mutate(file);
  };

  return (
    <>
      <StepIntro icon={Camera} title="Add a profile photo" text="It shows in the header and next to your reviews." />
      <div className="flex flex-col items-center gap-3">
        <div className="size-24 overflow-hidden rounded-full bg-slate-100">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Your profile photo" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-3xl font-semibold text-slate-400">
              {initial.toUpperCase()}
            </div>
          )}
        </div>
        <input ref={fileInput} type="file" accept={PHOTO_TYPES.join(',')} onChange={onPick} className="hidden" />
        <Button variant="secondary" loading={upload.isPending} onClick={() => fileInput.current?.click()}>
          {avatarUrl ? 'Choose a different photo' : 'Choose photo'}
        </Button>
        {localError && <p className="text-sm text-red-600">{localError}</p>}
        {upload.isError && <ErrorState error={upload.error} />}
      </div>
      <StepFooter onSkip={avatarUrl ? undefined : onNext}>
        <Button onClick={onNext} disabled={upload.isPending}>
          Next
        </Button>
      </StepFooter>
    </>
  );
}

// ------------------------------------------------------------------ 2. Mobile number

function PhoneStep({ initial, onNext, onBack }) {
  const [phone, setPhone] = useState(initial ?? '');
  const update = useUpdateProfile();

  const submit = (e) => {
    e.preventDefault();
    if (!phone.trim()) return onNext();
    // The backend cleans it up ("+91 98765-43210" -> "+919876543210") and explains bad formats.
    update.mutate({ phone: phone.trim() }, { onSuccess: onNext });
  };

  return (
    <form onSubmit={submit}>
      <StepIntro
        icon={Phone}
        title="Your mobile number"
        text="Used by the delivery partner if they need to reach you."
      />
      {update.isError && (
        <div className="mb-3">
          <ErrorState error={update.error} />
        </div>
      )}
      <Input
        label="Mobile number"
        name="phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91 98765 43210"
        autoComplete="tel"
        autoFocus
      />
      <p className="mt-1 text-xs text-slate-500">Include your country code, e.g. +91 for India.</p>
      <StepFooter onBack={onBack} onSkip={onNext}>
        <Button type="submit" loading={update.isPending}>
          Next
        </Button>
      </StepFooter>
    </form>
  );
}

// ------------------------------------------------------------------ 3. Date of birth

function BirthdayStep({ initial, onNext, onBack }) {
  const [date, setDate] = useState(initial ?? '');
  const update = useUpdateProfile();

  const submit = (e) => {
    e.preventDefault();
    if (!date) return onNext();
    update.mutate({ dateOfBirth: date }, { onSuccess: onNext }); // backend checks it's a real date and age 13+
  };

  return (
    <form onSubmit={submit}>
      <StepIntro icon={Cake} title="Your date of birth" text="Optional. We may send you a little birthday surprise." />
      {update.isError && (
        <div className="mb-3">
          <ErrorState error={update.error} />
        </div>
      )}
      <Input
        label="Date of birth"
        name="dateOfBirth"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        max={new Date().toISOString().slice(0, 10)}
        autoComplete="bday"
      />
      <StepFooter onBack={onBack} onSkip={onNext}>
        <Button type="submit" loading={update.isPending}>
          Next
        </Button>
      </StepFooter>
    </form>
  );
}

// ------------------------------------------------------------------ 4. Address (info)

function AddressStep({ onBack }) {
  const finish = useOnboardingStore((s) => s.finish);
  const navigate = useNavigate();

  const done = () => {
    finish();
    notify.success('Your profile is set up');
  };

  return (
    <>
      <StepIntro
        icon={MapPin}
        title="One more thing: your delivery address"
        text="Add an address in My account and you can check out in one tap. You can also add it at checkout."
      />
      <div className="rounded-lg bg-brand-50 p-4 text-sm text-brand-800 dark:text-brand-300">
        Find it any time under <b>My account → Delivery addresses</b> (your photo or name at the top right).
      </div>
      <StepFooter onBack={onBack}>
        <Button
          variant="secondary"
          onClick={() => {
            done();
            navigate('/account');
          }}
        >
          Add address now
        </Button>
        <Button onClick={done}>Done</Button>
      </StepFooter>
    </>
  );
}
