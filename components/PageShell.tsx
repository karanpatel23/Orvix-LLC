import { ReactNode } from 'react';

export default function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="containerX section-pad page-offset">
      <header className="max-w-measure">
        <h1 className="text-h1">{title}</h1>
        {intro && <p className="prose-measure mt-block">{intro}</p>}
      </header>
      <div className="mt-group space-y-block">{children}</div>
    </section>
  );
}
