import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { company } from '@/lib/data';
import { archivo, plexMono } from '@/lib/fonts';

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default:
      'ORVIX LLC | Export & Trading Company for Filtration Media, LECA, Cat Litter & Industrial Adsorbents',
    template: '%s | ORVIX LLC',
  },
  description:
    'ORVIX LLC is a Raleigh-based export and trading company supplying cat litter, LECA, silica sand, white pebbles, brown pebbles, bleaching earth, and soap adsorbents across the U.S. and India.',
  // NOTE: canonical is deliberately NOT set here. It used to be `'/'`, which
  // every route inherited, telling search engines that all 13 pages were
  // duplicates of the homepage. Each route now declares its own.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: company.siteUrl,
    email: company.email,
  };

  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
        <a href="#main" className="sr-only-focusable">
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
