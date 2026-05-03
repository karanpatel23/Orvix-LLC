import Link from 'next/link';
import ProductVisual from './ProductVisual';

export default function ProductCard({ p }: { p: any }) {
  return <article className='glass rounded-3xl p-5 transition hover:-translate-y-1 hover:border-[#d4b98a]/40'>
    <ProductVisual type={p.visual} />
    <div className='mt-5 space-y-2'>
      <p className='text-xs uppercase tracking-widest text-[#d4b98a]'>{p.segment}</p>
      <h3 className='text-2xl'>{p.name}</h3>
      <p className='subtle text-sm'>{p.overview}</p>
      <div className='flex flex-wrap gap-2 pt-2'>{p.buyers.slice(0, 3).map((b: string) => <span key={b} className='rounded-full border border-white/15 px-3 py-1 text-xs'>{b}</span>)}</div>
      <Link href={`/products/${p.slug}`} className='inline-block pt-2 text-[#d4b98a]'>View Product →</Link>
    </div>
  </article>;
}
