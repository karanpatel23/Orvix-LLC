import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/data';

export default function ProductsPage() {
  return <section className='containerX section-pad pt-32'>
    <h1 className='headline !text-5xl'>Specification-driven product catalog</h1>
    <p className='subtle mt-4 max-w-3xl'>From cat litter and LECA to silica sand, pebbles, bleaching earth, and soap adsorbents, ORVIX aligns product options with buyer context and intended use.</p>
    <div className='mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3'>{products.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
  </section>;
}
