// A labelled text input used by every form (login, address, account...).
// Clicking the label focuses the input because they share an id (taken from `name` if no id is given).
// Any other prop (type, value, onChange, required, autoComplete...) is passed straight to <input>.

export function Input({ label, id, className = '', ...rest }) {
  // label and input must share an id for screen readers and click-to-focus
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        id={inputId}
        className={`w-full rounded-lg border border-slate-300 bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
        // everything else the caller passed: value, onChange, type, required...
        {...rest}
      />
    </label>
  );
}
