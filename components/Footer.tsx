import Link from 'next/link';
import { company, navLinks, legalDisclaimer } from '@/lib/data';

export default function Footer() {
  return <footer className='mt-24 border-t border-white/10 py-14'>
    <div className='containerX grid gap-8 md:grid-cols-3 text-sm'>
      <div><p className='text-lg'>{company.name}</p><p className='subtle'>Raleigh, NC</p><a href={`mailto:${company.email}`} className='text-[#d4b98a]'>{company.email}</a></div>
      <div>{navLinks.map((i) => <Link key={i.href} href={i.href} className='block py-1 subtle hover:text-white'>{i.label}</Link>)}</div>
      <p className='subtle text-xs leading-relaxed'>{legalDisclaimer}</p>
    </div>
  </footer>;
}
