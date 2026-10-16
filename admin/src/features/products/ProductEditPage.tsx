import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorState, Spinner } from '@/components/ui/States';
import { getErrorMessage, toCents } from '@/lib/format';
import { ProductForm } from './ProductForm';
import { VariantsManager } from './VariantsManager';
import { useCreateProductMutation, useGetProductQuery, useUpdateProductMutation } from './productsApi';

// /products/:id: edit an existing product.
export function ProductEditPage() {
  const { id = '' } = useParams();
  const { data: product, isLoading, error } = useGetProductQuery(id);
  const [update, updateState] = useUpdateProductMutation();

  if (isLoading) return <Spinner />;
  if (error || !product) return <ErrorState message={getErrorMessage(error)} />;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:underline"><ArrowLeft className="size-4" /> Products</Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-sm text-slate-500">
            /products/{product.slug} · ⭐ {product.ratingAvg.toFixed(1)} ({product.ratingCount} reviews)
          </p>
        </div>
        {product.isActive && (
          <a href={`http://localhost:5173/products/${product.slug}`} target="_blank" rel="noreferrer">
            <Button variant="secondary"><ExternalLink className="size-4" /> View in store</Button>
          </a>
        )}
      </div>

      {updateState.isSuccess && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Saved.</p>}
      {updateState.error && <ErrorState message={getErrorMessage(updateState.error)} />}

      {/* key: after saving, re-create the form from the fresh product data */}
      <ProductForm key={product.updatedAt} product={product} submitLabel="Save details" saving={updateState.isLoading}
        onSubmit={(input) => update({ id: product.id, ...input })} />

      <VariantsManager product={product} />
    </div>
  );
}

// /products/new: create a product together with its first variants.
export function ProductCreatePage() {
  const navigate = useNavigate();
  const [create, { isLoading, error }] = useCreateProductMutation();
  const [variants, setVariants] = useState([{ sku: '', name: '', price: '', stock: '0' }]);

  const setVariant = (i: number, patch: Partial<(typeof variants)[number]>) =>
    setVariants((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const variantsEditor = (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="font-semibold">Variants</h2>
        <p className="text-sm text-slate-500">Each size/colour/edition customers can pick, with its own SKU, price and starting stock.</p>
      </div>
      {variants.map((v, i) => (
        <div key={i} className="flex flex-wrap gap-2">
          <input required placeholder="SKU" value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} className="w-40 rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input required placeholder="Name, e.g. UK 9 / Black" value={v.name} onChange={(e) => setVariant(i, { name: e.target.value })} className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input required placeholder="Price $" type="number" min="0.01" step="0.01" value={v.price} onChange={(e) => setVariant(i, { price: e.target.value })} className="w-28 rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input required placeholder="Stock" type="number" min="0" step="1" value={v.stock} onChange={(e) => setVariant(i, { stock: e.target.value })} className="w-20 rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <button type="button" disabled={variants.length === 1} onClick={() => setVariants((rows) => rows.filter((_, j) => j !== i))}
            aria-label="Remove variant row" className="rounded p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30">
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" onClick={() => setVariants((rows) => [...rows, { sku: '', name: '', price: '', stock: '0' }])}>
        <Plus className="size-4" /> Add another variant
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:underline"><ArrowLeft className="size-4" /> Products</Link>
      <h1 className="text-2xl font-bold">New product</h1>
      {error && <ErrorState message={getErrorMessage(error)} />}
      <ProductForm submitLabel="Create product" saving={isLoading} extra={variantsEditor}
        onSubmit={async (input) => {
          const product = await create({
            ...input,
            variants: variants.map((v) => ({ sku: v.sku, name: v.name, price: toCents(v.price), stock: Number(v.stock) })),
          }).unwrap().catch(() => null);
          if (product) navigate(`/products/${product.id}`);
        }} />
    </div>
  );
}
