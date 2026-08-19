/**
 * ORVIX wordmark.
 *
 * Previously this was an <Image> pointing at public/orvix-logo.svg, whose
 * wordmark was an SVG <text> element set in `Inter, Arial, sans-serif`. Inter
 * was never loaded by the site, so it fell back to Arial, and on a machine
 * without Arial it fell back again. The logo therefore rendered differently
 * depending on the viewer's operating system.
 *
 * Worse, the two words were positioned by hardcoded coordinates: ORVIX started
 * at x=65 and LLC at x=250, so the space between them was whatever happened to
 * be left over after the substituted font drew ORVIX. Measured in Chromium that
 * gap came out at 41.3px against a 40px type size, roughly 1.4x the cap height
 * where 0.3-0.5x is normal.
 *
 * It is now composed from the site's own self-hosted Archivo, so the spacing is
 * declared rather than inherited from an accident, and it is real text: it
 * scales cleanly, reads to screen readers, and cannot drift between machines.
 *
 * The mark's geometry is unchanged from the original asset.
 */

export default function Logo({ compact = false }: { compact?: boolean }) {
  const size = compact ? 'text-[1.3125rem]' : 'text-[1.625rem]';
  // Navbar and Footer both render this, so the gradient needs a unique DOM id
  // per instance. Derived from the variant rather than useId() because this is a
  // Server Component. The two call sites use different variants.
  const gradientId = `orvix-mark-${compact ? 'sm' : 'lg'}`;

  return (
    // Real text, so it is readable. The footer instance carries no other label.
    // items-center vertically centres the mark against the whole lockup; the two
    // words are baseline-aligned inside their own group so the suffix sits on the
    // wordmark's baseline rather than near it.
    <span className={`inline-flex items-center font-semibold leading-none ${size}`}>
      <svg
        viewBox="0 0 40 40"
        className="h-[1.15em] w-[1.15em] shrink-0 overflow-visible"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#d8dde3" />
            {/* accent */}
            <stop offset="1" stopColor="#c6a56b" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18.5" stroke={`url(#${gradientId})`} strokeWidth="3" />
        <path d="M4.5 20h31" stroke="#a8afb8" strokeWidth="2" />
      </svg>

      {/*
        #d8dde3 and #a9b0b9 are lockup-only values carried over from the original
        logo asset. They are deliberately NOT in the site token set: they belong
        to the mark, not to the interface.
      */}
      <span className="inline-flex items-baseline">
        {/*
          Tracking is optically set: caps need looser spacing than lowercase.
          The trailing letter-space after the X is cancelled with -mr so the
          measured gap to the suffix is the real optical gap, not tracking.
        */}
        <span className="-mr-[0.11em] ml-[0.5em] bg-gradient-to-r from-[#d8dde3] to-accent bg-clip-text tracking-[0.11em] text-transparent">
          ORVIX
        </span>

        {/*
          0.46em against the wordmark, up from the original 0.35 ratio (14px on
          40px) which rendered at 5.3px in the navbar and sat below the
          legibility floor. The lead-in is tuned to roughly 0.45x cap height; the
          original was 1.4x.
        */}
        <span className="ml-[0.5em] text-[0.46em] font-medium tracking-[0.2em] text-[#a9b0b9]">
          LLC
        </span>
      </span>
    </span>
  );
}
