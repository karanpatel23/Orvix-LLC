'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

const DIRECT_EMAIL = 'info@orvixllc.com';

/**
 * Route-level error boundary.
 *
 * Next's default is an unstyled stack-trace screen in development and a bare
 * "Application error" in production, with no way forward and no way to report it.
 *
 * `digest` is the hash Next assigns to a server error; it appears in the Vercel
 * logs for the same request, so surfacing it turns "the site broke" into a
 * message that can actually be traced back to a log line.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Matches the structured shape lib/logger.ts writes on the server, so client
    // and server error lines can be searched the same way.
    console.error(
      JSON.stringify({
        level: 'error',
        ts: new Date().toISOString(),
        event: 'client.render_error',
        digest: error.digest,
        message: error.message,
      })
    );
  }, [error]);

  return (
    <section className="containerX hero-pad">
      <p className="label">Something went wrong</p>

      <h1 className="text-h1 mt-4 max-w-[20ch]">This page didn&rsquo;t load.</h1>

      <p className="prose-measure mt-6">
        The problem is on our side, not yours. Trying again often clears it. If it keeps
        happening, email{' '}
        <a
          href={`mailto:${DIRECT_EMAIL}`}
          className="text-accent-soft transition-colors hover:text-accent-bright"
        >
          {DIRECT_EMAIL}
        </a>{' '}
        and we will pick it up directly.
      </p>

      <div className="mt-8 flex flex-wrap gap-element">
        <Button onClick={reset} size="lg">
          Try again
        </Button>
        <Button href="/" variant="secondary" size="lg">
          Back to home
        </Button>
      </div>

      {error.digest && (
        <div className="mt-group border-t border-line-subtle pt-block">
          <p className="label text-ink-faint">Reference</p>
          <p className="spec mt-1 select-all">{error.digest}</p>
          <p className="mt-2 text-sm text-ink-muted">
            Quote this reference if you get in touch. It identifies the exact failure in our
            logs.
          </p>
        </div>
      )}
    </section>
  );
}
