import PageShell from '@/components/PageShell';

import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Government & Bulk Supply',
  description:
    'Procurement-led and large-volume material sourcing: tender quote support, specification and grade matching, documentation-readiness review, and filtration and drainage supply paths.',
  path: '/government-bulk-supply',
});

export default function Page(){return <PageShell title='Government & Bulk Supply' intro='Structured support for procurement-led and large-volume material sourcing.'><div className='grid md:grid-cols-2 gap-4'>{['Bulk product supply planning','Tender quote support workflow','Specification and grade matching','Documentation-readiness review','Filtration media and drainage/infrastructure supply paths','Public/private procurement communication flow'].map(x=><div key={x} className='panel p-4'>{x}</div>)}</div><p className='text-sm text-ink-muted'>ORVIX LLC does not guarantee tender award, government approval, regulatory approval, or procurement eligibility. Outcomes depend on buyer requirements, documentation, and applicable standards.</p></PageShell>}
