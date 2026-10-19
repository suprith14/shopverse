import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/States';
import { formatPrice, getErrorMessage, toCents, toDollars } from '@/lib/format';
import {
  useAddVariantMutation,
  useAdjustStockMutation,
  useDeleteVariantMutation,
  useUpdateVariantMutation,
} from './productsApi';

// Variants of an EXISTING product: every change is saved to the backend immediately.
export function VariantsManager({ product }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <h2 className="font-semibold">Variants & stock</h2>
        <p className="text-sm text-slate-500">
          Stock is changed by adding or removing units (e.g. +10 received, −2 damaged), never by typing a new total, so
          a sale happening at the same moment is never lost.
        </p>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2">SKU</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Price ($)</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {product.variants.map((v) => (
            <VariantRow key={v.id} productId={product.id} variant={v} />
          ))}
        </tbody>
      </table>
      <AddVariantRow productId={product.id} />
    </div>
  );
}

function VariantRow({ productId, variant }) {
  const [name, setName] = useState(variant.name);
  const [price, setPrice] = useState(toDollars(variant.price));
  const [delta, setDelta] = useState('');
  const [update, updateState] = useUpdateVariantMutation();
  const [adjust, adjustState] = useAdjustStockMutation();
  const [remove, removeState] = useDeleteVariantMutation();

  const changed = name !== variant.name || toCents(price) !== variant.price;
  const error = updateState.error ?? adjustState.error ?? removeState.error;
  const deltaNumber = Number(delta);

  const applyStock = async (amount) => {
    await adjust({ productId, variantId: variant.id, delta: amount })
      .unwrap()
      .catch(() => undefined);
    setDelta('');
  };

  return (
    <>
      <tr className="align-top">
        <td className="px-4 py-3 font-mono text-xs text-slate-600">{variant.sku}</td>
        <td className="px-4 py-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Variant name"
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              aria-label="Price in dollars"
              className="w-24 rounded border border-slate-300 px-2 py-1"
            />
            {changed && (
              <Button
                variant="secondary"
                className="px-2 py-1 text-xs"
                loading={updateState.isLoading}
                onClick={() => update({ productId, variantId: variant.id, name, price: toCents(price) })}
              >
                Save
              </Button>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={`w-10 font-semibold ${variant.stock <= 5 ? 'text-amber-700' : ''}`}>{variant.stock}</span>
            <input
              type="number"
              step="1"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="±"
              aria-label="Units to add or remove"
              className="w-16 rounded border border-slate-300 px-2 py-1"
            />
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              loading={adjustState.isLoading}
              disabled={!Number.isInteger(deltaNumber) || deltaNumber === 0}
              onClick={() => applyStock(deltaNumber)}
            >
              {deltaNumber < 0 ? `Remove ${-deltaNumber}` : deltaNumber > 0 ? `Add ${deltaNumber}` : 'Apply'}
            </Button>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <button
            aria-label={`Delete variant ${variant.sku}`}
            title="Delete variant"
            onClick={() => {
              if (confirm(`Delete variant ${variant.sku}?`)) remove({ productId, variantId: variant.id });
            }}
            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={5} className="px-4 pb-3">
            <ErrorState message={getErrorMessage(error)} />
          </td>
        </tr>
      )}
    </>
  );
}

function AddVariantRow({ productId }) {
  const empty = { sku: '', name: '', price: '', stock: '0' };
  const [row, setRow] = useState(empty);
  const [add, { isLoading, error }] = useAddVariantMutation();

  const submit = async () => {
    const ok = await add({
      productId,
      sku: row.sku,
      name: row.name,
      price: toCents(row.price),
      stock: Number(row.stock),
    })
      .unwrap()
      .then(() => true)
      .catch(() => false);
    if (ok) setRow(empty);
  };

  return (
    <div className="space-y-2 border-t border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add a variant</p>
      <div className="flex flex-wrap gap-2">
        <input
          placeholder="SKU"
          value={row.sku}
          onChange={(e) => setRow({ ...row, sku: e.target.value })}
          className="w-40 rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          placeholder="Name, e.g. UK 10 / Red"
          value={row.name}
          onChange={(e) => setRow({ ...row, name: e.target.value })}
          className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          placeholder="Price $"
          type="number"
          min="0.01"
          step="0.01"
          value={row.price}
          onChange={(e) => setRow({ ...row, price: e.target.value })}
          className="w-28 rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          placeholder="Stock"
          type="number"
          min="0"
          step="1"
          value={row.stock}
          onChange={(e) => setRow({ ...row, stock: e.target.value })}
          className="w-20 rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
        <Button variant="secondary" loading={isLoading} disabled={!row.sku || !row.name || !row.price} onClick={submit}>
          Add
        </Button>
      </div>
      {row.price && <p className="text-xs text-slate-500">Customers will see {formatPrice(toCents(row.price))}</p>}
      {error && <ErrorState message={getErrorMessage(error)} />}
    </div>
  );
}
