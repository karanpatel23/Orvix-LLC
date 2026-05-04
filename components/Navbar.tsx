'use client';
import Link from 'next/link';
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
    <nav className={`containerX rounded-full transition-all ${scrolled ? 'glass' : 'bg-transparent'}`}>
      <div className='flex items-center justify-between px-5 py-3 min-h-[68px]'>
        <Link href='/' aria-label='ORVIX home' className='inline-flex items-center'><Logo compact /></Link>
        <div className='hidden lg:flex gap-7 text-sm'>{navLinks.map(i => <Link key={i.href} href={i.href} className='hover:text-[#d8bb87]'>{i.label}</Link>)}</div>
        <div className='flex items-center gap-3'><Link href='/contact' className='hidden sm:inline-flex rounded-full bg-[#c6a56b] px-4 py-2 text-sm font-medium text-black'>Request Quote</Link><button className='lg:hidden rounded-md px-2 py-1' onClick={() => setOpen(v => !v)} aria-label='Toggle menu'>☰</button></div>
      </div>
    </nav>
    <AnimatePresence>{open && <motion.div initial={reduce ? false : { opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? {} : { opacity: 0, y: -10 }} className='containerX mt-2 rounded-3xl glass p-4 lg:hidden'>{navLinks.map(i => <Link key={i.href} href={i.href} className='block rounded-xl px-3 py-2 hover:bg-white/5' onClick={() => setOpen(false)}>{i.label}</Link>)}</motion.div>}</AnimatePresence>
  </header>;
}
