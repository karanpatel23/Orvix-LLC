import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/**
 * The one button.
 *
 * Before this, the "Request Quote" / "Request Specification" pill pair was
 * hand-written in 10 places across 8 files, which meant every hover, focus,
 * active and disabled state had to be fixed 10 times. It never was, so most of
 * them had none.
 */

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ' +
  'transition-[background-color,border-color,color,transform] duration-200 ease-out ' +
  'active:translate-y-[1px] ' +
  'disabled:pointer-events-none disabled:opacity-55 disabled:active:translate-y-0';

const variants: Record<Variant, string> = {
  // black on #c6a56b measures 9.00:1
  primary: 'bg-accent text-surface-base hover:bg-accent-bright',
  // border-line-strong is the 3:1-compliant alpha
  secondary: 'border border-line-strong text-ink hover:border-accent-soft hover:text-accent-soft',
  ghost: 'text-ink-muted hover:text-ink',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-6 py-3.5 text-base',
};

function classes(variant: Variant, size: Size, className?: string) {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(' ');
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsLink = CommonProps & { href: string } & Omit<
    ComponentProps<typeof Link>,
    'href' | 'className' | 'children'
  >;

type ButtonAsButton = CommonProps & { href?: never } & Omit<
    ComponentProps<'button'>,
    'className' | 'children'
  >;

export default function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = 'primary', size = 'md', className, children } = props;

  if ('href' in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={classes(variant, size, className)} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonAsButton;
  return (
    <button type="button" className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
