import Button from '@/components/ui/Button';
import ProductVisual from './ProductVisual';
import type { Product } from '@/lib/data';

export default function ProductCard({ p, detailed = false }: { p: Product; detailed?: boolean }) {
  return (
    <article className="panel-interactive group flex h-full flex-col p-5 hover:border-accent-soft">
      <ProductVisual type={p.visual} />

      <div className="mt-block flex flex-1 flex-col">
        <p className="label">{p.label}</p>
        <h3 className="mt-2 text-h4">{p.name}</h3>
        <p className="mt-2 text-sm text-ink-muted">{p.overview}</p>

        {detailed && (
          <>
            <p className="mt-element text-base">{p.what}</p>
            <dl className="mt-element">
              <dt className="label text-ink-faint">Key specs</dt>
              <dd className="spec mt-1">{p.specs}</dd>
            </dl>
            <ul className="mt-element flex flex-wrap gap-x-3 gap-y-1">
              {p.uses.map((use) => (
                <li key={use} className="spec text-ink-faint">
                  {use}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-auto flex flex-wrap gap-element pt-block">
          <Button href={`/products/${p.slug}`} variant="secondary" size="sm">
            View Details
          </Button>
          <Button href="/contact" size="sm">
            Request Quote
          </Button>
        </div>
      </div>
    </article>
  );
}
