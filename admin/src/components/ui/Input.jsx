export function Input({ label, id, className = '', ...rest }) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        id={inputId}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
        {...rest}
      />
    </label>
  );
}
