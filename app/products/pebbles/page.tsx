import PageShell from '@/components/PageShell';
import ProductCTA from '@/components/ProductCTA';
import Disclaimer from '@/components/Disclaimer';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'White & Brown Pebbles',
  description:
    'Sized pebbles for drainage layers, filter-bed support, and landscape finishes. Size range, hardness, cleanliness, and color consistency to specification.',
  path: '/products/pebbles',
});

const variants = [
  {
    title: 'White Pebbles',
    body: 'Clean decorative look with filtration and drainage support depending on size and specification.',
  },
  {
    title: 'Brown Pebbles',
    body: 'Natural earth-tone finish with drainage and filter-bed support depending on size and application.',
  },
];

// TODO(karan): specs. Needs real figures per variant: size range, hardness,
// cleanliness, colour consistency, packaging, MOQ.
export default function Page() {
  return (
    <PageShell
      title="White & Brown Pebbles"
      intro="Sized pebbles for drainage layers, filtration support beds, and aesthetic landscape finishes."
    >
      <ul className="grid gap-block md:grid-cols-2">
        {variants.map((variant) => (
          <li key={variant.title} className="panel p-block">
            <h2 className="text-h4">{variant.title}</h2>
            <p className="mt-2 text-ink-muted">{variant.body}</p>
          </li>
        ))}
      </ul>
      <p className="prose-measure">
        Final usage depends on size, hardness, cleanliness, and buyer specifications.
      </p>
      <ProductCTA />
      <Disclaimer />
    </PageShell>
  );
}
