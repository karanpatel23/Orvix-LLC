import Link from 'next/link';
import ProductVisual from './ProductVisual';

export default function ProductCard({ p, detailed=false }: { p: any; detailed?: boolean }) {
  return <article className='glass rounded-3xl p-5 transition hover:-translate-y-1 hover:border-[#d4b98a]/40'>
    <ProductVisual type={p.visual} />
    <div className='mt-5 space-y-2'>
      <p className='text-xs uppercase tracking-widest text-[#d4b98a]'>{p.label}</p>
      <h3 className='text-2xl'>{p.name}</h3>
      <p className='subtle text-sm'>{p.overview}</p>
      {detailed && <><p className='text-sm'>{p.what}</p><p className='text-sm subtle'><b>Key specs:</b> {p.specs}</p><div className='text-xs subtle'>{p.uses.join(' • ')}</div></>}
      <div className='pt-3 flex flex-wrap gap-3'><Link href={`/products/${p.slug}`} className='rounded-full border border-white/25 px-4 py-2 text-sm'>View Details</Link><Link href='/contact' className='rounded-full bg-[#c6a56b] text-black px-4 py-2 text-sm'>Request Quote</Link></div>
    </div>
  </article>;
}
