import Link from 'next/link';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import { products } from '@/lib/data';
import { pageMeta } from '@/lib/seo';

// Now possible because this is a Server Component again: the homepage was the
// only route that could not declare its own canonical.
export const metadata = pageMeta({
  absoluteTitle: true,
  title: 'ORVIX LLC | Filtration Media, LECA, Cat Litter & Industrial Adsorbents',
  description:
    'ORVIX LLC supplies filtration media, absorbents, lightweight aggregates, and consumer-ready materials across the United States and India. Raleigh, North Carolina.',
  path: '/',
});

/**
 * Buyer routes into the catalog.
 *
 * Both the audiences and the buyer descriptions are lifted from the existing
 * /industries mapping rather than written fresh, so this section makes no claim
 * the site was not already making. The old block was three equal cards labelled "Pathway 1/2/3", which
 * is the banned generic-step-label pattern: the number carried the emphasis and
 * the audience carried none.
 */
const routes = [
  {
    audience: 'Home & plant users',
    detail: 'Plant users, nurseries, landscapers, retailers, distributors, and shelters.',
    materials: ['Cat Litter', 'LECA'],
    href: '/products',
  },
  {
    audience: 'Industrial buyers',
    detail: 'Refiners, oil processors, and manufacturers.',
    materials: ['Silica Sand', 'Bleaching Earth', 'Soap Adsorbent'],
    href: '/industries',
  },
  {
    audience: 'Government & procurement teams',
    detail: 'Procurement teams, public-sector buyers, and tender evaluators.',
    materials: ['Silica Sand', 'White & Brown Pebbles'],
    href: '/government-bulk-supply',
  },
];

export default function Home() {
  return (
    <div className="surface-sieve">
      <section className="containerX hero-pad">
        <Reveal mode="enter" y={12}>
          <p className="label">Raleigh, North Carolina · U.S. + India Focus</p>
        </Reveal>
        <Reveal mode="enter" y={18} delay={0.08}>
          <h1 className="text-display mt-4 max-w-5xl">
            Performance Materials. Global Trade. Built on Trust.
          </h1>
        </Reveal>
        <p className="prose-measure mt-6">
          ORVIX LLC supplies filtration media, absorbents, lightweight aggregates, and
          consumer-ready materials across the United States and India.
        </p>
        <div className="mt-8 flex flex-wrap gap-element">
          <Button href="/products" size="lg">
            Explore Products
          </Button>
          <Button href="/contact" variant="secondary" size="lg">
            Request a Quote
          </Button>
        </div>
      </section>

      <section className="containerX section-pad">
        <h2 className="text-h2 font-semibold">
          Materials for homes, industries, and infrastructure.
        </h2>
        <ul className="mt-group grid gap-block md:grid-cols-2 xl:grid-cols-3">
          {products.map((product, index) => (
            <li key={product.slug}>
              <Reveal delay={index * 0.06} y={22} className="h-full">
                <ProductCard p={product} />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/*
        A numbered editorial sequence rather than a third card grid. The section
        above is already a card grid, and repeating the layout family is what makes
        stacked sections read as generated.
      */}
      <section className="containerX section-pad">
        <h2 className="text-h2 font-semibold">Who we supply.</h2>

        <ol className="mt-group divide-y divide-line-subtle border-t border-line-subtle">
          {routes.map((route, index) => (
            <li key={route.audience}>
              <Link
                href={route.href}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3 py-block
                           transition-colors md:grid-cols-[4rem_minmax(0,22rem)_1fr] md:gap-x-10"
              >
                <span aria-hidden="true" className="font-mono text-h3 leading-none text-accent-soft">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="col-start-2">
                  <span className="block text-h4 transition-colors group-hover:text-accent-soft">
                    {route.audience}
                  </span>
                  <span className="mt-2 block text-sm text-ink-muted md:hidden">{route.detail}</span>
                </span>

                <span className="col-span-2 col-start-1 md:col-span-1 md:col-start-3">
                  <span className="hidden text-sm text-ink-muted md:block">{route.detail}</span>
                  <span className="mt-0 block md:mt-3">
                    {route.materials.map((material) => (
                      <span key={material} className="spec mr-4 inline-block text-ink-faint">
                        {material}
                      </span>
                    ))}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
