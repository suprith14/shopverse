import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { AlertCircle, AlertTriangle, Ban, Hourglass, LogIn, SearchX, ServerCrash, ShieldAlert, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { dismissApiError, useApiError } from '@/lib/api-error';

const WAIT_SECONDS = 5;

// One entry per kind of failure (see errorKind in lib/api-error.js):
//   icon/tone = the picture and its colour
//   title     = the translation key of the heading
//   action    = the main button: 'reload' the page, 'login', or just 'ok' (close)
//   wait      = disable Retry for 5 s (server errors: retrying instantly usually fails again)
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
export function ApiErrorDialog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, kind, message } = useApiError();
  const open = !!error;
  const ref = useRef(null);
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);
  // While closed, kind is null: keep the last one so the closing popup doesn't change its look
  const [shown, setShown] = useState(KINDS.generic);
  const config = kind ? KINDS[kind] : shown;

  // Open / close the real <dialog> when the store changes
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setShown(KINDS[kind]);
      setSecondsLeft(WAIT_SECONDS);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, kind]);

  // Server errors: count down once per second before Retry can be pressed
  useEffect(() => {
    if (!open || !config.wait || secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, config.wait, secondsLeft]);

  const close = () => ref.current?.close(); // fires onClose -> dismissApiError
  const goToLogin = () => {
    close();
    // after logging in, the login page sends the customer back here
    navigate('/login', { state: { from: location.pathname + location.search } });
  };

  // The text under the title: our own sentence for server/session errors, otherwise the
  // server's explanation (e.g. "Only 2 left in stock", "Email already registered")
  const text =
    kind === 'server' ? t('errors.serverText', { seconds: WAIT_SECONDS }) : kind === 'session' ? t('errors.sessionText') : message;
  const Icon = config.icon;
  const waiting = config.wait && secondsLeft > 0;

  return (
    <dialog
      ref={ref}
      onClose={dismissApiError}
      aria-labelledby="api-error-title"
      aria-describedby="api-error-text"
      className="bg-surface text-slate-900 m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl p-0 shadow-xl backdrop:bg-night/60"
    >
      <div className="p-6 text-center">
        <span className={`mx-auto flex size-12 items-center justify-center rounded-full ${config.tone}`}>
          <Icon className="size-6" aria-hidden />
        </span>
        <h2 id="api-error-title" className="mt-4 text-lg font-semibold">
          {t(config.title)}
        </h2>
        <p id="api-error-text" className="mt-2 text-sm text-slate-600">
          {text}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {config.action === 'reload' && (
            <Button onClick={() => window.location.reload()} disabled={waiting} className="w-full">
              {waiting ? t('errors.retryIn', { seconds: secondsLeft }) : t('common.retry')}
            </Button>
          )}
          {config.action === 'login' && (
            <Button onClick={goToLogin} className="w-full">
              {t('nav.logIn')}
            </Button>
          )}
          {config.action === 'ok' ? (
            <Button onClick={close} className="w-full">
              {t('common.ok')}
            </Button>
          ) : (
            <Button variant="ghost" onClick={close} className="w-full">
              {t('common.close')}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
