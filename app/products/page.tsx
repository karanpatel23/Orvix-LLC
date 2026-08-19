import ProductCard from '@/components/ProductCard';import PageShell from '@/components/PageShell';import { products } from '@/lib/data';

import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Products',
  description:
    'Specification-first catalog of cat litter, LECA, silica sand, white and brown pebbles, bleaching earth, and soap adsorbent for distributors, industrial buyers, and procurement teams.',
  path: '/products',
});

export default function ProductsPage(){return <PageShell title='Products' intro='A deeper specification-first catalog designed for serious buyers, distributors, and procurement teams.'><div className='grid gap-6 md:grid-cols-2'>{products.map(p=><ProductCard key={p.slug} p={p} detailed />)}</div></PageShell>}
