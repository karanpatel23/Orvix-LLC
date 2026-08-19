import Button from '@/components/ui/Button';import Disclaimer from '@/components/Disclaimer';import ProductCTA from '@/components/ProductCTA';import PageShell from '@/components/PageShell';

import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Bleaching Earth',
  description:
    'Adsorbent for oil refining and purification workflows. Grade and activity, dosage window, moisture, and packaging selected against buyer process conditions.',
  path: '/products/bleaching-earth',
});

export default function Page(){return <PageShell title='Bleaching Earth' intro='Adsorbent material used in oil refining and purification workflows, selected by process conditions and grade requirements.'><p className='text-ink-muted'>Depending on grade, dosage, and operating conditions, bleaching earth may help reduce color bodies, pigments, chlorophyll, residual soaps/gums, trace metals, and oxidation by-products.</p><p className='text-ink-muted'>Commonly evaluated in edible oil processing and industrial oil purification contexts; final suitability depends on buyer process validation.</p><ProductCTA /><Disclaimer/></PageShell>}
