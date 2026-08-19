import Button from '@/components/ui/Button';import Disclaimer from '@/components/Disclaimer';

import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Silica Sand',
  description:
    'Industrial high-SiO2 silica sand for water treatment, filtration media, and well packing. Mesh distribution, purity band, hardness, and packaging to specification.',
  path: '/products/silica-sand',
});

export default function Page(){return <section className='containerX section-pad pt-32 space-y-6'><h1 className='text-h1'>Silica Sand</h1><p className='text-ink-muted max-w-3xl'>Specification-driven silica sand for water filtration, industrial filtration, well-packing/filter media, and procurement-led projects.</p><p className='panel p-4'>Silica sand suitability depends on grade, particle size, purity, mesh range, and the buyer’s intended use.</p><details className='panel p-4'><summary>Grade & mesh placeholders</summary><p className='text-ink-muted mt-2'>Grade, mesh range, purity band, packaging options, MOQ, origin, and technical documentation on request.</p></details><div className='flex gap-3'><Button href='/contact'>Request Grade & Mesh Details</Button><Button href='/contact' variant="secondary">Request Quote</Button></div><Disclaimer/></section>}
