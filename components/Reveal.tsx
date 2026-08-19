'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Motion island.
 *
 * app/page.tsx was `'use client'` in its entirety purely so it could call
 * framer-motion for two entrance animations and a stagger. That shipped the
 * whole homepage as a Client Component, cost the RSC boundary, and meant the
 * page could not export metadata (Client Components cannot), so the homepage was
 * the only route without its own canonical.
 *
 * Isolating motion in a leaf lets the page be a Server Component again while the
 * animation behaviour stays identical.
 *
 * `mode="enter"` animates on mount, for above-the-fold content.
 * `mode="scroll"` animates once on entering the viewport.
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
  const reduce = useReducedMotion();
  const from = reduce ? false : { opacity: 0, y };
  const to = { opacity: 1, y: 0 };
  const transition = { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const };

  if (mode === 'enter') {
    return (
      <motion.div initial={from} animate={to} transition={transition} className={className}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={from}
      whileInView={to}
      viewport={{ once: true, amount: 0.25 }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
