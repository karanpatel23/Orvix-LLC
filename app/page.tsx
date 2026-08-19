'use client';
import Button from '@/components/ui/Button';
import { motion, useReducedMotion } from 'framer-motion';
import { products } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const reduce = useReducedMotion();
  return <div className='surface-sieve'>
    <section className='containerX section-pad page-offset min-h-[82vh] flex flex-col justify-center'>
      <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className='text-spec uppercase tracking-[0.24em] text-accent-soft'>Raleigh, North Carolina · U.S. + India Focus</motion.p>
      <motion.h1 initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className='text-display mt-4 max-w-5xl'>Performance Materials. Global Trade. Built on Trust.</motion.h1>
      <p className='text-ink-muted mt-6 max-w-2xl'>ORVIX LLC supplies filtration media, absorbents, lightweight aggregates, and consumer-ready materials across the United States and India.</p>
      <div className='mt-8 flex flex-wrap gap-3'><Button href='/products' size="lg">Explore Products</Button><Button href='/contact' variant="secondary" size="lg">Request a Quote</Button></div>
    </section>

    <section className='containerX section-pad'><h2 className='text-h2 font-semibold'>Materials for homes, industries, and infrastructure.</h2><div className='mt-10 grid md:grid-cols-2 xl:grid-cols-3 gap-6'>{products.map((p, i) => <motion.div key={p.slug} initial={reduce ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}><ProductCard p={p} /></motion.div>)}</div></section>

    <section className='containerX section-pad'><div className='grid lg:grid-cols-3 gap-6'>{['For Home & Plant Users','For Industrial Buyers','For Government & Procurement Teams'].map((t,idx)=><div key={t} className='panel p-7'><p className='text-spec text-accent-soft'>Pathway {idx+1}</p><h3 className='mt-2 text-h4'>{t}</h3></div>)}</div></section>
  </div>;
}
