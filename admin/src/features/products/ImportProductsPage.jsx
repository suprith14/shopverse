import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, FileSpreadsheet, Upload, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/States';
import { downloadFile } from '@/lib/download';
import { getErrorMessage } from '@/lib/format';
import { useImportProductsMutation } from './productsApi';

const MAX_BYTES = 5 * 1024 * 1024; // same limit as the API

// Bulk product import in three steps: download the template, upload a filled file and get a
// preview (a dry run: every problem by row, nothing saved), then Import. The Import button only
// appears for a clean preview of the SAME file, so what's saved is exactly what was checked.
export function ImportProductsPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [done, setDone] = useState(null);
  const [templateError, setTemplateError] = useState(null);
  const [runImport, { isLoading, error }] = useImportProductsMutation();
  const [checking, setChecking] = useState(false);

  const pick = (picked) => {
    setPreview(null);
    setDone(null);
    setFileError(null);
    if (!picked) return setFile(null);
    if (!picked.name.toLowerCase().endsWith('.xlsx')) return setFileError('Choose an Excel .xlsx file');
    if (picked.size > MAX_BYTES) return setFileError('The file is larger than 5 MB. Split it into smaller files.');
    setFile(picked);
  };

  const check = async () => {
    setChecking(true);
    try {
      setPreview(await runImport({ file, dryRun: true }).unwrap());
    } catch {
      // shown by the ErrorState below
    } finally {
      setChecking(false);
    }
  };

  const confirm = async () => {
    try {
      setDone(await runImport({ file, dryRun: false }).unwrap());
      setPreview(null);
    } catch (err) {
      // 422 = refused because of problems (the data changed since the preview): show them
      if (err?.status === 422) setPreview(err.data);
    }
  };

  const downloadTemplate = async () => {
    setTemplateError(null);
    try {
      await downloadFile('/admin/products/import/template', 'shopverse-products-template.xlsx');
    } catch (err) {
      setTemplateError(err.message);
    }
  };

  const changes = preview && preview.summary.products.create + preview.summary.products.update + preview.summary.categories.create + preview.summary.categories.update;
  const requestError = error && error.status !== 422 ? getErrorMessage(error) : null;

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="size-4" /> Products
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Import products from Excel</h1>
        <p className="text-sm text-slate-500">
          Add or update many products at once. Existing products (same handle) are updated, never duplicated.
        </p>
      </div>

      <Step number={1} title="Download the template">
        <p className="text-sm text-slate-600">
          One row per variant. Rows with the same <b>Handle</b> are one product. Hover a column header in Excel for help.
        </p>
        <Button variant="secondary" onClick={downloadTemplate} className="mt-3">
          <Download className="size-4" /> Download template
        </Button>
        {templateError && <ErrorState message={templateError} />}
      </Step>

      <Step number={2} title="Upload your file and check it">
        <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            <FileSpreadsheet className="size-4" /> {file ? 'Choose another file' : 'Choose .xlsx file'}
          </Button>
          {file && (
            <span className="text-sm text-slate-700">
              {file.name} <span className="text-slate-400">({Math.ceil(file.size / 1024)} KB)</span>
            </span>
          )}
          <Button onClick={check} disabled={!file} loading={checking}>
            Check file
          </Button>
        </div>
        {fileError && <ErrorState message={fileError} />}
        {requestError && <ErrorState message={requestError} />}
        {preview && <PreviewResult result={preview} />}
      </Step>

      <Step number={3} title="Import">
        {done ? (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Import complete</p>
              <p>{summaryText(done.summary)}</p>
              <Link to="/products" className="mt-2 inline-block font-medium underline">
                View products
              </Link>
            </div>
          </div>
        ) : preview && preview.errorCount === 0 && changes > 0 ? (
          <Button onClick={confirm} loading={isLoading && !checking}>
            <Upload className="size-4" /> Import {preview.summary.products.create + preview.summary.products.update} products
          </Button>
        ) : (
          <p className="text-sm text-slate-500">
            {preview && preview.errorCount > 0
              ? 'Fix the problems listed above in your file, then check it again.'
              : preview
                ? 'Nothing to import: everything in the file is already up to date.'
                : 'Check a file first. Nothing is saved until you press Import.'}
          </p>
        )}
      </Step>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-2 flex items-center gap-2 font-semibold">
        <span className="flex size-6 items-center justify-center rounded-full bg-brand-600 text-xs text-white">{number}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

const summaryText = ({ categories, products, variants }) =>
  [
    `${products.create} new and ${products.update} updated products`,
    `${variants.create} new and ${variants.update} updated variants`,
    categories.create || categories.update ? `${categories.create} new and ${categories.update} updated categories` : null,
  ]
    .filter(Boolean)
    .join(', ');

const ACTION_STYLE = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  unchanged: 'bg-slate-100 text-slate-600',
};

function PreviewResult({ result }) {
  const [showAll, setShowAll] = useState(false);
  const products = showAll ? result.products : result.products.slice(0, 25);
  return (
    <div className="mt-4 space-y-4">
      {result.errorCount > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="flex items-center gap-2 font-semibold text-red-800">
            <XCircle className="size-5" /> {result.errorCount} {result.errorCount === 1 ? 'problem' : 'problems'} to fix. Nothing was saved.
          </p>
          <ProblemTable rows={result.errors} />
          {result.errorCount > result.errors.length && (
            <p className="mt-2 text-xs text-red-700">Showing the first {result.errors.length}. Fix these and check again.</p>
          )}
        </div>
      ) : (
        <p className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">
          <CheckCircle2 className="size-5" /> The file is valid: {summaryText(result.summary)}.
        </p>
      )}

      {result.warnings.length > 0 && (
        <details className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <summary className="flex cursor-pointer items-center gap-2 font-medium">
            <AlertTriangle className="size-4" /> {result.warnings.length} notes (won&apos;t stop the import)
          </summary>
          <ProblemTable rows={result.warnings} />
        </details>
      )}

      {result.products.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Variants</th>
                <th className="px-3 py-2">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.handle}>
                  <td className="px-3 py-2">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.handle}</p>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{p.category}</td>
                  <td className="px-3 py-2 text-slate-600">{p.variants}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_STYLE[p.action]}`}>
                      {{ create: 'New', update: 'Update', unchanged: 'No change' }[p.action]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.products.length > 25 && (
            <button type="button" onClick={() => setShowAll(!showAll)} className="w-full border-t border-slate-200 py-2 text-sm text-brand-600 hover:bg-slate-50">
              {showAll ? 'Show fewer' : `Show all ${result.products.length} products`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ProblemTable({ rows }) {
  return (
    <table className="mt-2 w-full text-left text-sm">
      <thead className="text-xs uppercase opacity-70">
        <tr>
          <th className="py-1 pr-3">Sheet</th>
          <th className="py-1 pr-3">Row</th>
          <th className="py-1 pr-3">Column</th>
          <th className="py-1">Problem</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="align-top">
            <td className="py-1 pr-3">{r.sheet}</td>
            <td className="py-1 pr-3 tabular-nums">{r.row}</td>
            <td className="py-1 pr-3 whitespace-nowrap">{r.column}</td>
            <td className="py-1">{r.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
