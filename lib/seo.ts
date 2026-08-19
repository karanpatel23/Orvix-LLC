import type { Metadata } from 'next';
import { company } from './data';

/**
 * Per-route metadata helper.
 *
 * The root layout used to declare `alternates: { canonical: '/' }`, which every
 * child route inherited. That told search engines all 13 pages were duplicates
 * of the homepage. The declaration is gone; this helper makes it cheap for each
 * route to state its own identity so the situation cannot recur by omission.
 *
 * openGraph is included because the site had none at all: pasting a URL into
 * WhatsApp or LinkedIn produced a bare link with no title or description. Images
 * are deliberately absent until Phase 6 generates them.
 */
export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = new URL(path, company.siteUrl).toString();
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: company.name,
      title: `${title} | ${company.name}`,
      description,
      url,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${company.name}`,
      description,
    },
  };
}
