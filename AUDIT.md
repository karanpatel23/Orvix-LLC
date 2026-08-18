# ORVIX LLC — Site Audit (Phase 0)

**Date:** 2026-08-18
**Commit audited:** `903cbe6`
**Scope:** Full repository read. No application code was written or changed.

## How to read this

Everything below was **verified by running it**, not inferred from reading. Where I could
not verify something (rendered appearance, whether an email actually lands in an inbox,
what Vercel's build log says), it is marked **UNVERIFIED** and I say how you can check.

Commands run during this audit: `npm ci`, `npm install`, `npm run typecheck`,
`npm run build`, `npm run lint`, `npm audit`, plus static greps. The working tree was
restored afterward — `npm install` and `next build` both mutate tracked files
(`package-lock.json`, `tsconfig.json`, `next-env.d.ts`) and those mutations were reverted.

---

## 1. Route map

13 pages + 1 API route + 2 metadata routes. All render. All are statically prerendered
except the API route.

| Route | Source | Purpose | In nav? | In sitemap? |
|---|---|---|---|---|
| `/` | `app/page.tsx` | Home / hero | yes | yes |
| `/about` | `app/about/page.tsx` | Mission / Vision / Values | yes | yes |
| `/products` | `app/products/page.tsx` | Catalog index | yes | yes |
| `/products/cat-litter` | own page | Product detail | no — via card | yes |
| `/products/leca` | own page | Product detail | no — via card | yes |
| `/products/silica-sand` | own page | Product detail | no — via card | yes |
| `/products/pebbles` | own page | Product detail | no — via card | yes |
| `/products/bleaching-earth` | own page | Product detail | no — via card | yes |
| `/products/soap-adsorbent` | own page | Product detail | no — via card | yes |
| `/products/bleaching-earth-soap-adsorbent` | own page | **Legacy 308 redirect** → `/products/bleaching-earth` | no | **no** |
| `/industries` | `app/industries/page.tsx` | 6 industry cards | yes | yes |
| `/export-trade` | `app/export-trade/page.tsx` | Trade capability list | yes | yes |
| `/government-bulk-supply` | own page | Procurement list | yes | yes |
| `/contact` | `app/contact/page.tsx` | Quote form | yes | yes |
| `POST /api/contact` | `app/api/contact/route.ts` | Quote submission | n/a | n/a |
| `/robots.txt` | `app/robots.ts` | generated | n/a | n/a |
| `/sitemap.xml` | `app/sitemap.ts` | generated | n/a | n/a |

**Notes**

- Nav carries **7 top-level items**, one of which is "Government & Bulk Supply" (23 chars).
  Desktop nav is `hidden lg:flex gap-7 text-sm` — crowding at the `lg` breakpoint is likely.
  **UNVERIFIED** (needs a browser at 1024px).
- The 6 product detail pages are reachable **only** through `ProductCard` links. There is no
  products submenu.
- **No `not-found.tsx`, `error.tsx`, `global-error.tsx`, or `loading.tsx` anywhere.** The build
  emits `/_not-found` at 873 B — that is Next's unstyled default 404, on a live commercial site.
  A thrown render error shows Next's default error screen.

---

## 2. Component inventory

9 components, 233 lines of TSX total.

| Component | Used by | Verdict |
|---|---|---|
| `Navbar` | layout (global) | one-off, correct place |
| `Footer` | layout (global) | one-off, correct place |
| `Logo` | Navbar, Footer | reused (2) |
| `PageShell` | 7 pages | reused — but only 7 of 12 that should use it |
| `ProductCard` | `/`, `/products` | reused (2), `detailed` variant flag |
| `ProductVisual` | ProductCard | reused via ProductCard only |
| `QuoteForm` | `/contact` | one-off |
| `Disclaimer` | 6 product pages | reused (6) |
| `Field` / `Select` | inside `QuoteForm` | private, not exported |

### Near-duplicates and copy-paste

1. **Two different page shells.** 7 pages use `<PageShell>`; 4 product pages
   (`cat-litter`, `leca`, `pebbles`, `silica-sand`) hand-roll
   `<section className='containerX section-pad pt-32 space-y-6'>` with their own `<h1
   className='headline !text-5xl'>`. This is a literal copy-paste of PageShell's markup with
   a different top offset — see §7 for the resulting 8.8px misalignment.
2. **The CTA pill pair is copy-pasted 6 times.** `Request Quote` (gold) + `Request
   Specification` (outline) appears verbatim in all 6 product pages, plus variants in
   `ProductCard`, `Navbar`, `/industries`, and the home hero. **10 hand-written button
   instances, zero Button component.** Every hover/focus/disabled state has to be fixed in
   10 places.
3. **`<details><summary>Specification placeholders</summary>`** duplicated across
   `cat-litter`, `leca`, `silica-sand` with only the body text differing.
4. **`Card` and `Spec` and `CTA`** are declared as local functions inside
   `app/products/cat-litter/page.tsx` — components defined in a page file, used once,
   duplicating `PageShell`/`Disclaimer` concepts.

---

## 3. API routes, validation, failure handling, logging

There is exactly one handler: `POST /api/contact`. There are **no server actions and no
database** — nothing is persisted anywhere.

### `app/api/contact/route.ts` — full control flow

```
POST /api/contact
  └─ await req.json()          ← NOT wrapped. Malformed body throws → unhandled → 500
  └─ quoteSchema.safeParse()   ← OK, this part is correct
       └─ fail → 400 {message:'Please check required fields and try again.'}
                  ← does not say WHICH field
  └─ await sendQuoteEmail()    ← NOT wrapped. Resend/SMTP throw → unhandled → 500
       └─ {sent:false} → HTTP 200 (!) 'Email delivery is not configured yet…'
       └─ {sent:true}  → HTTP 200 'Thank you…'
```

| Question | Answer |
|---|---|
| What validates input? | `quoteSchema` (zod) in `lib/validations.ts`. Runs on the server. Good. |
| What happens on failure? | Generic 400, or an **unhandled throw → 500** on two paths. |
| Is anything logged? | **No. Zero `console.*` calls exist in the entire repository.** |
| Rate limiting? | None. |
| Honeypot / bot defence? | None. |
| Retry? | None. |
| Persistence fallback? | **None.** |

### The lead-loss path (this is the important one)

`lib/email.ts` returns `{sent:false}` when no email provider env vars are set. The route
turns that into **HTTP 200** with a friendly message. So:

- The visitor fills in 9 fields and sees a calm, successful-looking response.
- No email is sent.
- Nothing is written to disk, a DB, or a log.
- The 200 status means uptime monitoring, Vercel analytics, and error tracking all see success.
- **The lead is gone with no trace and no alarm.**

The same outcome occurs if `RESEND_API_KEY` is set but invalid — except that path throws a
500 instead, which at least shows up in logs, and the user sees a broken form.

`quoteSchema` validation gaps: every string field is `min()` only, with **no `max()`**.
`message` accepts unbounded length; `fullName`, `company`, `quantity` etc. accept
megabyte-scale input. There is no trimming, so `"   "` fails `min(2)` correctly but
`"  a  "` passes as a name. `email` uses zod's `.email()` (permissive). `needSpecs` is
coerced client-side via `fd.needSpecs === 'on'` — fine, but the client is the only place
that happens.

### Client side — `components/QuoteForm.tsx`

```js
const r = await fetch('/api/contact', {...});   // no try/catch
const d = await r.json();                        // throws if body isn't JSON
setMessage(d.message);
setLoading(false);                               // never reached if either line throws
```

- No `try`/`catch`, no `finally`. **Any network failure or non-JSON response leaves the
  button stuck on "Sending…" permanently** with no error shown. The user's only recovery is
  a page reload, which loses all 9 fields.
- `r.ok` is never checked — a 400 and a 200 are handled identically.
- Success and failure both render as the same neutral grey `<p>`. There is no visual
  distinction between "we got it" and "that didn't work".
- On success the form is **not reset** and remains fully editable — nothing stops a
  double-submit.

---

## 4. Environment variables

All env access is in `lib/email.ts` (11 reads). Nothing is validated at startup.

| Variable | Read at | Missing → |
|---|---|---|
| `RESEND_API_KEY` | `lib/email.ts:5` | silently skips Resend branch |
| `CONTACT_FROM_EMAIL` | `lib/email.ts:4` | **silently disables both providers** (both branches require it) |
| `CONTACT_TO_EMAIL` | `lib/email.ts:4` | falls back to `info@orvixllc.com` |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | `lib/email.ts:6` | silently skips SMTP branch |
| `SMTP_PORT` | `lib/email.ts:6` | defaults to 587 |

**The app never crashes on a missing var — it degrades silently, at runtime, on the one
endpoint that carries revenue.** Note the trap: `CONTACT_FROM_EMAIL` is required by *both*
branches, so setting `RESEND_API_KEY` alone — the obvious thing to do — produces a site
that looks configured and silently sends nothing.

`.env.example` documents all 7 keys correctly. There is no `.env` in the repo (good) and no
secret is hardcoded (good).

---

## 5. Test setup

**Present:** Playwright 1.54.1, `playwright.config.ts`, 2 spec files, 4 tests.
**Absent:** any unit test runner. No Vitest, no Jest, no `npm test` script.

| Layer | Status |
|---|---|
| Unit (schemas, `sendQuoteEmail`) | **none** |
| Integration (API route) | **none** |
| E2E | 4 tests, 4 browser projects = 16 runs |
| CI | **none** — no `.github/` directory at all |

### Problems with the tests that exist

1. **The contact test cannot fail meaningfully.** `navigation.spec.ts` asserts:
   ```
   toContainText(/Email delivery is not configured yet|Thank you\./)
   ```
   It passes whether email works or is entirely unconfigured. This is the single most
   important flow on the site and the test greenlights both outcomes.
2. **No test covers the API route directly** — no malformed body, no validation failure, no
   provider error, no status-code assertion.
3. `reuseExistingServer: true` is unconditional. Standard practice is
   `!process.env.CI`; as written, CI can silently test a stale server.
4. `webServer` runs `npm run dev`. E2E therefore never exercises the production build.
5. Tests need no secrets and pass offline today only because the unconfigured path is
   accepted as success (see 1).

---

## 6. Content problems — placeholders, dead links, stock imagery

### Shipped placeholder copy (visible to buyers right now)

| File | Visible text |
|---|---|
| `products/cat-litter` | `<summary>` — **"Specification placeholders"** |
| `products/leca` | `<summary>` — **"Specification placeholders"** |
| `products/silica-sand` | `<summary>` — **"Grade & mesh placeholders"** |
| `export-trade` | list item — **"Commercial documentation placeholders: PI, invoice, packing list, origin certificate if applicable"** |

The word "placeholders" is user-facing on 4 pages of a live B2B trading site. A procurement
buyer evaluating supplier credibility reads this as an unfinished site.

No lorem ipsum, no `TODO`/`FIXME` comments, no dead links (all 13 internal `href`s resolve
to real routes). No `<a>` points off-site except `mailto:`.

### Imagery

**There are no photographs on this site.** Zero. `public/` contains exactly two files, both
SVG (`orvix-logo.svg`, `orvix-mark.svg`).

Every product is represented by `ProductVisual` — a 176px-tall CSS gradient div marked
`aria-hidden`, picked from 5 named gradients (`mineral`, `clay`, `sand`, `pebbles`,
`powder`). A buyer sourcing silica sand by mesh range sees an amber-to-zinc gradient
rectangle. For a materials trading company, **product photography is not decoration — it is
the product evidence**, and it is entirely absent.

Not a stock-photo problem. A no-photo problem, which is worse for this category.

### Brand assets

`orvix-logo.svg` renders the wordmark as an SVG `<text>` element with
`font-family='Inter,Arial,sans-serif'`. **Inter is never loaded by the site** (see §7), so
the logo falls back to Arial — and to whatever the *viewer's* machine substitutes.
**The logo renders differently on different computers.** Text in a logo must be converted to
outline paths. The mark also uses a hardcoded gradient `#d8dde3 → #c6a56b` that exists
nowhere else in the design system.

There is no monochrome variant, no favicon of any kind, no OG image, and no
`site.webmanifest`.

---

## 7. Design system — raw values in use

### Typography

**No webfont is loaded.** There is no `next/font` import anywhere in the repo, and no
`@font-face` in `globals.css`. The entire site renders in Tailwind's default
`ui-sans-serif, system-ui` stack — i.e. the visitor's OS UI font. This is the strongest
single "unstyled" signal on the site.

Raw sizes found, by frequency:

| Class | px | Uses |
|---|---|---|
| `text-sm` | 14 | **16** ← most-used size on the site |
| `text-xs` | 12 | 6 |
| `text-xl` | 20 | 6 |
| `text-5xl` | 48 | 6 |
| `text-2xl` | 24 | 3 |
| `text-base` | 16 | 1 |
| `text-3xl` | 30 | 1 |
| `text-4xl` | 36 | 1 |
| `text-6xl` | 60 | 1 |
| `text-7xl` | 72 | 1 |

Observations:

- **`text-lg` (18px) is never used.** Body copy is 14px almost everywhere.
- `.headline` = `text-4xl sm:text-6xl lg:text-7xl` — but **6 of 7 uses override it with
  `!text-5xl`** via PageShell and the 4 raw pages. The responsive scale it defines is
  effectively dead code; only the homepage uses it as designed.
- So every interior page's H1 is a flat 48px at *every* breakpoint — no responsive scaling.
- The real working range is 14px→48px with a single 72px outlier on one page. Between 20px
  and 48px there is only `text-2xl` (24) and `text-3xl` (30), each used ≤3 times. That is
  the "everything between 16 and 36" compression the brief names.
- Only `.headline` sets `line-height` (`leading-[1.05]`) and `tracking-tight`. **No
  line-height is set for body text anywhere** — 14px text inherits Tailwind's default 1.5.
- **No max measure is set anywhere.** Prose relies on `max-w-3xl` (48rem ≈ 96ch at 14px) and
  `max-w-2xl`/`max-w-5xl`. At `max-w-3xl` with 14px text, line length is roughly **95–100
  characters** — well past the 65–75ch comfortable range.

### Spacing

Raw values, by frequency: `py-3` (16), `px-5` (15), `p-4` (11), `mt-2` (10), `gap-3` (10),
`py-2` (6), `px-4` (6), `gap-4` (6), `space-y-6` (5), `p-5` (4), `p-3` (3), `mb-2` (3),
`gap-6` (3), `py-16` (2), `px-6` (2), `p-6` (2), `mt-10` (2), `mt-4` (2), `mt-5` (2),
`py-24` (1), `p-7` (1), `mt-24` (1), `gap-8` (1), `gap-7` (1), `gap-5` (1) … 35 distinct
values total.

- Section rhythm is `.section-pad` = `py-16 sm:py-24` (64/96px) — used consistently. Good.
- Component padding ranges `p-3 … p-7` with **no rule**: `p-4`, `p-5`, `p-6`, `p-7` all
  appear on visually equivalent cards. `/about` cards are `p-5`, `/industries` cards are
  `p-6`, home "Pathway" cards are `p-7`, `/export-trade` cards are `p-4`.
- Gaps range `gap-3 … gap-8` with the same lack of rule.
- The brief predicted "everything equidistant." The reality is the opposite and equally
  flat: **everything is arbitrary.** There is no scale to violate.

### Radii — 5 competing languages

`rounded-full` (21), `rounded-2xl` /16px (13), `rounded-3xl` /24px (6), `rounded-xl` /12px
(4), `rounded-md` /6px (1).

Cards are `rounded-3xl` on home/products/industries but `rounded-2xl` on
about/export-trade/government and all product pages. Form inputs are `rounded-xl`. The
mobile menu button is `rounded-md`. Nothing decides which is which.

### Elevation

**Borders and translucency, never shadows.** No `shadow-*` class appears anywhere. The
single separator idiom is `.glass` = `border border-white/10 bg-white/[0.04]
backdrop-blur-xl`, applied to **17 elements across 13 files** — every card, the nav, the
mobile menu, the form, and several bare `<p>` and `<li>` elements.

Glassmorphism is the only surface treatment on the site. There is no non-glass card.

### Color — the locked palette, as actually found

| Hex | Uses | Where |
|---|---|---|
| `#c6a56b` | 14 | primary gold — all CTA fills |
| `#d4b98a` | 6 | lighter gold — eyebrow/label text |
| `#0b0c0f` | 2 | page background |
| `#f4f3ef` | 1 | body text |
| `#111319` | 1 | `bg-noise` gradient midpoint |
| `#0d0f13` | 1 | `bg-noise` gradient end |
| `#c8c8c4` | 1 | `.subtle` text |
| `#d8bb87` | 1 | nav hover only |
| `#e8e2d8` | 1 | `stone` — **defined in Tailwind config, never used** |
| `#121418` | 1 | `graphite` — **defined in Tailwind config, never used** |
| `#d8dde3`, `#a8afb8`, `#a9b0b9`, `#d6dbe2` | 1 each | **logo SVG only — not in the site palette** |

Plus Tailwind defaults used raw: `white/5 /10 /20 /25 /30`, `black/20`, and 10 distinct
`zinc/stone/amber/orange/yellow` steps inside `ProductVisual` gradients.

**Findings:**

1. `tailwind.config.ts` defines `graphite`, `champagne`, `stone`. **`graphite` and `stone`
   are never referenced.** `champagne` (`#c6a56b`) is never referenced either — all 14 uses
   are the arbitrary literal `bg-[#c6a56b]`. The theme config is decorative.
2. `#c6a56b` and `#d4b98a` and `#d8bb87` are three near-identical golds with no rule
   distinguishing them.
3. `ProductVisual` introduces a whole second palette (zinc/amber/stone/orange/yellow) that
   has no relationship to the brand hues.
4. There are effectively **3 brand hues and 0 semantic tokens** — no `surface`,
   `surface-raised`, `border-subtle`, `text-muted`, `accent`. Every value is inline.

---

## 8. Accessibility — statically detectable

I computed WCAG contrast ratios rather than estimating them.

### Text contrast — passes, and comfortably

| Pair | Ratio | Needs | |
|---|---|---|---|
| `#f4f3ef` body on `#0b0c0f` | **17.61:1** | 4.5 | PASS |
| `.subtle` `#c8c8c4`@80% on `#0b0c0f` | **7.68:1** | 4.5 | PASS |
| `.subtle` on `.glass` surface | **7.29:1** | 4.5 | PASS |
| `#d4b98a` accent on `#0b0c0f` | **10.34:1** | 4.5 | PASS |
| `#d8bb87` nav hover on `#0b0c0f` | **10.60:1** | 4.5 | PASS |
| black on `#c6a56b` button | **9.00:1** | 4.5 | PASS |

The chosen palette is genuinely good for text. Worth stating plainly: **do not "fix" the
colors for contrast reasons — there is nothing wrong with them.**

### Non-text contrast — fails everywhere (WCAG 2.1 SC 1.4.11)

| Element | Ratio | Needs | |
|---|---|---|---|
| `border-white/10` on `.glass` (all cards) | **1.32:1** | 3.0 | **FAIL** |
| `border-white/20` (form inputs) on input bg | **1.84:1** | 3.0 | **FAIL** |
| `border-white/25` (secondary buttons) | **2.25:1** | 3.0 | **FAIL** |
| `border-white/30` (hero secondary CTA) | **2.70:1** | 3.0 | **FAIL** |

Every border on the site is below the 3:1 threshold for UI component boundaries. The
practical consequence: **the 9 form fields on `/contact` have effectively invisible
edges** (1.84:1, plus a `bg-black/20` fill that is 1.04:1 against the page). A user cannot
tell where the input starts. This is the single worst a11y issue and it sits on the
conversion path.

### Other violations found

| Issue | Location | Detail |
|---|---|---|
| **No focus styles defined** | globals.css | Browser default outline is not removed (good) but no `:focus-visible` style is authored. On a `#0b0c0f` background the default ring is barely visible. |
| **No skip-to-content link** | layout | 7 nav links to tab past on every page. |
| **Mobile menu: no `aria-expanded`** | Navbar:18 | Toggle never announces state. |
| **Mobile menu: no `aria-controls`** | Navbar:18 | No association to the panel. |
| **Mobile menu: no focus trap** | Navbar | Tab escapes into the page behind the open menu. |
| **Mobile menu: no Escape-to-close** | Navbar | Keyboard users cannot dismiss it. |
| **Mobile menu: no outside-click close** | Navbar | Stays open until a link is tapped. |
| **Menu icon is a text glyph** | Navbar:18 | `☰` renders per-font; `aria-label` saves it, but it is not an icon. |
| **No active nav state** | Navbar / Footer | `usePathname` is never called. Nothing indicates the current page. |
| **Heading level jump** | `/products` | `PageShell` h1 → `ProductCard` h3. **No h2 on the page.** |
| **Placeholder duplicates label** | QuoteForm `Field` | `placeholder={label}` on all 8 inputs — redundant, and the placeholder vanishes on focus leaving no in-field cue. |
| **No `autoComplete`** | QuoteForm | `name`, `email`, `tel`, `organization` all missing — browsers cannot autofill a 9-field B2B form. |
| **No `inputMode`/`type='tel'`** | QuoteForm phone | Phone field is `type='text'` — mobile shows an alphabetic keyboard. |
| **No fieldset/legend** | QuoteForm | 9 controls, no grouping. |
| **Error not associated to fields** | QuoteForm | Single `role='status'` message; no `aria-invalid`, no `aria-describedby`, no per-field errors. |
| **`priority` on below-fold image** | Logo, used in Footer | `priority` preloads the footer logo. Lighthouse flags this. |
| **Tap targets** | Navbar:18 | Menu button is `px-2 py-1` on a text glyph ≈ 28×24px. **Below the 44px minimum.** |

Correctly done, for the record: `lang='en'` is set; `<main>` wraps content; all form
controls have real `<label htmlFor>`; the status message uses `role='status'`;
`ProductVisual` is properly `aria-hidden`; the logo has meaningful `alt`; `useReducedMotion`
is honoured in both `Navbar` and `page.tsx`; `viewport={{ once: true }}` is set on scroll
reveals.

---

## 9. Build, toolchain, and dependency health

| Check | Result |
|---|---|
| `npm run build` | **passes** — 20 routes, 87.1 kB shared JS |
| `npm run typecheck` | **passes** — 0 errors |
| `npm ci` | **FAILS — `EUSAGE`** |
| `npm run lint` | **FAILS — never configured** |
| `npm audit` | **9 vulnerabilities — 1 critical, 8 high** |

### `npm ci` is broken

```
npm error `npm ci` can only install packages when your package.json and
npm error package-lock.json are in sync.
npm error Invalid: lock file's @types/nodemailer@8.0.0 does not satisfy @types/nodemailer@6.4.24
```

`package.json` declares `"@types/nodemailer": "^6.4.17"`. `package-lock.json` root
`devDependencies` records `"^8.0.0"` and resolves 8.0.0. Commit `0146004` ("Add
@types/nodemailer to devDependencies") changed `package.json` **without regenerating the
lockfile** — `git show --stat 0146004` confirms it touched one file.

This is the **most recent meaningful change to the repo** and it breaks reproducible
installs. **UNVERIFIED:** whether this has broken your Vercel deploys depends on your
project's install command. Vercel uses `npm ci` when a lockfile is present unless you have
overridden it. If your last 3 commits never deployed, this is why.
**Check: Vercel → Project → Deployments → look for a failed build on `07ea734`.**
Fix is one command: `npm install && git commit package-lock.json`.

### ESLint has never run

There is **no `.eslintrc*`, no `eslint.config.*`, and no `eslintConfig` key in
package.json** — yet `eslint` and `eslint-config-next` are both installed. `npm run lint`
drops into Next's interactive first-run setup wizard ("How would you like to configure
ESLint?") and waits for keyboard input. In CI it hangs or fails. **No lint has ever been
enforced on this codebase.**

### Vulnerabilities

`next@14.2.15` is **critical** — 21 advisories including *Authorization Bypass in Next.js
Middleware* (GHSA-f82v-jwr5-mffw / CVE-2025-29927). This one matters directly: **Phase 2
proposes adding middleware for security headers, and on this version middleware auth checks
are bypassable.** Also `nodemailer` (3 high, incl. improper TLS cert validation in OAuth2
token fetch), `postcss` (4 high), plus `brace-expansion`, `glob`, `js-yaml`, `nanoid`.

Upgrading Next is a breaking change and belongs in its own phase with its own commit.

### Missing repo hygiene

- **No `.gitignore`.** `node_modules/` (417 packages), `.next/`, and `tsconfig.tsbuildinfo`
  are all untracked-but-committable. One `git add -A` publishes them.
- **No `.github/`** — no CI, no PR template, no workflow. Nothing runs on push.
- `.gitkeep` sits at the repo root with 0 bytes and no empty directory to keep.
- `next build` **mutates tracked files** (`tsconfig.json` reformatted + `.next/types` added
  to `include`; `next-env.d.ts` gains a comment). Every developer who builds gets a dirty
  tree. These should be committed once in their post-build form.

---

## 10. SEO and metadata

| Item | Status |
|---|---|
| Per-route `title` / `description` | **None.** Only `app/layout.tsx` has metadata. |
| `canonical` | **`alternates: {canonical: '/'}` is set in the ROOT layout** |
| `openGraph` | **absent** |
| `twitter` card | **absent** |
| OG image | **absent** |
| favicon (any size) | **absent** |
| `site.webmanifest` | **absent** |
| apple-touch-icon | **absent** |
| JSON-LD | Organization only — `name`, `url`, `email`. No address, no logo, no LocalBusiness. |
| `robots.txt` | present, hardcoded URL |
| `sitemap.xml` | present, 13 URLs, hardcoded URL, no `changeFrequency`/`priority` |
| `metadataBase` | correctly set |

Two findings deserve emphasis:

**1. Every page canonicalises to the homepage.** Next merges `alternates.canonical` from the
root layout into every child route that doesn't override it. No route overrides it. So
`/products/silica-sand` currently tells Google *"the canonical version of this page is
`https://www.orvixllc.com/`."* Google will consolidate all 13 pages into one and drop the
rest from the index. Combined with the identical `<title>` on all 13 pages, **the site is
actively instructing search engines to ignore 12 of its 13 pages.** For a company whose
buyers search "silica sand supplier mesh range", this is the costliest bug in the repo after
the lead loss.

**2. No OG tags at all.** Pasting `orvixllc.com` into WhatsApp, LinkedIn, or an email client
produces a bare link with no title card, no image, no description. For a US–India trade
business where WhatsApp is a primary B2B channel, this is a daily, visible cost.

The base URL `https://www.orvixllc.com` is hardcoded in **3 places**
(`lib/data.ts:company.siteUrl`, `app/robots.ts`, `app/sitemap.ts`).

---

## 11. Template / "vibe coded" signals

Measured against the tells named in the brief:

| Tell | Present? | Evidence |
|---|---|---|
| Centered hero, gradient headline | partial | Hero is left-aligned (good). Headline is flat `#f4f3ef`, not gradient (good). |
| **Three equal cards with generic labels** | **yes** | Home §3: "Pathway 1 / 2 / 3" — three `glass rounded-3xl p-7` cards, identical size. `/about`: Mission / Vision / Values, three identical `glass rounded-2xl p-5` cards. |
| "Trusted by" strip, no real logos | no | Not present. |
| Alternating image/text blocks | no | There are no images to alternate. |
| Fat footer | no | 3-column, restrained. |
| **Everything one font** | **yes — worse** | No font is loaded at all; the OS UI font renders everything. |
| **Everything the same radius** | **inverted** | 5 radii assigned at random. |
| **Every section the same height/rhythm** | **yes** | `min-h-[82vh]` is applied to the home hero *and* to `PageShell` — so **every interior page is forced to the same minimum height**, and `/about`, `/export-trade`, `/government-bulk-supply` have far less content than that. Combined with one `section-pad` value, every page has an identical vertical rhythm. |
| **Gradient blobs** | **yes** | `.bg-noise` is not noise — it is two radial-gradient blobs (`rgba(198,165,107,.14)` at 20%/20%, `rgba(214,214,224,.12)` at 80%/0%) over a 3-stop linear gradient. Gold rather than purple-blue, but structurally the same device. |
| **Glassmorphism on things that don't need it** | **yes** | `.glass` on 17 elements including bare `<p>` (silica-sand) and `<li>` (export-trade) — *paragraphs* have backdrop-blur. |
| **Copy that describes a category, not a company** | **yes** | "Performance Materials. Global Trade. Built on Trust." — three abstract nouns, true of any trading company. "To make essential performance materials easier to source, understand, and trade across borders." |
| Icons chosen for availability | n/a | **There are no icons at all.** |

**Additional signals not on the list:**

- **The entire homepage is `'use client'`** solely to use `framer-motion` for two fade-ins
  and a stagger. Cost: **133 kB First Load JS vs 87.3 kB** for the static pages — **+46 kB
  and the loss of RSC streaming on the most important page**, for two entrance animations.
- **Section count.** The homepage has **three** sections: hero, product grid, three cards.
  For a company selling six distinct material categories to four distinct buyer types,
  there is no proof, no process, no specification story, no logistics story, no "who we
  are". Nothing between "here is a headline" and "here is a grid".
- **No visual variation between sections.** All three home sections are
  `containerX section-pad` — same container, same padding, same left alignment, same flat
  background. The brief calls this the strongest generated signal; it is present in full.
- **Interior page top-offset is inconsistent.** `PageShell` uses `.page-offset` =
  `calc(84px + 2.2rem)` = **119.2px**. The 4 hand-rolled product pages use `pt-32` =
  **128px**. Navigating `/products/soap-adsorbent` → `/products/leca` shifts the H1 by
  **8.8px**. Small, but it is exactly the kind of thing that reads as "assembled, not
  designed."
- The home hero is the **only** page with no top offset at all — it relies on
  `min-h-[82vh]` + `justify-center` to keep content clear of the fixed navbar.
  **UNVERIFIED:** needs a browser at 375px to confirm the eyebrow line clears the nav.

---

## The 10 highest-impact problems, ranked

Ranked by **money lost × likelihood × cost to fix**, not by how bad they look.

---

### 1. A submitted quote request can vanish with zero trace and an HTTP 200

`lib/email.ts` returns `{sent:false}` when env vars are absent; the route converts that to
**200 OK** with a polite message. Nothing is logged, stored, retried, or alerted. If
`CONTACT_FROM_EMAIL` is unset — required by *both* provider branches, so setting
`RESEND_API_KEY` alone is not enough — every lead is silently destroyed and every
monitoring signal reads green.

*Why #1:* this is the only revenue path on the site. Every other problem costs you
polish; this one costs you the customer, silently, with no way to find out. **UNVERIFIED —
and you should check this today:** submit the live form and confirm the email arrives. If
it doesn't, you have been losing every inbound lead for as long as the vars have been
wrong.

---

### 2. Every page canonicalises to the homepage

`alternates: { canonical: '/' }` in the root layout is inherited by all 13 routes. Every
page also shares one identical `<title>` and `<meta description>`. You are explicitly
telling Google that `/products/silica-sand`, `/industries`, and every other page are
duplicates of `/`.

*Why #2:* organic search is how a Raleigh trading company gets found for "LECA supplier"
or "bleaching earth exporter". This doesn't rank the pages badly — it **removes them from
the index**. It is also a 20-line fix, which makes the ongoing cost pure waste.

---

### 3. `npm ci` fails — reproducible installs are broken

Lockfile says `@types/nodemailer@8.0.0`; `package.json` says `^6.4.17`. Introduced by the
most recent commit that touched dependencies, which did not regenerate the lockfile.

*Why #3:* this may mean **your last three commits never reached production**. It also
blocks every remaining phase: no CI, no reliable preview builds, no trustworthy test runs
until it is fixed. One command. Should be the first commit of Phase 2.

---

### 4. The form has no error handling on either side

Client: no `try`/`catch`, `r.ok` never checked, `setLoading(false)` unreachable on throw →
**button locked on "Sending…" forever**, all 9 fields lost on reload. Server: `req.json()`
and `sendQuoteEmail()` both unwrapped → malformed body or provider outage returns a raw
500. No rate limit, no honeypot, no `max()` on any string, no logging anywhere in the
repository.

*Why #4:* same revenue path as #1, and the failure is visible and infuriating rather than
silent. A buyer who watches "Sending…" spin does not email you instead — they leave.

---

### 5. No webfont is loaded, and the logo inherits the problem

No `next/font`, no `@font-face`. The site renders in the visitor's OS UI font. Separately,
`orvix-logo.svg` sets `font-family='Inter,…'` for its wordmark — Inter is not loaded, so
**the logo falls back to Arial and renders differently on every machine.**

*Why #5:* the brief is right that typography is the highest-leverage visual change, and
this is the version of that problem where you are not choosing a bad font — you are
choosing none. It also means your brand mark is not actually a fixed asset. Text in a logo
must be outlined.

---

### 6. Every border fails WCAG non-text contrast, including all 9 form inputs

Card borders 1.32:1, secondary buttons 2.25:1, **form input borders 1.84:1 against a fill
that is 1.04:1 against the page** — against a 3:1 requirement.

*Why #6:* it is both an accessibility failure and a conversion failure, on the contact
form specifically. Users cannot see where the fields are. Note that **text contrast is
excellent** (7.7–17.6:1) — the palette is not the problem, the border alphas are, and they
are fixable without touching a single brand hex.

---

### 7. "Specification placeholders" is live, user-facing copy on 4 pages

`<summary>Specification placeholders</summary>` on cat-litter, LECA, and silica-sand;
"Commercial documentation placeholders: PI, invoice, packing list…" on export-trade.

*Why #7:* a procurement buyer assessing whether to trust a supplier with a bulk order
reads the word "placeholders" and closes the tab. Near-zero cost to fix, disproportionate
credibility damage while it sits there.

---

### 8. No product photography at all

`public/` holds two SVGs. Every product is a `ProductVisual` CSS gradient rectangle,
`aria-hidden`, chosen from 5 presets.

*Why #8:* for a materials trader, photographs of the actual granule, mesh, and packaging
**are the specification**. A buyer comparing silica sand suppliers needs to see grain. This
is the largest content gap on the site and the only top-10 item I cannot fix in code —
it needs real photographs from you. Flagging it now so it can run in parallel with the
build phases.

---

### 9. Nothing is enforced: no lint config, no CI, no meaningful tests, no `.gitignore`

ESLint installed but never configured (`npm run lint` opens an interactive wizard). No
`.github/`. No unit or integration tests. The one E2E test covering the contact flow
**passes whether or not email works**. No `.gitignore`, so `node_modules/` is one
`git add -A` away from being committed.

*Why #9:* this is what let #1–#4 ship and stay shipped. It is also the precondition for
doing the remaining phases safely — the brief asks for a verified green suite before
visual work, and right now there is nothing to be green.

---

### 10. `next@14.2.15` is critical-vulnerable, and it collides with the Phase 2 plan

21 advisories, including **Authorization Bypass in Next.js Middleware**
(CVE-2025-29927). Phase 2 proposes adding middleware for security headers.

*Why #10:* real, but ranked last deliberately — this site has no auth and no
middleware today, so the bypass is not currently exploitable against you. It becomes
relevant the moment middleware is added, and the upgrade is a breaking change that
deserves its own isolated commit rather than being bundled into a redesign.

---

## What I need from you before Phase 1

Four things. The first two are the ones I genuinely cannot derive.

1. **What does ORVIX actually do, in your words?** The brief calls this the
   highest-leverage input and it is right. I can see *what* you sell from `lib/data.ts`,
   but not: who actually buys (individual cat owners *and* refinery procurement teams is a
   very wide spread), what you source vs. trade vs. hold, what a buyer gets from you that
   they don't get from a competitor, and whether the India connection is sourcing, selling,
   or both. Without this, Phase 4 copy will be as generic as what is there now — I will not
   invent specifics.

2. **What must the backend reliably do?** Today it is one contact form and nothing else.
   Should submissions also be stored somewhere you can query? Do you want a copy to a second
   address, a Slack/WhatsApp ping, a CRM? Which inbox is authoritative? Anything beyond
   "email lands in one inbox, and nothing is ever lost" needs saying now.

3. **Branch name.** Your prompt says `redesign/ux-overhaul`. This session is configured to
   push to `claude/exciting-einstein-4zfz3x`. Both satisfy "never push to main." Tell me
   which you want — I have used the configured branch for this audit commit only.

4. **Motion library.** You left the choice to me in Phase 5. `framer-motion` is already
   installed and already used in 2 files. My recommendation is to **keep it but stop
   paying for it on the homepage** — move the entrance animations to CSS so
   `app/page.tsx` can become a server component again (−46 kB First Load JS), and keep
   Framer only where it earns its weight (the mobile menu). Say if you'd rather go
   CSS-only everywhere.

I have **not** answered these for you and have made no assumptions about them in this
document.

Everything else in the `[[ ]]` list I filled in from the repo itself: the stack is
**Next.js 14.2.15 App Router + Tailwind 3.4 + TypeScript strict, no component library**;
the backend is **one route handler with a zod schema and dual Resend/SMTP email, no
database**; brand assets are **two SVGs, one of which has a font-dependency bug**; and the
palette is the 8 hexes catalogued in §7, which I have recorded and will not change.
