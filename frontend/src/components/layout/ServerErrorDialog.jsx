// import = bring in code from another file or package.
// useTranslation (react-i18next) = gives t(), which turns a key like 'common.retry' into text in
//   the reader's language (English or Kannada).
import { useTranslation } from 'react-i18next';
// React hooks (functions starting with "use" that give a component memory or side effects):
//   useState  = a value the component remembers; changing it redraws the component.
//   useRef    = a box that keeps something (here: the <dialog> element) WITHOUT redrawing.
//   useEffect = run code AFTER React has drawn the screen (talk to the browser, start timers).
import { useEffect, useRef, useState } from 'react';
// lucide-react = an icon library; ServerCrash is a "broken server" icon drawn as an SVG.
import { ServerCrash } from 'lucide-react';
// @/ = shortcut for frontend/src/ (set in vite.config.js and jsconfig.json).
import { Button } from '@/components/ui/Button';
// useServerError = a tiny global store (Zustand): is the popup open? dismissServerError = close it.
import { dismissServerError, useServerError } from '@/lib/server-error';

// const = a name whose value never changes. UPPER_CASE = a fixed setting.
const WAIT_SECONDS = 5;

// Opens when any request fails with a 5xx (see lib/server-error.js).
// "Retry" is enabled after 5 seconds and reloads the page. Why wait? Most server errors on our
// hosting are short: a restart, a database waking up. Retrying instantly usually fails again, and
// a short wait also stops many visitors hammering a struggling server at the same moment.
//
// export = other files can import this. function ServerErrorDialog() = a React component:
// a function that returns what to show (JSX). Its name starts with a capital letter.
export function ServerErrorDialog() {
  // { t } = destructuring: take the "t" property out of the object useTranslation() returns.
  const { t } = useTranslation();
  // (s) => s.open = an arrow function (a short function): from the store's state s, read s.open.
  // The component redraws only when that one value changes.
  const open = useServerError((s) => s.open);
  // ref.current will point at the real <dialog> element once React has drawn it (null before).
  const ref = useRef(null);
  // [value, setter] = array destructuring. secondsLeft = the value; setSecondsLeft = change it.
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);

  // Built on the browser's <dialog>: focus stays inside, Esc closes it, screen readers announce it.
  // useEffect(fn, [open]) = run fn after drawing, and again whenever `open` changes.
  useEffect(() => {
    const dialog = ref.current;
    // return early = stop here if the element isn't there yet.
    if (!dialog) return;
    // && = AND. dialog.open = the browser's own "is it showing?" flag.
    if (open && !dialog.open) {
      setSecondsLeft(WAIT_SECONDS);
      // showModal() = browser API: show as a modal (dims the page, traps keyboard focus inside).
      dialog.showModal();
    }
    // close() = browser API: hide it (also fires the onClose event below).
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Count down once per second while open.
  // [open, secondsLeft] = the dependency list: re-run whenever either changes (so: every second).
  useEffect(() => {
    // || = OR. Nothing to do if the popup is closed or the countdown has finished.
    if (!open || secondsLeft === 0) return;
    // setTimeout(fn, 1000) = run fn once after 1000 ms. (s) => s - 1 = "previous value minus 1".
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    // The returned function is the CLEANUP: React runs it before the next run or on removal,
    // so an old timer never keeps ticking.
    return () => clearTimeout(timer);
  }, [open, secondsLeft]);

  // return ( … ) = what this component shows. The HTML-like syntax is JSX: it becomes JavaScript.
  return (
    // <dialog> = the browser's built-in popup element.
    // ref={ref} = after drawing, put this element into ref.current.
    // onClose = event: the dialog was closed (Close button, Esc key...): tell the store.
    // aria-labelledby / aria-describedby = for screen readers: the title and text are the
    //   elements with these ids.
    // className = CSS classes (Tailwind): bg-surface = card background, backdrop: = the dimmed
    //   layer behind the dialog, night/60 = always-dark colour at 60% opacity.
    <dialog
      ref={ref}
      onClose={dismissServerError}
      aria-labelledby="server-error-title"
      aria-describedby="server-error-text"
      className="bg-surface text-slate-900 m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl p-0 shadow-xl backdrop:bg-night/60"
    >
      <div className="p-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50">
          {/* aria-hidden = screen readers skip it (decoration; the text says it all) */}
          <ServerCrash className="size-6 text-red-600" aria-hidden />
        </span>
        {/* id = the name aria-labelledby points to. { } in JSX = "run this JavaScript here". */}
        <h2 id="server-error-title" className="mt-4 text-lg font-semibold">
          {t('errors.serverTitle')}
        </h2>
        {/* t(key, { seconds }) fills {{seconds}} in the translated sentence */}
        <p id="server-error-text" className="mt-2 text-sm text-slate-600">
          {t('errors.serverText', { seconds: WAIT_SECONDS })}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {/* onClick = what a click does. window.location.reload() = reload the page.
              disabled={…} = can't click while the countdown runs.
              a ? b : c = the ternary operator: if a then b else c. */}
          <Button onClick={() => window.location.reload()} disabled={secondsLeft > 0} className="w-full">
            {secondsLeft > 0 ? t('errors.retryIn', { seconds: secondsLeft }) : t('common.retry')}
          </Button>
          {/* ?. = optional chaining: call close() only if ref.current exists (no crash if null) */}
          <Button variant="ghost" onClick={() => ref.current?.close()} className="w-full">
            {t('common.close')}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
