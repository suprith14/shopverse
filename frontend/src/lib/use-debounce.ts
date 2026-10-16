import { useEffect, useState } from 'react';

// Returns `value`, but only after it has stopped changing for `delayMs`.
// Typing "laptop" fires 6 changes; with a 250 ms debounce only "laptop" reaches the API,
// instead of "l", "la", "lap"... (6 requests -> 1).
export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer); // value changed again before the delay: restart the timer
  }, [value, delayMs]);
  return debounced;
}
