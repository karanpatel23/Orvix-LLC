/**
 * Placeholder material swatch.
 *
 * The previous version pulled in a whole second palette (zinc / amber / stone /
 * orange / yellow) unrelated to the brand hues. These are derived from the
 * locked palette only, and differ by weight and angle rather than by hue, so six
 * products read as one family.
 *
 * TODO(karan): real photo. Every one of these should become a photograph of the
 * actual material. Generated atmospheric textures land in Phase 6; anything a
 * buyer could read as a photo of ORVIX stock stays a real photo.
 */

type Material = 'mineral' | 'clay' | 'sand' | 'pebbles' | 'powder';

const surfaces: Record<Material, string> = {
  mineral:
    'bg-[radial-gradient(ellipse_120%_100%_at_20%_10%,rgb(232_226_216/0.22),transparent_60%),linear-gradient(150deg,rgb(255_255_255/0.06),transparent_70%)]',
  clay: 'bg-[radial-gradient(ellipse_110%_90%_at_75%_15%,rgb(198_165_107/0.30),transparent_62%),linear-gradient(150deg,rgb(255_255_255/0.04),transparent_70%)]',
  sand: 'bg-[radial-gradient(ellipse_130%_110%_at_45%_0%,rgb(212_185_138/0.24),transparent_58%),linear-gradient(20deg,rgb(255_255_255/0.05),transparent_65%)]',
  pebbles:
    'bg-[radial-gradient(circle_at_30%_25%,rgb(232_226_216/0.18),transparent_45%),radial-gradient(circle_at_72%_65%,rgb(198_165_107/0.20),transparent_45%)]',
  powder:
    'bg-[linear-gradient(165deg,rgb(212_185_138/0.20),transparent_55%),radial-gradient(ellipse_90%_70%_at_50%_100%,rgb(255_255_255/0.06),transparent_60%)]',
};

export default function ProductVisual({ type }: { type: string }) {
  const surface = surfaces[type as Material] ?? surfaces.mineral;
  return (
    <div
      className={`h-44 rounded-card border border-line-subtle bg-surface-overlay ${surface}`}
      aria-hidden
    />
  );
}
