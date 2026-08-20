import Link from 'next/link';
import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import { company, navLinks, products } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Page not found',
  // No `robots` key here on purpose: Next already emits <meta name="robots"
  // content="noindex"> for not-found, and declaring it again produced two
  // conflicting robots tags in the served HTML.
};

/**
 * 404.
 *
 * Next's default was shipping: unstyled, centred, "404: This page could not be
 * found." on a white screen with no navigation off it.
 *
 * A dead URL on this site is most often an old product path, so the page routes
 * rather than apologises: every material is one click away, and the direct email
 * is there for anyone who arrived from a quote or a document.
 */
export default function NotFound() {
  return (
    <section className="containerX hero-pad">
      <p className="label">Error 404</p>

      <h1 className="text-h1 mt-4 max-w-[18ch]">This page isn&rsquo;t here.</h1>

      <p className="prose-measure mt-6">
        The address may have changed, or the link that brought you here may be out of date.
        Everything ORVIX supplies is listed below.
      </p>

      <div className="mt-8 flex flex-wrap gap-element">
        <Button href="/products" size="lg">
          Browse Products
        </Button>
        <Button href="/contact" variant="secondary" size="lg">
          Request a Quote
        </Button>
      </div>

      <div className="mt-group grid gap-group border-t border-line-subtle pt-group md:grid-cols-2">
        <div>
          <h2 className="label">Materials</h2>
          <ul className="mt-element space-y-1">
            {products.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/products/${product.slug}`}
                  className="text-ink-muted transition-colors hover:text-accent-soft"
                >
                  {product.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="label">Pages</h2>
          <ul className="mt-element space-y-1">
            {navLinks
              .filter((item) => item.href !== '/')
              .map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink-muted transition-colors hover:text-accent-soft"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
          </ul>

          <p className="mt-block text-sm text-ink-muted">
            Looking for something specific?{' '}
            <a
              href={`mailto:${company.email}`}
              className="text-accent-soft transition-colors hover:text-accent-bright"
            >
              {company.email}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
