import Link from 'next/link';
import Logo from './Logo';
import { company, navLinks, legalDisclaimer } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="mt-group border-t border-line-subtle py-group">
      <div className="containerX grid gap-block text-sm md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-element text-ink-muted">{company.location}</p>
          <a href={`mailto:${company.email}`} className="text-accent-soft hover:text-accent-bright">
            {company.email}
          </a>
        </div>
        <nav aria-label="Footer">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-1 text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-spec leading-relaxed text-ink-faint">{legalDisclaimer}</p>
      </div>
    </footer>
  );
}
