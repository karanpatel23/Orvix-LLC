import PageShell from '@/components/PageShell';
import Disclaimer from '@/components/Disclaimer';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Export & Trade',
  description:
    'USA-India focused trade support: specification review before quotation, Incoterms-aware communication, bulk shipment coordination, and buyer-specific quote structuring.',
  path: '/export-trade',
});

// TODO(karan): confirm. These describe how ORVIX works rather than what it has
// done. Each becomes far stronger with a concrete fact behind it: which Incoterms
// you actually quote on, which documents you issue yourself vs. coordinate, and
// typical lead time from specification to quotation.
const capabilities = [
  'Documentation-aware process',
  'Incoterms-aware communication',
  'Specification review before quotation',
  'Bulk supply and shipment coordination',
  'Buyer-specific quote structuring by use case',
  'Commercial documentation: proforma invoice, commercial invoice, packing list, and certificate of origin where applicable',
];

export default function Page() {
  return (
    <PageShell
      title="Export & Trade"
      intro="ORVIX supports USA-India focused trade with buyer-specific quoting, specification reviews, and bulk communication workflows."
    >
      <section>
        <h2 className="text-h4">What we handle</h2>
        <ul className="mt-element grid gap-element md:grid-cols-2">
          {capabilities.map((capability) => (
            <li key={capability} className="panel p-block">
              {capability}
            </li>
          ))}
        </ul>
      </section>
      <p className="prose-measure text-sm">
        ORVIX LLC does not provide legal, customs, tax, or regulatory advice. Buyers remain
        responsible for destination-market obligations.
      </p>
      <Disclaimer />
    </PageShell>
  );
}
