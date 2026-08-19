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

const pathways = [
  'For Home & Plant Users',
  'For Industrial Buyers',
  'For Government & Procurement Teams',
];

export default function Home() {
  return (
    <div className="surface-sieve">
      <section className="containerX section-pad page-offset flex min-h-[82vh] flex-col justify-center">
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

      <section className="containerX section-pad">
        <h2 className="sr-only">Buyer pathways</h2>
        <ul className="grid gap-block lg:grid-cols-3">
          {pathways.map((pathway, index) => (
            <li key={pathway} className="panel p-block">
              <p className="label">Pathway {index + 1}</p>
              <h3 className="mt-2 text-h4">{pathway}</h3>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
