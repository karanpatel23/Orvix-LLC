import type { CSSProperties, ReactNode } from 'react';

/**
 * Entrance and scroll reveals.
 *
 * CORRECTNESS NOTE, not a style preference. The previous implementation used
 * framer-motion's `initial={{ opacity: 0 }}`, which is serialised into the
 * server-rendered HTML as `style="opacity:0"`. If JavaScript failed, was blocked,
 * or simply had not hydrated yet, the hero headline and all six product cards
 * were invisible: present in the DOM, unreadable on screen. The original
 * pre-refactor page had the same flaw.
 *
 * This version inverts the default. The element is visible in its base state and
 * the animation only ever moves it *from* hidden *to* visible. Every failure mode
 * now resolves to visible content:
 *
 *   - reduced motion             -> media query never applies, content visible
 *   - no scroll-timeline support -> @supports never applies, content visible
 *   - CSS disabled entirely      -> content visible
 *   - JS disabled                -> irrelevant, this is a Server Component
 *
 * It also drops framer-motion from the homepage, which no longer needs a client
 * boundary for its entrance animations.
 *
 * SCROLL MODE IS CURRENTLY A PASSTHROUGH. A CSS `animation-timeline: view()`
 * reveal was tried and removed: scroll-linked animations are reversible, so
 * scrolling back up re-hid the product cards. The brief asks for reveals that
 * trigger once, which a scroll-linked timeline cannot express. Doing it properly
 * needs an IntersectionObserver that adds a class once and never removes it, plus
 * a pre-paint marker so there is no flash. That is motion architecture and it
 * belongs in Phase 5, not in a layout commit. Until then, scroll content renders
 * plainly and legibly, which is the correct failure direction.
 */
export default function Reveal({
  children,
  mode = 'scroll',
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  mode?: 'enter' | 'scroll';
  delay?: number;
  y?: number;
  className?: string;
}) {
  const style = {
    '--reveal-y': `${y}px`,
    '--reveal-delay': `${delay}s`,
  } as CSSProperties;

  if (mode === 'scroll') {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  return (
    <div className={['reveal-enter', className].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  );
}
