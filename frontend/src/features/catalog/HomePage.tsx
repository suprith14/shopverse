import { Link } from 'react-router';
import { ArrowRight, BookOpen, Footprints, Lamp, Smartphone, type LucideIcon } from 'lucide-react';
import { ErrorState, Spinner } from '@/components/ui/States';
import { useCategories, useProducts } from './catalog.api';
import { ProductCard } from './components/ProductCard';

const categoryIcons: Record<string, LucideIcon> = {
  sneakers: Footprints,
  electronics: Smartphone,
  books: BookOpen,
  'home-decor': Lamp,
};

export function HomePage() {
  const categories = useCategories();
  const topRated = useProducts({ sort: 'rating', page: 1 });

  return (
    <div className="space-y-14">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-brand-700 to-brand-500 px-8 py-16 text-white md:px-14">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-100">New season</p>
        <h1 className="mt-3 max-w-xl text-4xl font-bold leading-tight md:text-5xl">
          Everything you love, in one place.
        </h1>
        <p className="mt-4 max-w-lg text-brand-100">
          Sneakers, gadgets, books and home decor, all with fast checkout and AI-powered recommendations.
        </p>
        <Link to="/shop" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-slate-900 hover:bg-brand-50">
          Start shopping <ArrowRight className="size-4" />
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Shop by category</h2>
        {categories.isLoading && <Spinner />}
        {categories.isError && <ErrorState error={categories.error} />}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.data?.map((c) => {
            const Icon = categoryIcons[c.slug] ?? BookOpen;
            return (
              <Link key={c.id} to={`/shop?category=${c.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand-500 hover:shadow-md">
                <Icon className="size-8 text-brand-600" />
                <h3 className="mt-4 font-semibold">{c.name}</h3>
                <p className="text-sm text-slate-500">{c._count.products} products</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">Featured products</h2>
          <Link to="/shop" className="text-sm font-medium text-brand-600 hover:underline">View all</Link>
        </div>
        {topRated.isLoading && <Spinner />}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {topRated.data?.items.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
