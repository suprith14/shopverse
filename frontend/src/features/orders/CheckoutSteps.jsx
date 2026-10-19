import { Check } from 'lucide-react';

// Where the customer is in the purchase. Three honest steps that match the real flow:
// 1) cart page (items + delivery address) -> 2) Stripe's payment page -> 3) our order page.
const STEPS = ['Cart & delivery', 'Payment', 'Confirmation'];

// `current` is the step in progress (1-3). `done` marks everything as finished (paid).
export function CheckoutSteps({ current, done = false }) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Checkout progress">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const complete = done || step < current;
        const active = !done && step === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                complete
                  ? 'bg-brand-600 text-white'
                  : active
                    ? 'border-2 border-brand-600 text-brand-700 dark:text-brand-300'
                    : 'border border-slate-300 text-slate-400'
              }`}
            >
              {complete ? <Check className="size-4" aria-hidden /> : step}
            </span>
            {/* Labels hide on very small screens; the numbers still show progress */}
            <span
              className={`hidden sm:inline ${active ? 'font-semibold text-slate-900' : complete ? 'text-slate-700' : 'text-slate-400'}`}
            >
              {label}
              {complete && <span className="sr-only"> (done)</span>}
            </span>
            {step < STEPS.length && (
              <span className={`h-0.5 flex-1 ${complete ? 'bg-brand-600' : 'bg-slate-200'}`} aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
