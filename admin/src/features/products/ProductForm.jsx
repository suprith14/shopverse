import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGetCategoriesQuery } from './productsApi';

// The product's own fields (not variants). Used for both "new" and "edit".
// `extra` lets the "new" page put the variants editor inside the same form.
export function ProductForm({ product, submitLabel, saving, onSubmit, extra }) {
  const { data: categories = [] } = useGetCategoriesQuery();
  const [form, setForm] = useState({
    name: product?.name ?? '',
    brand: product?.brand ?? '',
    categoryId: product?.categoryId ?? '',
    description: product?.description ?? '',
    images: product?.images.join('\n') ?? '',
    isActive: product?.isActive ?? true,
  });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const imageList = form.images
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      brand: form.brand.trim() || null,
      categoryId: form.categoryId,
      description: form.description,
      images: imageList,
      isActive: form.isActive,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" name="name" required value={form.name} onChange={(e) => set({ name: e.target.value })} />
          <Input
            label="Brand"
            name="brand"
            value={form.brand}
            onChange={(e) => set({ brand: e.target.value })}
            placeholder="Optional"
          />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Category</span>
          <select
            required
            value={form.categoryId}
            onChange={(e) => set({ categoryId: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Description</span>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Image URLs (one per line, the first is the main image)
          </span>
          <textarea
            required
            rows={3}
            value={form.images}
            onChange={(e) => set({ images: e.target.value })}
            placeholder="https://picsum.photos/seed/my-product/800/800"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-brand-500"
          />
        </label>
        {imageList.length > 0 && (
          <div className="flex gap-2">
            {imageList.map((src) => (
              <img key={src} src={src} alt="" className="size-16 rounded-lg bg-slate-100 object-cover" />
            ))}
          </div>
        )}
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set({ isActive: e.target.checked })} />
          <span>
            <b>Visible in the store.</b> Untick to hide it (products are never deleted, so past orders stay intact).
          </span>
        </label>
      </div>

      {extra}

      <div className="flex justify-end">
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
