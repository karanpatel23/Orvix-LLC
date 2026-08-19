import PageShell from '@/components/PageShell';

import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Export & Trade',
  description:
    'USA-India focused trade support: specification review before quotation, Incoterms-aware communication, bulk shipment coordination, and buyer-specific quote structuring.',
  path: '/export-trade',
});

export default function Page(){return <PageShell title='Export & Trade' intro='ORVIX supports USA-India focused trade with buyer-specific quoting, specification reviews, and bulk communication workflows.'><ul className='grid md:grid-cols-2 gap-4'>{['Documentation-aware process','Incoterms-aware communication','Specification review before quotation','Bulk supply and shipment coordination language','Buyer-specific quote structuring by use-case','Commercial documentation placeholders: PI, invoice, packing list, origin certificate if applicable'].map(x=><li key={x} className='panel p-4'>{x}</li>)}</ul><p className='text-ink-muted text-sm'>ORVIX LLC does not provide legal, customs, tax, or regulatory advice. Buyers remain responsible for destination-market obligations.</p></PageShell>}
