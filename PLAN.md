# ORVIX LLC — Work Plan

Derived from `AUDIT.md`. Each item is tagged:

- **[safe]** — no visitor-visible change, or a strict correctness fix. Low review burden.
- **[needs review]** — changes what a visitor sees, or adds a dependency/service.
- **[risky]** — could regress a page that currently converts, or touches production behaviour.

Items marked **DONE** shipped in the Phase 2 commit. Everything else is proposed.

---

## Inputs still outstanding

These block specific items and are called out inline where they bite.

| # | Needed | Blocks |
|---|---|---|
| 1 | What makes ORVIX different from any other trading company — buyers, sourcing vs. holding, what the India link actually is | Phase 4 copy |
| 2 | Real product photographs, or approval of AI-generated substitutes (see Phase 6) | Phase 4 layout, Phase 6 assets |
| 3 | Whether quote submissions should also land somewhere queryable (DB / CRM / WhatsApp) beyond email | Phase 2 follow-up |

You answered "trading company which deals in the products listed" for #1. That is
a category, not a differentiator, so Phase 4 will place `TODO(karan): confirm`
markers wherever a specific claim belongs rather than inventing one.

---

## Phase 2 — Backend — **DONE**

| Item | Tag | Status |
|---|---|---|
| Fix `package-lock.json` desync so `npm ci` succeeds | [safe] | DONE |
| Env schema with coherence checks; refuse to boot on partial config | [safe] | DONE |
| Bound every string field (`max`), trim all input | [safe] | DONE |
| `try`/`catch` around `req.json()` and delivery; typed error responses | [safe] | DONE |
| Correct status codes: 400 / 405 / 429 / 502 / 503 / 500 | [safe] | DONE |
| Retry delivery once, then persist the lead to a recoverable log line | [safe] | DONE |
| Structured JSON logging on every path, with `requestId` correlation | [safe] | DONE |
| Rate limit: 5 requests / 10 min / client | [needs review] | DONE |
| Honeypot field, answered with an indistinguishable 200 | [safe] | DONE |
| Client: `try`/`catch`, `r.ok` check, per-field errors, success/error states, form reset | [needs review] | DONE |
| `autoComplete` / `type=tel` / `inputMode` on form fields | [safe] | DONE |
| Security headers (CSP, X-Frame-Options, Referrer-Policy, HSTS, Permissions-Policy) | [needs review] | DONE |
| ESLint config so `npm run lint` runs at all | [safe] | DONE |
| Vitest + 131 unit/integration tests | [safe] | DONE |
| Rewrite the E2E test that passed whether or not email worked | [safe] | DONE |
| Keep zod out of the client bundle (`lib/form-options.ts`) | [safe] | DONE |

### Phase 2 follow-ups — NOT done, need your call

| Item | Tag | Note |
|---|---|---|
| Shared-store rate limiting (Upstash / Vercel KV) | [needs review] | The current limiter is per-instance. Serverless spreads requests across instances, so it raises the cost of casual abuse but is not a security boundary. Needs a dependency + an external service. |
| Real lead persistence (Postgres / KV) | [needs review] | Today a failed send writes a `LEAD_RECOVERY` line to Vercel logs. Recoverable, but logs expire. Blocked on input #3. |
| Upgrade `next` past CVE-2025-29927 | [risky] | Breaking major. Own commit, own verification pass. See Phase 8. |
| CI workflow (`.github/workflows`) running lint + typecheck + tests | [safe] | Nothing currently runs on push. Cheap, high value. |
| Delivery alerting (notify on `LEAD_RECOVERY`) | [needs review] | Logging it is only useful if someone looks. |

---

## Phase 3 — Design system

Driven by the installed `design-taste-frontend` / `high-end-visual-design` skills.
**The palette hex values do not change.** Only their application does.

| Item | Tag | Note |
|---|---|---|
| Self-host a real type pairing via `next/font` | [needs review] | Nothing is loaded today; the site renders in the OS UI font. I will propose 2–3 pairings with reasoning before picking. |
| Build a type scale with real contrast | [needs review] | Today: 14px body, one 72px outlier, nothing at 18px, and `.headline`'s responsive scale overridden by `!text-5xl` on 6 of 7 pages. |
| Set line-height per size; cap prose at 65–75ch | [safe] | Body copy currently runs ~95–100 characters per line. |
| Semantic color tokens (`surface`, `surface-raised`, `border-subtle`, `text-muted`, `accent`) derived from the 3 locked hues | [safe] | Replaces 14 inline `bg-[#c6a56b]` literals. `graphite`/`stone`/`champagne` in the Tailwind config are currently defined and never used. |
| Raise border alphas to clear WCAG 3:1 | [safe] | All borders fail today (1.32–2.70:1). Fixable without touching a brand hex. |
| Collapse 5 radii into one language | [needs review] | `rounded-full` / `3xl` / `2xl` / `xl` / `md` are currently assigned at random. |
| Pick one elevation idiom | [needs review] | `.glass` is on 17 elements including bare `<p>` and `<li>`. |
| Spacing rhythm — section > component > element | [safe] | 35 distinct spacing values today with no rule. |
| Authored `:focus-visible` styles | [safe] | None exist; the default ring is near-invisible on `#0b0c0f`. |
| A real `Button` component | [safe] | The CTA pill pair is hand-written in 10 places. |

## Phase 4 — Layout & UX

| Item | Tag | Note |
|---|---|---|
| Break the uniform section rhythm | [risky] | `min-h-[82vh]` on both the hero and `PageShell` forces every page to the same height. This is the single strongest "generated" signal. |
| Redesign the 3-equal-card blocks | [risky] | Home "Pathway 1/2/3" and About "Mission/Vision/Values". |
| Rewrite generic copy | [risky] | "Performance Materials. Global Trade. Built on Trust." Blocked on input #1 — `TODO(karan)` markers, no invented facts. |
| Remove "Specification placeholders" from 4 live pages | [safe] | User-facing on cat-litter, LECA, silica-sand, export-trade. |
| Consolidate the two page shells | [safe] | 4 product pages hand-roll `PageShell` with `pt-32` vs its `119.2px`, an 8.8px shift between pages. |
| Mobile menu: `aria-expanded`, focus trap, Escape-to-close, outside-click | [safe] | None present today. |
| Active nav state | [safe] | `usePathname` is never called. |
| Fix the `/products` h1 → h3 heading jump | [safe] | No h2 on the page. |
| Menu button tap target to ≥44px | [safe] | Currently ~28×28px. |
| Skip-to-content link | [safe] | 7 nav links to tab past on every page. |
| Designed 404 / 500 pages | [needs review] | Next defaults are shipping today. |
| Homepage off `'use client'` | [needs review] | Currently 133 kB vs 87 kB, for two fade-ins. |

## Phase 5 — Motion

Recommendation: **keep `framer-motion` for the mobile menu, move homepage entrances
to CSS.** That reclaims the 46 kB and lets `app/page.tsx` be a server component
again. Say if you want CSS-only everywhere instead.

| Item | Tag |
|---|---|
| CSS entrance animations, transform/opacity only | [safe] |
| Durations 150–300ms UI / ≤500ms entrance, eased | [safe] |
| Scroll reveals 8–16px, trigger once | [safe] |
| Stagger 40–60ms | [safe] |
| `prefers-reduced-motion` on every animation | [safe] |

`useReducedMotion` is already honoured in the two existing animated components —
that part is not broken.

## Phase 6 — Assets, SEO, performance

| Item | Tag | Note |
|---|---|---|
| **Per-route metadata + kill the global canonical** | [safe] | Highest-value item outside Phase 2. `alternates.canonical: '/'` in the root layout de-indexes 12 of 13 pages. |
| OG + Twitter card images | [needs review] | None exist; pasting the URL into WhatsApp/LinkedIn shows a bare link. |
| Full favicon set + `site.webmanifest` | [safe] | None exist at any size. |
| Outline the logo wordmark to paths | [safe] | `orvix-logo.svg` uses `<text>` in Inter, which the site never loads — it renders in Arial, differently per machine. |
| Monochrome logo variant | [safe] | |
| JSON-LD: add LocalBusiness, address, logo | [safe] | Currently name/url/email only. |
| Single source for the base URL | [safe] | Hardcoded in 3 places. |
| **AI-generated product imagery** | [needs review] | See below. |
| Lighthouse before/after | [safe] | |

### On AI-generated product photography

You asked about generating these. It is the right call for *atmosphere* and the
wrong call for *evidence*, so I would split it:

- **Generate** — abstract material textures, macro granule fields, process and
  context imagery, section backgrounds. These carry mood and are honest as
  illustration. The installed `imagegen-frontend-web` skill is built for exactly
  this.
- **Do not generate** — anything a buyer could read as a photograph of *your*
  stock: bagged product with a spec label, a mesh sample beside a ruler, your
  warehouse, your packaging. A procurement buyer who later discovers the sample
  photo was synthetic has a real reason to distrust the specs next to it, and in
  a tender context that is a genuine liability.

**Proposal:** generate the atmospheric layer now so the site stops looking empty,
and reserve labelled product slots for real photographs with a
`TODO(karan): real photo` marker. Every generated image gets a consistent
treatment (duotone in the locked palette, fixed crop ratio) so it reads as
deliberate art direction rather than stock. Tell me if you want it drawn wider or
narrower than that.

## Phase 7 — Verification

Full suite output, `npm run build` clean, Lighthouse before/after, every route at
375/768/1440, keyboard-only walkthrough, palette diff proving the hexes are
unchanged, and the `TODO(karan)` list.

I cannot produce a Vercel preview URL from this environment — you will get the
branch, and Vercel will build the preview when you open it.

## Phase 8 — Next.js upgrade (proposed, separate)

| Item | Tag |
|---|---|
| `next` 14.2.15 → current, plus `eslint-config-next` | [risky] |
| Re-verify the full suite and build against the new major | [risky] |

Kept out of the redesign deliberately: bundling a framework major into visual
commits makes a regression impossible to isolate.

---

## Suggested order

1. **Phase 2** — done, pending your review.
2. **Phase 6 metadata subset** — the canonical fix is [safe] and independently
   valuable; it does not need to wait for the redesign.
3. **Phase 3** — design system, no page-level changes yet.
4. **Phase 4** — layout, section by section, screenshot review between passes.
5. **Phase 5** — motion.
6. **Phase 6** — remaining assets and imagery.
7. **Phase 7** — verification.
8. **Phase 8** — framework upgrade, separately.
