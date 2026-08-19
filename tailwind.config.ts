import type { Config } from 'tailwindcss';

/**
 * ORVIX design tokens.
 *
 * PALETTE IS LOCKED. Every hex below already existed in the codebase before this
 * refactor. What changed is that each one now has a semantic job instead of being
 * pasted inline, and the neutral steps between them are declared rather than
 * improvised with `white/10`-style alphas.
 *
 * Two previously-dead config colors are back in service: `graphite` (#121418) is
 * now `surface-overlay`, and `stone` (#e8e2d8) is now `ink-bright`.
 *
 * Border alphas are not eyeballed. 0.34 white is the measured minimum that clears
 * WCAG 1.4.11 non-text contrast (3:1) against every surface in this system; the
 * old borders sat at 1.32-2.70:1 and failed everywhere.
 */

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#0b0c0f',
          raised: '#111319',
          overlay: '#121418',
          sunken: '#0d0f13',
        },
        ink: {
          DEFAULT: '#f4f3ef',
          bright: '#e8e2d8',
          muted: '#c8c8c4',
          faint: 'rgb(200 200 196 / 0.62)',
        },
        accent: {
          DEFAULT: '#c6a56b',
          soft: '#d4b98a',
          bright: '#d8bb87',
        },
        line: {
          // 3:1 minimum. Use for anything a user must perceive the edge of:
          // inputs, secondary buttons, focusable cards.
          strong: 'rgb(255 255 255 / 0.34)',
          // Decorative separators only. Exempt from 3:1 because losing them
          // costs no information.
          subtle: 'rgb(255 255 255 / 0.14)',
          hairline: 'rgb(255 255 255 / 0.08)',
        },
        danger: '#f0b8a0',
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      /**
       * Type scale with real contrast.
       *
       * The old scale ran 14px body to 48px heading with nothing at 18px, and
       * `.headline`'s responsive steps were overridden by `!text-5xl` on 6 of 7
       * pages. Body moves up to 16/18px, display goes properly large, and every
       * size carries its own line-height and tracking.
       */
      /**
       * Display sizes are fluid via clamp() rather than responsive variants.
       * The old `.headline` declared `text-4xl sm:text-6xl lg:text-7xl` and then
       * had it overridden by `!text-5xl` on 6 of 7 pages, so interior headings
       * were a flat 48px at every breakpoint. Fluid sizing means a heading
       * cannot be left un-scaled by forgetting a breakpoint variant.
       */
      fontSize: {
        'label': ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.16em' }],
        'spec': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.55' }],
        'base': ['1rem', { lineHeight: '1.65' }],
        'lead': ['1.125rem', { lineHeight: '1.6' }],
        'lead-lg': ['clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem)', { lineHeight: '1.5' }],
        'h4': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h3': ['clamp(1.5rem, 1.35rem + 0.6vw, 1.75rem)', { lineHeight: '1.22', letterSpacing: '-0.015em' }],
        'h2': ['clamp(1.875rem, 1.45rem + 1.9vw, 2.5rem)', { lineHeight: '1.14', letterSpacing: '-0.022em' }],
        'h1': ['clamp(2.25rem, 1.6rem + 2.9vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.028em' }],
        'display': ['clamp(2.75rem, 1.85rem + 4vw, 4.75rem)', { lineHeight: '1.04', letterSpacing: '-0.034em' }],
        'display-xl': ['clamp(3.25rem, 2rem + 5.6vw, 6.5rem)', { lineHeight: '1.0', letterSpacing: '-0.04em' }],
      },

      /**
       * Spacing rhythm: section > block > element. The old code had 35 distinct
       * spacing values and no rule about which applied where.
       */
      spacing: {
        'gutter': '1.25rem',
        'element': '0.75rem',
        'block': '1.75rem',
        'group': '3.5rem',
        'section': '6rem',
        'section-lg': '9rem',
      },

      /**
       * One radius language. The old code mixed 5 radii at random
       * (full / 3xl / 2xl / xl / md).
       *
       * The rule: interactive controls are pill, surfaces are `card`, inputs are
       * `field`. Nothing else.
       */
      borderRadius: {
        field: '0.625rem',
        card: '1rem',
        panel: '1.5rem',
      },

      /**
       * Elevation is borders first. Where a shadow is used it is tinted with the
       * accent hue rather than being black at 10%.
       */
      boxShadow: {
        raised: '0 1px 0 0 rgb(255 255 255 / 0.05) inset, 0 12px 32px -12px rgb(0 0 0 / 0.6)',
        accent: '0 10px 40px -12px rgb(198 165 107 / 0.35)',
      },

      maxWidth: {
        measure: '68ch',
        'measure-tight': '52ch',
      },

      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
