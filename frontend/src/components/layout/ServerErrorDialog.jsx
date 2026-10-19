import { useEffect, useRef, useState } from 'react';
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { dismissServerError, useServerError } from '@/lib/server-error';

const WAIT_SECONDS = 5;

// Opens when any request fails with a 5xx (see lib/server-error.js).
// "Retry" is enabled after 5 seconds and reloads the page. Why wait? Most server errors on our
// hosting are short: a restart, a database waking up. Retrying instantly usually fails again, and
// a short wait also stops many visitors hammering a struggling server at the same moment.
export function ServerErrorDialog() {
  const open = useServerError((s) => s.open);
  const ref = useRef(null);
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);

  // Built on the browser's <dialog>: focus stays inside, Esc closes it, screen readers announce it.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setSecondsLeft(WAIT_SECONDS);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Count down once per second while open.
  useEffect(() => {
    if (!open || secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, secondsLeft]);

  return (
    <dialog
      ref={ref}
      onClose={dismissServerError}
      aria-labelledby="server-error-title"
      aria-describedby="server-error-text"
      className="bg-surface text-slate-900 m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl p-0 shadow-xl backdrop:bg-night/60"
    >
      <div className="p-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50">
          <ServerCrash className="size-6 text-red-600" aria-hidden />
        </span>
        <h2 id="server-error-title" className="mt-4 text-lg font-semibold">
          Something went wrong
        </h2>
        <p id="server-error-text" className="mt-2 text-sm text-slate-600">
          An error occurred on our side. Please retry after {WAIT_SECONDS} seconds.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => window.location.reload()} disabled={secondsLeft > 0} className="w-full">
            {secondsLeft > 0 ? `Retry in ${secondsLeft}s` : 'Retry'}
          </Button>
          <Button variant="ghost" onClick={() => ref.current?.close()} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </dialog>
  );
}
