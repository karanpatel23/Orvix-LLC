import Button from '@/components/ui/Button';import Disclaimer from '@/components/Disclaimer';import PageShell from '@/components/PageShell';

import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Soap Adsorbent',
  description:
    'Industrial adsorbent for residual soap reduction and polishing stages in oil and process streams. Adsorbent type, dosage, and process compatibility to specification.',
  path: '/products/soap-adsorbent',
});

export default function Page(){return <PageShell title='Soap Adsorbent' intro='Separate industrial adsorbent for residual soap reduction and polishing workflows in oil and process streams.'><p className='text-ink-muted'>Suitability depends on oil type, contaminant profile, adsorbent type, process conditions, dosage strategy, and quality targets set by the buyer.</p><p className='text-ink-muted'>Used by refiners and industrial processors seeking tighter process control in downstream polishing stages.</p><div className='flex gap-3'><Button href='/contact'>Request Quote</Button><Button href='/contact' variant="secondary">Request Specification</Button></div><Disclaimer/></PageShell>}
