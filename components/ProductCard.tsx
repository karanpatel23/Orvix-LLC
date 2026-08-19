import Button from '@/components/ui/Button';
import ProductVisual from './ProductVisual';
import type { Product } from '@/lib/data';

/**
 * `headingLevel` exists because the same card appears at two different depths.
 * On the homepage it sits under a section h2, so h3 is correct. On /products it
 * is the top-level content under the page h1, where a hardcoded h3 skipped a
 * level and left the page with no h2 at all.
 */
export default function ProductCard({
  p,
  detailed = false,
  headingLevel = 3,
}: {
  p: Product;
  detailed?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = (headingLevel === 2 ? 'h2' : 'h3') as 'h2' | 'h3';
  return (
    <article className="panel-interactive group flex h-full flex-col p-5 hover:border-accent-soft">
      <ProductVisual type={p.visual} />

      <div className="mt-block flex flex-1 flex-col">
        <p className="label">{p.label}</p>
        <Heading className="mt-2 text-h4">{p.name}</Heading>
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
