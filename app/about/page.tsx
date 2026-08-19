import PageShell from '@/components/PageShell';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'About ORVIX LLC',
  description:
    'Raleigh-based export and trading company supplying filtration media, absorbents, lightweight aggregates, and consumer-ready mineral products to United States and India markets.',
  path: '/about',
});

/**
 * Mission / Vision / Values were three equal cards, which gave a positioning
 * statement, a growth ambition, and a list of principles identical visual weight.
 * The mission is the one a buyer actually needs, so it leads at display size and
 * the other two support it beneath, separated by rules rather than boxed.
 *
 * TODO(karan): confirm. All three are still category statements. What would make
 * this page persuasive is the concrete version: how long ORVIX has been trading,
 * how many shipments or lanes, whether you hold stock or broker, and what a buyer
 * gets from you that they do not get from a competitor. Supply those and this
 * section can carry a real claim instead of an intention.
 */
const supporting = [
  {
    heading: 'Vision',
    body: 'To become a trusted U.S.-based trading partner for filtration media, absorbents, lightweight aggregates, and consumer-ready mineral products across global markets.',
  },
  {
    heading: 'Values',
    body: 'Trust, product clarity, responsible communication, specification-first sourcing, and long-term buyer relationships.',
  },
];

export default function Page() {
  return (
    <PageShell
      title="About ORVIX"
      intro="ORVIX LLC is based in Raleigh, North Carolina, serving United States and India markets first with a long-term global expansion vision."
    >
      <section>
        <h2 className="sr-only">Mission</h2>
        {/* Original mission wording, verbatim. Only its typographic weight changed. */}
        <p className="max-w-[26ch] text-h2 font-semibold leading-[1.14] text-ink">
          To make essential performance materials easier to source, understand, and trade across borders.
        </p>
      </section>

      <section className="border-t border-line-subtle pt-group">
        <h2 className="sr-only">Vision and values</h2>
        <dl className="grid gap-block md:grid-cols-2 md:gap-x-16">
          {supporting.map((item) => (
            <div key={item.heading}>
              <dt className="label">{item.heading}</dt>
              <dd className="mt-element max-w-measure text-lead text-ink-muted">{item.body}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PageShell>
  );
}
