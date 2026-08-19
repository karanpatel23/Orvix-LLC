import PageShell from '@/components/PageShell';
import ProductCTA from '@/components/ProductCTA';
import Disclaimer from '@/components/Disclaimer';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Cat Litter',
  description:
    'Consumer-ready and bulk cat litter for homes, retail channels, shelters, and private-label programs. Absorbency, odor control, clumping behavior, dust profile, and pack size to specification.',
  path: '/products/cat-litter',
});

const cards = [
  {
    title: 'Who it is for',
    body: 'Cat owners, retailers, distributors, shelters, private-label buyers, and bulk procurement teams.',
  },
  {
    title: 'How to choose',
    body: 'Select based on absorbency, odor-control needs, clumping preference, dust tolerance, and packaging format.',
  },
];

// TODO(karan): specs. The "Specification placeholders" disclosure was removed
// from this page; it shipped the word "placeholders" to buyers. Replace with real
// figures: grade/type, granule range, clumping profile, low-dust option,
// packaging, MOQ, origin.
export default function Page() {
  return (
    <PageShell
      title="Cat Litter"
      intro="ORVIX supports cat litter buyers ranging from individual users to retail and bulk supply partners. Available specifications may vary by material, absorbency profile, packaging format, and buyer requirements."
    >
      <ul className="grid gap-block md:grid-cols-2">
        {cards.map((card) => (
          <li key={card.title} className="panel p-block">
            <h2 className="text-h4">{card.title}</h2>
            <p className="mt-2 text-ink-muted">{card.body}</p>
          </li>
        ))}
      </ul>
      <ProductCTA />
      <Disclaimer />
    </PageShell>
  );
}
