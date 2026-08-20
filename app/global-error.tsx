'use client';

import { useEffect } from 'react';
import './globals.css';
import { archivo, plexMono } from '@/lib/fonts';

const DIRECT_EMAIL = 'info@orvixllc.com';

/**
 * Root error boundary.
 *
 * This fires when the root layout itself fails, so it REPLACES the layout: no
 * Navbar, no Footer, and it must render its own <html> and <body>. The font
 * variables and globals.css are applied here directly for the same reason.
 *
 * Deliberately plainer than app/error.tsx. If the layout could not render, the
 * design system may be part of what is broken, so this page leans on tokens that
 * degrade to readable defaults and does not depend on any shared component.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        level: 'error',
        ts: new Date().toISOString(),
        event: 'client.root_error',
        digest: error.digest,
        message: error.message,
      })
    );
  }, [error]);

  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className="bg-surface-base text-ink">
        <main className="containerX flex min-h-[100dvh] flex-col justify-center py-section">
          <p className="label">Something went wrong</p>

          <h1 className="text-h1 mt-4 max-w-[20ch]">The site didn&rsquo;t load.</h1>

          <p className="prose-measure mt-6">
            This is a fault on our side. Reloading usually clears it. If it persists, email{' '}
            <a href={`mailto:${DIRECT_EMAIL}`} className="text-accent-soft">
              {DIRECT_EMAIL}
            </a>
            .
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3.5
                         font-medium text-surface-base transition-colors hover:bg-accent-bright
                         active:translate-y-[1px]"
            >
              Reload
            </button>
          </div>

          {error.digest && (
            <div className="mt-group border-t border-line-subtle pt-block">
              <p className="label text-ink-faint">Reference</p>
              <p className="spec mt-1 select-all">{error.digest}</p>
            </div>
          )}
        </main>
      </body>
    </html>
  );
}
