import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/format';
import { useSignBannerUploadMutation } from './contentApi';

// One input, drawn from the field description the CMS sends:
//   { name, kind: 'text' | 'number' | 'image' | 'link' | 'list', label, max, min?, multiline?, optional?, help?, default }
// So a field added in cms/src/content/content-types.js appears here with no admin code change.
//
// `path` is the field's address in the saved data ("slides.2.title"), used to find its error in
// `errors`, the CMS's validation errors keyed the same way.
export function ContentField({ field, path = field.name, value, errors, onChange }) {
  if (field.kind === 'list') return <ListField field={field} path={path} value={value} errors={errors} onChange={onChange} />;
  if (field.kind === 'image') return <ImageField field={field} value={value} error={errors[path]} onChange={onChange} />;
  if (field.kind === 'text' && field.localized) {
    return <LocalizedField field={field} path={path} value={value} errors={errors} onChange={onChange} />;
  }
  return <InputField field={field} path={path} value={value} error={errors[path]} onChange={onChange} />;
}

// A translated text field: { en, kn }. English is required where the field is; Kannada is optional
// and the store shows English wherever it's empty. Each box is an ordinary InputField (counter,
// "Use default", errors at "<path>.en" / "<path>.kn").
const LANGUAGE_BOXES = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ · Kannada (optional)' },
];

function LocalizedField({ field, path, value, errors, onChange }) {
  const current = typeof value === 'string' ? { en: value, kn: '' } : (value ?? { en: '', kn: '' });
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-700">{field.label}</legend>
      {field.help && <p className="text-xs text-slate-500">{field.help}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {LANGUAGE_BOXES.map(({ code, label }) => (
          <InputField
            key={code}
            field={{
              ...field,
              label,
              help: undefined,
              default: field.default?.[code] ?? '',
              optional: code === 'kn' || field.optional,
            }}
            path={`${path}.${code}`}
            value={current[code] ?? ''}
            error={errors[`${path}.${code}`]}
            onChange={(text) => onChange({ ...current, [code]: text })}
            lang={code}
          />
        ))}
      </div>
    </fieldset>
  );
}

const inputClass = (error) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${error ? 'border-red-400' : 'border-slate-300'}`;

// text, link, number
function InputField({ field, path, value, error, onChange, lang }) {
  const id = `content-${path}`;
  const hintId = `${id}-hint`;
  const showDefault = field.default !== '' && value !== field.default;

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
        className={`${inputClass(error)} max-w-32`}
      />
    );
  } else {
    const Tag = field.multiline ? 'textarea' : 'input';
    input = (
      <Tag
        id={id}
        rows={field.multiline ? 3 : undefined}
        lang={lang}
        maxLength={field.max}
        required={!field.optional}
        placeholder={field.kind === 'link' ? '/shop?category=sneakers' : field.optional ? 'Optional' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hintId}
        aria-invalid={Boolean(error)}
        className={`${inputClass(error)} ${field.kind === 'link' ? 'font-mono' : ''}`}
      />
    );
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {field.label}
        </label>
        {showDefault && (
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

// Cloudinary can resize on the fly: insert a transformation after "/upload/".
// Used for a small, fast preview here (and responsive sizes in the store).
const resized = (url, transformation) => url.replace('/image/upload/', `/image/upload/${transformation}/`);

const MAX_FILE_MB = 10;

// Upload in two steps, without the file ever passing through our servers:
//   1. ask the CMS for a signed permission (POST /cms/admin/uploads/banner-signature)
//   2. send the file straight to Cloudinary with it; Cloudinary answers with the image URL
// The URL is saved when the admin clicks Save (the CMS checks it's one of OUR banner images).
function ImageField({ field, value, error, onChange }) {
  const inputRef = useRef(null);
  const [signUpload] = useSignBannerUploadMutation();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const upload = async (file) => {
    setUploadError(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return setUploadError('Choose a JPG, PNG or WebP image');
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) return setUploadError(`The image must be under ${MAX_FILE_MB} MB`);

    setUploading(true);
    try {
      const signed = await signUpload().unwrap();
      const form = new FormData();
      Object.entries(signed.fields).forEach(([key, val]) => form.append(key, String(val)));
      form.append('file', file);
      const res = await fetch(signed.uploadUrl, { method: 'POST', body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? 'Upload failed');
      onChange(body.secure_url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const message = uploadError ?? error;
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}</span>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`flex aspect-[12/5] w-48 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-50 ${message ? 'border-red-400' : 'border-slate-200'}`}
        >
          {value ? (
            <img src={resized(value, 'c_fill,w_400,h_167,q_auto,f_auto')} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-6 text-slate-400" aria-hidden />
          )}
        </div>
        <div className="space-y-1">
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {uploading ? 'Uploading...' : value ? 'Replace image' : 'Upload image'}
          </Button>
          <p className="text-xs text-slate-500">JPG, PNG or WebP, up to {MAX_FILE_MB} MB.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = ''; // so choosing the same file again still triggers a change
            if (file) upload(file);
          }}
        />
      </div>
      {message && <p className="mt-1 text-xs text-red-600">{message}</p>}
    </div>
  );
}

// A list of items (e.g. carousel slides): add, remove, reorder. Each item is a small form of
// its own, drawn from field.fields. The order here is the order in the store.
function ListField({ field, path, value, errors, onChange }) {
  const items = value ?? [];
  const blank = () => Object.fromEntries(field.fields.map((f) => [f.name, f.default]));

  const update = (index, name, fieldValue) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [name]: fieldValue } : item)));
  const remove = (index) => onChange(items.filter((_, i) => i !== index));
  const move = (index, by) => {
    const next = [...items];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    onChange(next);
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-slate-700">
        {field.label}{' '}
        <span className="font-normal text-slate-500">
          ({items.length}/{field.maxItems})
        </span>
      </legend>
      {field.help && <p className="text-xs text-slate-500">{field.help}</p>}
      {errors[path] && <p className="text-xs text-red-600">{errors[path]}</p>}

      {items.map((item, index) => (
        // Index keys are fine here: items have no ids, and every input is controlled by `value`
        <div key={index} className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {field.itemLabel} {index + 1}
            </h3>
            <div className="flex gap-1">
              <IconButton label={`Move ${field.itemLabel} ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                <ArrowUp className="size-4" />
              </IconButton>
              <IconButton
                label={`Move ${field.itemLabel} ${index + 1} down`}
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="size-4" />
              </IconButton>
              <IconButton label={`Remove ${field.itemLabel} ${index + 1}`} onClick={() => remove(index)} danger>
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          </div>
          {field.fields.map((f) => (
            <ContentField
              key={f.name}
              field={f}
              path={`${path}.${index}.${f.name}`}
              value={item[f.name]}
              errors={errors}
              onChange={(v) => update(index, f.name, v)}
            />
          ))}
        </div>
      ))}

      {items.length < field.maxItems && (
        <Button type="button" variant="secondary" onClick={() => onChange([...items, blank()])}>
          <Plus className="size-4" /> Add {field.itemLabel.toLowerCase()}
        </Button>
      )}
    </fieldset>
  );
}

function IconButton({ label, onClick, disabled, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded-md p-1.5 disabled:opacity-30 ${danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-600 hover:bg-slate-200'}`}
    >
      {children}
    </button>
  );
}
