import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TERMS, TERM_INDEX } from './terms';

// Turns plain text into text where every known short form (RFP, SOW, MoM...) is underlined and
// explains itself: hover or keyboard focus on a computer, tap on a phone. Longest terms first, so
// "CI/CD" wins over "CI", and "ISO 27001" over "ISO". A trailing "s" (PRs, APIs) stays outside.
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PATTERN = new RegExp(
  `(?<![A-Za-z0-9])(${TERMS.map(([term]) => term)
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join('|')})(s?)(?![A-Za-z0-9])`,
  'g',
);

export function withTerms(text, keyPrefix = 't') {
  const out = [];
  let last = 0;
  for (const match of text.matchAll(PATTERN)) {
    if (match.index > last) out.push(text.slice(last, match.index));
    out.push(<Term key={`${keyPrefix}${match.index}`} term={match[1]} />);
    if (match[2]) out.push(match[2]);
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const WIDTH = 256; // the popup's width in px (w-64)

function Term({ term }) {
  const info = TERM_INDEX.get(term);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const id = useId();

  // The popup is drawn in document.body (a portal): tables scroll sideways and sections fade in
  // with transforms, and either would clip a popup drawn inside them. Placed under the word and
  // kept inside the screen.
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left), window.innerWidth - WIDTH - 8);
    setPos({ top: r.bottom + 6, left });
  }, [open]);

  // Close on a tap elsewhere, Escape, or scrolling (the popup would no longer sit under the word)
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onScroll = () => setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [open]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        // Always "open": a tap also focuses the button (which opens it), so a toggle here would close
        // it again straight away. Closing = tap elsewhere, Escape, blur or scrolling.
        onClick={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-describedby={open ? id : undefined}
        className="cursor-help underline decoration-slate-400 decoration-dotted underline-offset-4 hover:decoration-brand-500"
      >
        {term}
      </button>
      {open &&
        pos &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{ top: pos.top, left: pos.left, width: WIDTH }}
            className="pointer-events-none fixed z-50 block rounded-lg border border-slate-200 bg-surface p-3 text-left text-sm font-normal leading-snug text-slate-700 shadow-lg motion-safe:animate-fade-up"
          >
            <span className="block font-semibold text-slate-900">
              {term} · {info.full}
            </span>
            <span className="mt-1 block">{info.meaning}</span>
          </span>,
          document.body,
        )}
    </>
  );
}
