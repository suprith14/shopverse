// One input, drawn from the field description the CMS sends:
//   { name, kind: 'text' | 'number', label, max, min?, multiline?, help?, default }
// So a field added in cms/src/content/content-types.js appears here with no admin code change.
export function ContentField({ field, value, error, onChange }) {
  const id = `content-${field.name}`;
  const hintId = `${id}-hint`;
  const isDefault = value === field.default;
  const inputClass = `w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${error ? 'border-red-400' : 'border-slate-300'}`;

  let input;
  if (field.kind === 'number') {
    input = (
      <input
        id={id}
        type="number"
        min={field.min}
        max={field.max}
        step={1}
        required
        value={value}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        aria-describedby={hintId}
        aria-invalid={Boolean(error)}
        className={`${inputClass} max-w-32`}
      />
    );
  } else {
    const Tag = field.multiline ? 'textarea' : 'input';
    input = (
      <Tag
        id={id}
        rows={field.multiline ? 3 : undefined}
        maxLength={field.max}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hintId}
        aria-invalid={Boolean(error)}
        className={inputClass}
      />
    );
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {field.label}
        </label>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onChange(field.default)}
            className="text-xs text-slate-500 hover:text-brand-600 hover:underline"
            title={`Default: ${field.default}`}
          >
            Use default
          </button>
        )}
      </div>
      {input}
      <div id={hintId} className="mt-1 flex justify-between gap-3 text-xs">
        <span className={error ? 'text-red-600' : 'text-slate-500'}>
          {error ?? field.help ?? (field.kind === 'number' ? `From ${field.min} to ${field.max}` : '')}
        </span>
        {field.kind === 'text' && (
          // Turns amber near the limit, so editors see it coming
          <span className={String(value).length > field.max * 0.9 ? 'text-amber-600' : 'text-slate-400'}>
            {String(value).length}/{field.max}
          </span>
        )}
      </div>
    </div>
  );
}
