import Link from 'next/link';
import type { Category, Sector } from '@co-co-co/types';

export function SectorCard({ sector, categories }: { sector: Sector; categories: Category[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">{sector.name}</h3>
      <p className="mt-1 text-sm text-slate-600">{sector.description}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categories/${category.slug}`}
              className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:border-slate-400 hover:text-slate-900"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
