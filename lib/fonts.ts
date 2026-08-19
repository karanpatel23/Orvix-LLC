import { Archivo, IBM_Plex_Mono } from 'next/font/google';

/**
 * Type system.
 *
 * Archivo is a grotesque drawn for dense industrial and print use. It ships as a
 * variable font, so one file covers the whole 100-900 weight range.
 *
 * IBM Plex Mono carries specification data only: mesh ranges, SiO2 bands, MOQ,
 * pellet sizes. On this site those numbers are the product, so tabular figures
 * and a monospaced grid are functional, not decorative.
 *
 * PAYLOAD DISCIPLINE. Two things were trimmed after measuring what the build
 * actually emits:
 *
 * - Archivo was requested with `axes: ['wdth']` on the theory that headlines
 *   would get presence from width rather than size. Nothing in the codebase ever
 *   set font-stretch, so the width axis was shipping in every subset for no
 *   benefit. If Phase 4 wants a genuinely expanded display cut, add the axis back
 *   deliberately and re-measure.
 * - IBM Plex Mono was requested at weights 400/500/600. Only 400 is referenced
 *   (`.label` and `.spec` set no weight), so 500 and 600 were two thirds of the
 *   mono payload doing nothing.
 *
 * Both are self-hosted by next/font at build time. Nothing is fetched from
 * Google at runtime, which keeps the CSP's font-src on 'self'. next/font also
 * emits a metric-adjusted local fallback (ascent/descent/size-adjust overrides)
 * so the swap does not shift layout.
 */

export const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-mono',
});
