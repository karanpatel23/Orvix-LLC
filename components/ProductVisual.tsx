export default function ProductVisual({ type }: { type: string }) {
  const styles: Record<string, string> = {
    mineral: 'from-zinc-200/60 via-stone-200/20 to-zinc-500/10',
    clay: 'from-amber-600/50 via-orange-500/20 to-zinc-900/30',
    sand: 'from-yellow-100/60 via-stone-300/25 to-zinc-800/35',
    pebbles: 'from-stone-100/35 via-amber-700/20 to-zinc-900/40',
    powder: 'from-amber-100/40 via-stone-300/20 to-zinc-800/35',
  };
  return <div className={`h-44 rounded-3xl border border-white/10 bg-gradient-to-br ${styles[type] ?? styles.mineral}`} aria-hidden />;
}
