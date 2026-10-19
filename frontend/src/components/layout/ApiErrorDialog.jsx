// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useRef, useState } from 'react';
// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useLocation = the current URL (pathname, search) and any state passed to it
// useNavigate = gives navigate(url) to change page from code
import { useLocation, useNavigate } from 'react-router';
// import = bring in code from another file or package
import { AlertCircle, AlertTriangle, Ban, Hourglass, LogIn, SearchX, ServerCrash, ShieldAlert, WifiOff } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { dismissApiError, useApiError } from '@/lib/api-error';

// const = a name for a value that is never reassigned
const WAIT_SECONDS = 5;

// One entry per kind of failure (see errorKind in lib/api-error.js):
//   icon/tone = the picture and its colour
//   title     = the translation key of the heading
//   action    = the main button: 'reload' the page, 'login', or just 'ok' (close)
//   wait      = disable Retry for 5 s (server errors: retrying instantly usually fails again)
// const = a name for a value that is never reassigned
const KINDS = {
  server: { icon: ServerCrash, tone: 'bg-red-50 text-red-600', title: 'errors.serverTitle', action: 'reload', wait: true },
  offline: { icon: WifiOff, tone: 'bg-amber-50 text-amber-600', title: 'errors.offlineTitle', action: 'reload' },
  // the device itself is offline: no Retry (reloading offline shows the browser's error page);
  // the popup closes by itself when the connection is back
  noInternet: { icon: WifiOff, tone: 'bg-amber-50 text-amber-600', title: 'errors.offlineTitle', action: 'ok' },
  session: { icon: LogIn, tone: 'bg-brand-50 text-brand-600', title: 'errors.sessionTitle', action: 'login' },
  suspended: { icon: Ban, tone: 'bg-red-50 text-red-600', title: 'errors.suspendedTitle', action: 'ok' },
  forbidden: { icon: ShieldAlert, tone: 'bg-red-50 text-red-600', title: 'errors.forbiddenTitle', action: 'ok' },
  notFound: { icon: SearchX, tone: 'bg-amber-50 text-amber-600', title: 'errors.notFoundTitle', action: 'ok' },
  tooMany: { icon: Hourglass, tone: 'bg-amber-50 text-amber-600', title: 'errors.tooManyTitle', action: 'ok' },
  invalid: { icon: AlertCircle, tone: 'bg-amber-50 text-amber-600', title: 'errors.invalidTitle', action: 'ok' },
  generic: { icon: AlertTriangle, tone: 'bg-red-50 text-red-600', title: 'errors.generic', action: 'ok' },
};

// The popup for every failed API request. Built on the browser's <dialog>: focus stays inside,
// Esc closes it, screen readers announce it. Replaces the old 5xx-only ServerErrorDialog.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function ApiErrorDialog() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // useNavigate = gives navigate(url) to change page from code
  const navigate = useNavigate();
  // const = a name for a value that is never reassigned
  // useLocation = the current URL (pathname, search) and any state passed to it
  const location = useLocation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { error, kind, message } = useApiError();
  // const = a name for a value that is never reassigned
  // !!x = turn any value into true/false
  // ! = NOT: flips true/false
  const open = !!error;
  // const = a name for a value that is never reassigned
  // useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
  const ref = useRef(null);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);
  // While closed, kind is null: keep the last one so the closing popup doesn't change its look
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [shown, setShown] = useState(KINDS.generic);
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // obj[key] = read the property whose name is stored in key
  const config = kind ? KINDS[kind] : shown;

  // Open / close the real <dialog> when the store changes
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // const = a name for a value that is never reassigned
    const dialog = ref.current;
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // return = give this value back and stop the function here
    if (!dialog) return;
    // if (...) = run the next part only when the condition is true
    // a && b = AND; in JSX: show b only when a is true
    // ! = NOT: flips true/false
    if (open && !dialog.open) {
      // obj[key] = read the property whose name is stored in key
      setShown(KINDS[kind]);
      setSecondsLeft(WAIT_SECONDS);
      // showModal = open a <dialog> as a modal (dims the page, traps focus)
      dialog.showModal();
    }
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // a && b = AND; in JSX: show b only when a is true
    if (!open && dialog.open) dialog.close();
  }, [open, kind]);

  // Server errors: count down once per second before Retry can be pressed
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // a || b = OR: a if it is truthy, else b
    // === = strictly equal (same value AND same type)
    // return = give this value back and stop the function here
    if (!open || !config.wait || secondsLeft === 0) return;
    // const = a name for a value that is never reassigned
    // setTimeout = run a function once after a delay (ms)
    // => = an arrow function (a short function)
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    // return = give this value back and stop the function here
    // => = an arrow function (a short function)
    // clearTimeout = cancel a setTimeout
    return () => clearTimeout(timer);
  }, [open, config.wait, secondsLeft]);

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // ?.() = call only if the function exists
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  const close = () => ref.current?.close(); // fires onClose -> dismissApiError
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const goToLogin = () => {
    close();
    // after logging in, the login page sends the customer back here
    navigate('/login', { state: { from: location.pathname + location.search } });
  };

  // The text under the title: our own sentence for server/session errors, otherwise the
  // server's explanation (e.g. "Only 2 left in stock", "Email already registered")
  // const = a name for a value that is never reassigned
  const text =
    // a ? b : c = ternary: if a then b else c
    // === = strictly equal (same value AND same type)
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    kind === 'server' ? t('errors.serverText', { seconds: WAIT_SECONDS }) : kind === 'session' ? t('errors.sessionText') : message;
  // const = a name for a value that is never reassigned
  const Icon = config.icon;
  // const = a name for a value that is never reassigned
  // a && b = AND; in JSX: show b only when a is true
  const waiting = config.wait && secondsLeft > 0;

  // return = give this value back and stop the function here
  return (
    // <dialog> = the browser's built-in popup (focus trap, Esc to close)
    <dialog
      // ref = after drawing, put this element into a useRef box (.current)
      // { } in JSX = run JavaScript here and show its result
      ref={ref}
      // onClose = runs when the dialog closes
      // { } in JSX = run JavaScript here and show its result
      onClose={dismissApiError}
      // aria-labelledby = the element (by id) that names this one
      aria-labelledby="api-error-title"
      // aria-describedby = the element (by id) that describes this one
      aria-describedby="api-error-text"
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      className="bg-surface text-slate-900 m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl p-0 shadow-xl backdrop:bg-night/60"
    >
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="p-6 text-center">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           `text ${x}` = a template string: text with values inserted */}
        <span className={`mx-auto flex size-12 items-center justify-center rounded-full ${config.tone}`}>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             aria-hidden = screen readers skip this (decoration) */}
          <Icon className="size-6" aria-hidden />
        </span>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <h2 id="api-error-title" className="mt-4 text-lg font-semibold">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t(config.title)}
        </h2>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <p id="api-error-text" className="mt-2 text-sm text-slate-600">
          {/* { } in JSX = run JavaScript here and show its result */}
          {text}
        </p>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="mt-6 flex flex-col gap-2">
          {/* { } in JSX = run JavaScript here and show its result
             === = strictly equal (same value AND same type)
             a && b = AND; in JSX: show b only when a is true */}
          {config.action === 'reload' && (
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // window = the browser tab (location, events, timers)
            // disabled = can't be clicked or typed in
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <Button onClick={() => window.location.reload()} disabled={waiting} className="w-full">
              {/* { } in JSX = run JavaScript here and show its result
                 a ? b : c = ternary: if a then b else c
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {waiting ? t('errors.retryIn', { seconds: secondsLeft }) : t('common.retry')}
            </Button>
          )}
          {/* { } in JSX = run JavaScript here and show its result
             === = strictly equal (same value AND same type)
             a && b = AND; in JSX: show b only when a is true */}
          {config.action === 'login' && (
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <Button onClick={goToLogin} className="w-full">
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {t('nav.logIn')}
            </Button>
          )}
          {/* { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c
             === = strictly equal (same value AND same type) */}
          {config.action === 'ok' ? (
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <Button onClick={close} className="w-full">
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {t('common.ok')}
            </Button>
          ) : (
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <Button variant="ghost" onClick={close} className="w-full">
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {t('common.close')}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
