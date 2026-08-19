import PageShell from '@/components/PageShell';
import ProductCTA from '@/components/ProductCTA';
import Disclaimer from '@/components/Disclaimer';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Silica Sand',
  description:
    'Industrial high-SiO2 silica sand for water treatment, filtration media, and well packing. Mesh distribution, purity band, hardness, and packaging to specification.',
  path: '/products/silica-sand',
});

// TODO(karan): specs. The "Grade & mesh placeholders" disclosure was removed from
// this page. This is the product where real numbers matter most: buyers search by
// mesh range and SiO2 purity band. Needs grade, mesh distribution, purity band,
// packaging options, MOQ, origin.
export default function Page() {
  return (
    <PageShell
      title="Silica Sand"
      intro="Specification-driven silica sand for water filtration, industrial filtration, well-packing and filter media, and procurement-led projects."
    >
      <section>
        <h2 className="text-h4">Selecting a grade</h2>
        <p className="panel mt-element p-block text-ink-muted">
          Silica sand suitability depends on grade, particle size, purity, mesh range, and the
          buyer&rsquo;s intended use.
        </p>
      </section>
      <ProductCTA />
      <Disclaimer />
    </PageShell>
  );
}
