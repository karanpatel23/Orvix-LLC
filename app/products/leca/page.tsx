import PageShell from '@/components/PageShell';
import ProductCTA from '@/components/ProductCTA';
import Disclaimer from '@/components/Disclaimer';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'LECA (Lightweight Expanded Clay Aggregate)',
  description:
    'Porous expanded clay media for hydroponics, drainage layers, horticulture, and lightweight fill. Pellet size range, density, moisture profile, and packaging to specification.',
  path: '/products/leca',
});

const steps = [
  'Rinse before use',
  'Use as drainage layer or growing medium',
  'Monitor water level',
  'Pair with nutrients for hydroponic use',
  'Adjust by plant type and environment',
];

// TODO(karan): specs. The "Specification placeholders" disclosure was removed
// from this page. Replace with real figures: grade, size range, moisture
// profile, packaging, MOQ, origin.
export default function Page() {
  return (
    <PageShell
      title="LECA"
      intro="Lightweight expanded clay aggregate for houseplants, hydroponic setups, drainage layers, horticulture projects, and landscaping applications."
    >
      <section>
        <h2 className="text-h4">Using LECA</h2>
        {/* Numbers come from the ordered list, not from hand-typed "1." prefixes. */}
        <ol className="panel mt-element list-inside list-decimal space-y-2 p-block marker:font-mono marker:text-accent-soft">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <ProductCTA />
      <Disclaimer />
    </PageShell>
  );
}
