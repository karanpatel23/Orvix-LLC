import QuoteForm from '@/components/QuoteForm';import PageShell from '@/components/PageShell';

import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Contact & Request a Quote',
  description:
    'Request a quote from ORVIX LLC. Tell us the material, specification, volume, and destination, and we will match the right supply path.',
  path: '/contact',
});

export default function ContactPage(){return <PageShell title='Contact / Request Quote' intro='Tell us what you need. We’ll help match the right material, specification, and supply path.'><div className='max-w-3xl'><QuoteForm /></div><p className='text-ink-muted text-sm'>Prefer direct email? <a className='text-accent-soft' href='mailto:info@orvixllc.com'>info@orvixllc.com</a></p></PageShell>}
