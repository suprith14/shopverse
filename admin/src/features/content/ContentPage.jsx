import { useState } from 'react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState, Spinner } from '@/components/ui/States';
import { STORE_URL } from '@/lib/config';
import { formatDateTime, getErrorMessage } from '@/lib/format';
import { useGetEditorContentQuery, useSaveContentMutation } from './contentApi';
import { ContentField } from './ContentField';

// /content: edit the store's text. One card per content type (Brand, Home page, Footer, Notices),
// each saved on its own. Everything on this page comes from the CMS, including which fields exist.
export function ContentPage() {
  const { data: types, isLoading, error } = useGetEditorContentQuery();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="mt-1 text-sm text-slate-500">
            The text customers see in the store. Changes appear there within about a minute.
          </p>
        </div>
        <a
          href={STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
        >
          View store <ExternalLink className="size-3.5" />
        </a>
      </div>

      {isLoading && <Spinner label="Loading content..." />}
      {error && <ErrorState message={cmsErrorMessage(error)} />}
      {types?.map((t) => (
        <ContentTypeForm key={t.type} contentType={t} />
      ))}
    </div>
  );
}

function ContentTypeForm({ contentType }) {
  const { type, label, description, fields, values, updatedAt } = contentType;
  const [form, setForm] = useState(values);
  const [saveContent, { isLoading: saving, error, reset }] = useSaveContentMutation();
  const [savedAt, setSavedAt] = useState(null);

  // Has anything changed compared with what's saved?
  const dirty = fields.some((f) => form[f.name] !== values[f.name]);
  // Validation errors from the CMS, per field: { heroTitle: 'At most 60 characters' }
  const fieldErrors = Object.fromEntries(
    (error?.data?.error?.details ?? []).filter((d) => d.field).map((d) => [d.field, d.message]),
  );

  const change = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setSavedAt(null);
    if (error) reset(); // clear old errors once the editor starts fixing them
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveContent({ type, values: form }).unwrap();
      setForm(saved); // what the CMS stored (e.g. trimmed spaces)
      setSavedAt(new Date());
    } catch {
      // shown below via `error`
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="font-semibold">{label}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      {fields.map((field) => (
        <ContentField
          key={field.name}
          field={field}
          value={form[field.name]}
          error={fieldErrors[field.name]}
          onChange={(value) => change(field.name, value)}
        />
      ))}

      {error && !Object.keys(fieldErrors).length && <ErrorState message={cmsErrorMessage(error)} />}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-500">
          {updatedAt ? `Last saved ${formatDateTime(updatedAt)}` : 'Not edited yet: showing the defaults'}
        </span>
        <div className="flex items-center gap-3">
          {savedAt && !dirty && (
            <span role="status" className="flex items-center gap-1 text-sm text-green-700">
              <CheckCircle2 className="size-4" /> Saved
            </span>
          )}
          {dirty && (
            <Button type="button" variant="ghost" onClick={() => setForm(values)} disabled={saving}>
              Discard changes
            </Button>
          )}
          <Button type="submit" loading={saving} disabled={!dirty}>
            Save {label.toLowerCase()}
          </Button>
        </div>
      </div>
    </form>
  );
}

// "Cannot reach the server" is the usual message, but here it's the CMS that's down, not the shop API.
function cmsErrorMessage(error) {
  if (error?.status === 'FETCH_ERROR' || error?.status === 502 || error?.status === 504) {
    return 'Cannot reach the CMS. Is it running? (cd cms && npm run dev)';
  }
  return getErrorMessage(error);
}
