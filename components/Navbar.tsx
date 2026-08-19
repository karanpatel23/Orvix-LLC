'use client';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { navLinks } from '@/lib/data';
import Logo from './Logo';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 16); onScroll(); window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll); }, []);

  return <header className='fixed inset-x-0 top-0 z-50 px-4 pt-4'>
    <nav className={`containerX rounded-full transition-all ${scrolled ? 'panel-glass' : 'border-transparent bg-transparent'}`}>
      <div className='flex items-center justify-between px-5 py-2.5 min-h-[56px]'>
        <Link href='/' aria-label='ORVIX home' className='inline-flex items-center'><Logo compact /></Link>
        <div className='hidden lg:flex gap-6 text-sm'>{navLinks.map(i => <Link key={i.href} href={i.href} className='text-ink-muted transition-colors hover:text-ink'>{i.label}</Link>)}</div>
        <div className='flex items-center gap-3'><Button href='/contact' size='sm' className='hidden sm:inline-flex'>Request Quote</Button><button className='lg:hidden rounded-field px-2 py-1' onClick={() => setOpen(v => !v)} aria-label='Toggle menu'>☰</button></div>
      </div>
    </nav>
    <AnimatePresence>{open && <motion.div initial={reduce ? false : { opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? {} : { opacity: 0, y: -10 }} className='containerX mt-2 panel p-element lg:hidden'>{navLinks.map(i => <Link key={i.href} href={i.href} className='block rounded-field px-3 py-2 hover:bg-surface-overlay' onClick={() => setOpen(false)}>{i.label}</Link>)}</motion.div>}</AnimatePresence>
  </header>;
}
