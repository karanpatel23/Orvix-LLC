import Button from '@/components/ui/Button';import PageShell from '@/components/PageShell';

import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Industries Served',
  description:
    'Material supply pathways for pet care and retail, horticulture and hydroponics, water filtration, oil and industrial processing, drainage and infrastructure, and government tender supply.',
  path: '/industries',
});

const items=[['Pet Care & Retail','Cat Litter','Retailers, distributors, shelters, bulk/private-label buyers'],['Horticulture & Hydroponics','LECA','Plant users, nurseries, hydroponic suppliers, landscapers'],['Water Filtration','Silica Sand, White Pebbles, Brown Pebbles','Water-treatment firms, municipal buyers, private industrial buyers, tenders'],['Oil & Industrial Processing','Bleaching Earth, Soap Adsorbent, Silica Sand (context-based)','Refiners, oil processors, manufacturers'],['Drainage & Infrastructure','Pebbles, LECA','Contractors, drainage suppliers, municipal/public works teams'],['Government & Tender Supply','Silica Sand, Pebbles, filtration/drainage materials','Procurement teams, public-sector buyers, tender evaluators']];
export default function Page(){return <PageShell title='Industries Served' intro='ORVIX supports buyer-specific material pathways across consumer, industrial, and procurement environments.'><div className='grid lg:grid-cols-2 gap-5'>{items.map(([n,p,b])=><article key={n} className='panel p-6'><h2 className='text-h4'>{n}</h2><p className='text-ink-muted mt-2'><b>Products:</b> {p}</p><p className='text-ink-muted mt-1'><b>Buyers:</b> {b}</p><div className='mt-4 flex gap-3'><Button href='/products' variant="secondary" size="sm">View Related Products</Button><Button href='/contact' size="sm">Request Quote</Button></div></article>)}</div></PageShell>}
