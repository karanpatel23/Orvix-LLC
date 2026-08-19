import { Archivo, IBM_Plex_Mono } from 'next/font/google';

/**
 * Type system.
 *
 * Archivo is a grotesque drawn for dense industrial and print use. Its variable
 * `wdth` axis gives a genuinely wide display cut, so headlines get presence from
 * width rather than from sheer size.
 *
 * IBM Plex Mono carries specification data only: mesh ranges, SiO2 bands, MOQ,
 * pellet sizes. On this site those numbers are the product, so tabular figures
 * and a monospaced grid are functional, not decorative.
 *
 * Both are self-hosted by next/font at build time. Nothing is fetched from
 * Google at runtime, which also keeps the CSP's font-src on 'self'.
 */

export const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  axes: ['wdth'],
  variable: '--font-sans',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});
