import type { MetadataRoute } from 'next';
import { company } from '@/lib/data';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: company.name,
    short_name: 'ORVIX',
    description:
      'Export and trading company supplying filtration media, absorbents, lightweight aggregates, and consumer-ready materials.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0c0f',
    theme_color: '#0b0c0f',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
