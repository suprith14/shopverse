// The one button style for the whole store, in three looks (variants).
// <Button loading> shows a spinner and disables itself, so a form can't be sent twice.

import { Loader2 } from 'lucide-react';

// Tailwind classes per look. bg-surface / slate colours switch in dark mode by themselves
// (they're design tokens, see index.css). hover: only exists with a mouse; active: is the
// pressed colour, the feedback a finger gets on a phone (plus the shrink from index.css).
const variants = {
  // the main action on a screen (Add to cart, Log in)
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-500/60',
  // less important actions (Cancel, Apply price)
  secondary: 'border border-slate-300 bg-surface text-slate-800 hover:bg-slate-50 active:bg-slate-100',
  // quiet text-like buttons (Edit, Clear all filters)
  ghost: 'text-slate-700 hover:bg-slate-100 active:bg-slate-200',
};

export function Button({ variant = 'primary', loading, className = '', children, disabled, ...rest }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      // no double submits while a request is running
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
