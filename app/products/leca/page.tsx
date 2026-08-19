import Button from '@/components/ui/Button';import Disclaimer from '@/components/Disclaimer';

import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'LECA (Lightweight Expanded Clay Aggregate)',
  description:
    'Porous expanded clay media for hydroponics, drainage layers, horticulture, and lightweight fill. Pellet size range, density, moisture profile, and packaging to specification.',
  path: '/products/leca',
});

export default function Page(){return <section className='containerX section-pad pt-32 space-y-6'><h1 className='text-h1'>LECA</h1><p className='text-ink-muted max-w-3xl'>Lightweight expanded clay aggregate for houseplants, hydroponic setups, drainage layers, horticulture projects, and landscaping applications.</p><ul className='panel p-4 space-y-2'><li>1. Rinse before use</li><li>2. Use as drainage layer or growing medium</li><li>3. Monitor water level</li><li>4. Pair with nutrients for hydroponic use</li><li>5. Adjust by plant type and environment</li></ul><details className='panel p-4'><summary>Specification placeholders</summary><p className='text-ink-muted mt-2'>Grade, size range, moisture profile, packaging, MOQ, origin, and documentation availability on request.</p></details><div className='flex gap-3'><Button href='/contact'>Request Quote</Button><Button href='/contact' variant="secondary">Request Specification</Button></div><Disclaimer/></section>}
