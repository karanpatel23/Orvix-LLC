import { ReactNode } from 'react';

export default function PageShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return <section className='containerX section-pad page-offset min-h-[82vh]'>
    <header className='max-w-4xl'>
      <h1 className='headline !text-5xl'>{title}</h1>
      {intro && <p className='subtle mt-5 text-base leading-relaxed'>{intro}</p>}
    </header>
    <div className='mt-10 space-y-6'>{children}</div>
  </section>;
}
