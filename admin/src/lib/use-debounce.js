import { useEffect, useState } from 'react';

// Returns `value`, but only after it has stopped changing for `delayMs`.
// Used for search boxes so typing "nike" sends 1 request instead of 4.
export function useDebounce(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
