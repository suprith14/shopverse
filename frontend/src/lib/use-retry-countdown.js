import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';

// When the server answers 429 Too Many Requests, it says how long to wait in the standard
// Retry-After header (seconds). This turns that into a live countdown, so the page can show
// "Try again in 14:32" and keep the button disabled until then, instead of letting people click
// (and fail) over and over.
export function useRetryCountdown(error) {
  const [until, setUntil] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  // A new 429 error: start counting down from its Retry-After.
  useEffect(() => {
    if (!isAxiosError(error) || error.response?.status !== 429) return;
    const seconds = Number(error.response.headers['retry-after']);
    if (seconds > 0) setUntil(Date.now() + seconds * 1000);
  }, [error]);

  // Tick once a second while counting.
  useEffect(() => {
    if (until === null) return;
    const timer = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= until) setUntil(null);
    }, 1000);
    return () => clearInterval(timer);
  }, [until]);

  const remainingMs = until === null ? 0 : Math.max(0, until - now);
  const total = Math.ceil(remainingMs / 1000);
  return {
    blocked: remainingMs > 0,
    label: `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`, // "14:05"
  };
}
