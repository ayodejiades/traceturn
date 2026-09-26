# traceturn — Style Reference
> green-on-black, keyboard-first

**Theme:** dark

Terminal is a developer-tool aesthetic that borrows directly from the command line: a near-black canvas, a single phosphor-green accent, everything set in a monospaced face, and controls styled as bracketed text (`[ Label ]`) rather than filled shapes. There is no soft shadow — emphasis comes from a thin green glow ring instead. The mood is dense, fast and unapologetically technical, built for developers and infra tools rather than a general consumer audience.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Terminal Black | `#0A0A0A` | `--bg` | Base canvas — a true near-black, the theme's only large surface |
| Panel Gray | `#111111` | `--surface` | Card and panel fill — one step up from terminal black |
| Panel Gray Raised | `#181818` | `--surface-raised` | Hover/active surface state |
| Grid Line | `#2A2A2A` | `--border` | Thin border on cards, tables and dividers — sharp, no softness |
| Phosphor Mint | `#D4F7DF` | `--fg` | Primary text — a soft green-tinted white, echoing a CRT phosphor glow |
| Dim Gray-Green | `#758C7F` | `--fg-muted` | Secondary text, muted labels, inactive nav items |
| Terminal Green | `#f59e0b` | `--accent` | The single signal color — primary actions, focus glow, active state, success text |
| Deep Green Ink | `#04170A` | `--accent-contrast` | Text/icon color placed on a filled Terminal Green surface |

## Tokens — Typography

### Geist — Geist for the rare piece of longer-form prose (docs, empty-state copy); almost everything else in the UI runs in the monospaced face. · `--font-sans`
- **Substitute:** Geist, system-ui
- **Weights:** 400, 600
- **Sizes:** 12px, 14px, 16px, 18px, 24px, 30px, 36px
- **Line height:** 1.11–1.56
- **Letter spacing / case:** tight, wide (some labels set uppercase)
- **Role:** Geist for the rare piece of longer-form prose (docs, empty-state copy); almost everything else in the UI runs in the monospaced face.

### Typography Rules (All Pages)
- **Approved Fonts:** Geist, Manrope, Geist Mono, Poppins.
- **Never Use:** Inter, Roboto, Arial, Open Sans, Helvetica.
- **Never Use Italic Fonts** anywhere in the interface.
- **One Typeface Per Site:** Do not pair two fonts unless functionally required (Geist Mono is allowed alongside primary font only for code, data, or numeric UI).
- **Weight Limit:** Never use ultra bold weights (900 / black). Cap at semibold (600) or bold (700).
- **No Hyphens In Text:** Do not use hyphens inside body copy, headings, or labels. Rewrite phrasing instead.
- **No Orphaned Words:** Never leave a single word sitting alone on the last line. Apply `text-wrap: balance` for headings and `text-wrap: pretty` for body copy.
- **Button Typography:** Main buttons `text-base` (16px), semibold; smaller header buttons `text-sm` (14px), semibold.

### Geist Mono — Geist Mono as the primary UI face — buttons, badges, nav, table data, and code-adjacent labels all render in this monospaced font so the product reads like a terminal, not a dashboard wearing a dark theme. · `--font-mono`

### Type Scale

| Size | Px | Line Height | Tailwind class |
|------|----|-----|----|
| xs | 12px | 16px | `text-xs` |
| sm | 14px | 20px | `text-sm` |
| base | 16px | 24px | `text-base` |
| lg | 18px | 28px | `text-lg` |
| 2xl | 24px | 32px | `text-2xl` |
| 3xl | 30px | 36px | `text-3xl` |
| 4xl | 36px | 40px | `text-4xl` |

## Tokens — Spacing & Shapes

### Spacing Tokens
Only these strict values are permitted across all components and pages:

| Token | Value | Tailwind equivalent |
|-------|-------|---------------------|
| Spacing-0 | 0 | `p-0` / `gap-0` |
| Spacing-25 | 2px | `0.5` (2px) |
| Spacing-50 | 4px | `1` (4px) |
| Spacing-75 | 8px | `2` (8px) |
| Spacing-100 | 12px | `3` (12px) |
| Spacing-200 | 16px | `4` (16px) |
| Spacing-300 | 24px | `6` (24px) |
| Spacing-400 | 32px | `8` (32px) |
| Spacing-500 | 40px | `10` (40px) |
| Spacing-600 | 48px | `12` (48px) |
| Spacing-700 | 64px | `16` (64px) |
| Spacing-800 | 80px | `20` (80px) |
| Spacing-900 | 96px | `24` (96px) |

- **Button Padding:** Main buttons use exactly 8px vertical (`py-2`) and 12px horizontal (`px-3`) padding.

### Corner Radius & Nested Radius Formula
**Radius tokens:** `--radius: 0.25rem`, `--radius-sm: 0.125rem`

| Element | Value |
|---------|-------|
| cards / stats / empty-states | `0.25rem` |
| buttons / inputs / selects | `0.125rem` |

When an inner element sits inside a container with gap < 32px:
```
inner radius = outer radius − gap
```
Apply only when result > 2px; otherwise leave inner shape square or unchanged.

### Borders & Backgrounds
- **Card Borders:** Full borders all the way around (`border border-[var(--border)]`) or none at all. Never apply an asymmetric border to only one side of a card (e.g. the common AI tell of `border-l-4`).
- **Flat Backgrounds & The Gradient Trap Ban:** Backgrounds are flat neutrals. Never use generic purple-to-cyan or indigo-to-blue linear/radial gradients in card or screen backgrounds.
- **Dark Mode Approved Backgrounds:** `#000000`, `#181818`, `#1F1F1F`, `#272727`, `#313131`, `#131209`.

**Shadow token:** `--shadow: 0 0 0 1px rgba(34,197,94,0.15)`

### Layout

Dense dashboard shell with minimal padding, sharp near-zero corners, and a sidebar/topbar built from monospaced nav items. Buttons and status text use bracket punctuation (`[ ]`) as a deliberate keyboard-driven-tool signal.

## Components

### Button
**Role:** Primary/secondary/ghost actions across the app

Reverse-video on hover (swap fg/bg, the terminal convention for a highlighted line) instead of an opacity fade. Secondary/ghost are bracketed text, `[ Label ]`, not filled shapes.

### Badge
**Role:** Status tags, category labels, pill counts

A bracketed status tag, like a log-line level marker — never a pill.

### Card
**Role:** Content container — dashboard tiles, feature blocks

Near-black surface, near-zero radius, thin border — no shadow beyond the accent glow ring on focus.

### Stat
**Role:** Metric callout — single number + label + delta

Tabular-aligned numerals in a hard-bordered box — a metrics readout, not a soft dashboard tile.

### Table
**Role:** Tabular data grid

The pack's most valuable component: dense, column-aligned, monospace, tabular-nums, no wrapping — a data table meant to be scanned like a log file, not a card-flavoured list.

### Input
**Role:** Text entry fields — forms, search, filters

Focus is a hard 2px inset outline — a block caret, not a soft ring.

### Select
**Role:** Dropdown selection control

Bracketed field matching the input treatment, monospace option list.

### Nav
**Role:** Top navigation bar / marketing nav

A shell-prompt bar: `project@studio:~$`, not a logotype + menu.

### Sidebar
**Role:** Dashboard side navigation

Dense monospace nav list, green left-marker or reverse-video on the active route, near-zero radius.

### Toast
**Role:** Transient notification

A pinned log line with a blinking prompt caret — reads like the tail of a terminal, not a floating notification card.

### Skeleton
**Role:** Loading placeholder shimmer

A row of blinking monospace block characters, like a terminal progress indicator — not a smooth gradient shimmer.

### Empty State
**Role:** No-data placeholder for lists, tables, dashboards

Monospace copy, bracketed action button, no illustration — reads like a CLI's empty-result message.

### Illustration
**Role:** Decorative/explanatory SVG artwork for empty states and hero sections

Boxed in a hard 1px frame, like a terminal image-preview pane.


## Do's and Don'ts

### Do
- Set UI chrome — buttons, badges, nav labels, table cells — in the monospaced face; reserve the sans only for longer prose.
- Use bracket punctuation (`[ Label ]`) on secondary/ghost buttons and status badges — it's the theme's signature, not decoration.
- Use the green glow-ring shadow (not a soft drop shadow) for focus and emphasis states.
- Keep corners at or near zero radius everywhere; rounding anything undoes the terminal read immediately.
- Use reverse-video (swap foreground/background) for hover and active states instead of an opacity fade — it's the authentic terminal convention.

### Don't
- Don't round corners — even the smallest radius breaks the terminal illusion.
- Don't add a drop shadow; the only elevation cue this theme uses is the green glow ring.
- Don't add a second accent color; green is the only signal color, on a strictly black-and-green-and-gray palette.
- Don't use the sans body face for buttons, badges or nav — those are monospace-only surfaces.
- Don't add gradients, illustration or photography — the aesthetic is deliberately textless-chrome and technical.

## Imagery

No illustration, no gradients, no photography. Visual interest comes entirely from the monospace grid, bracketed controls, and the single green glow — the product should look like it could run in a terminal emulator.

## Quick Color Reference
- text (primary): #D4F7DF
- text (muted): #758C7F
- background: #0A0A0A
- border: #2A2A2A
- accent / primary action: #f59e0b

## Example Component Prompts

1. Primary Action Button: Terminal Green fill, deep green ink text, monospace label, near-zero radius, no shadow.

2. Secondary Button: transparent fill, bracket punctuation around the label (`[ Label ]`), reverse-video on hover.

3. Status Badge: bordered in Terminal Green, monospace uppercase label, no fill, no radius.


## Similar Brands

- **Warp (terminal app)** — same green-on-black, monospace-first, keyboard-driven visual language
- **Vercel CLI / dashboard dark mode** — same dense, developer-facing dark UI restraint
- **Supabase dashboard (dark)** — same near-black canvas with a single bright accent for dev tooling
- **GitHub CLI** — same bracketed-text, monospace-chrome convention for developer tools

## Landing Page Design System

A landing page wins one intent: **one offer → one audience → one primary action**.

### Strategy & Structure (Part A)

#### A1. Intake
- **Purpose:** One primary action (trial, demo, buy, waitlist, download), clear offer definition, specific conversion metric.
- **Audience & Context:** Ideal customer profile, core problem solved, top 3 objections, traffic source (ads, search, social, email).
- **Proof & Assets:** Specific statistics, logos, real testimonials, case studies, product screenshots, risk reversal.
- **Constraints:** Brand voice (casual/professional), design direction, mobile priority.

#### A2. Page Structure & Build Order
Build section by section in this exact sequence:
1. **Above the Fold (Hero):** Outcome + audience headline, clarifying subheadline, one primary CTA, proof signal, hero visual.
2. **Benefits Section:** 3–5 outcome-driven bullets (bold benefit first, then proof).
3. **How It Works Section:** 3 clear sequential steps.
4. **Social Proof Section:** Verifiable testimonials or case study.
5. **Tagline Reveal Section (Mandatory):** Core benefit statement (B11) placed mid-page after hero or benefits.
6. **Objection Handling (FAQ):** 6–12 questions resolving high-friction concerns directly.
7. **Risk Reversal & Final CTA:** Free trial, cancel anytime, money-back guarantee, followed by primary CTA identical to hero.

#### A3. Layout Selection
- **Classic Hero + Sections:** Product is understandable from a hero screenshot (default SaaS choice).
- **Long Form Story:** High-skepticism products requiring sequential education.
- **Minimal Conversion Page:** High-intent traffic, waitlist, or brief download offers.
- **Comparison Page:** Search intent comparing alternatives ("X vs Y").

#### A4. Conversion Rules & Copywriting
- **Match Message to Source:** Mirror the source ad/search headline in the hero.
- **Obvious Next Step:** Exactly one primary CTA above the fold; never place competing primary CTAs.
- **Specific Numbers:** Never use vague claims like "streamline" or "optimize". Use organic specifics (e.g. "Cut reporting from 4 hours to 15 minutes").
- **Headline Formulas:** `{Outcome} without {pain}` · `The {category} for {audience}` · `Ship {result} in {time}`.
- **Subheadline:** 1–2 sentences clarifying what it is and who it is for.
- **CTA Labels:** Action verb plus what they get ("Start free trial", "Book a demo"). Never "Learn more" or "Submit".

#### A5. SEO & AEO
- Index evergreen offers: semantic title, meta description, and plain Q&A FAQ formatting for answer engines.
- Use `noindex` for temporary or ad-only campaign pages.

### Visual System & Engineering Directives (Part B)

#### B0. The Three Design Dials
- **`DESIGN_VARIANCE: 8`** (1 = Strict symmetry, 10 = Artsy chaos / asymmetry).
- **`MOTION_INTENSITY: 6`** (1 = Static, 10 = Cinematic spring physics & scroll scrubbing).
- **`VISUAL_DENSITY: 4`** (1 = Art gallery airy, 10 = Cockpit telemetry dense).

#### B5. Hero Section & Viewport Stability
- **Heading Text Gradient:** #FFFFFF → #9B9B9B (left to right). Text-only gradient; screen backgrounds remain flat.
- **The 2-Line Iron Rule:** H1 heading must NEVER exceed 2 to 3 lines on desktop. Max container width `max-w-[680px]` with `[text-wrap:balance]`.
- **Subheadline Discipline:** Supporting copy capped at 20 words maximum, with `[text-wrap:pretty]`.
- **Viewport Stability:** Use `min-h-[100dvh]`, never `h-screen` (prevents mobile Safari address-bar layout jumping).
- **Hero Top Padding Cap:** Desktop hero top padding max `pt-24` (6rem) so the primary action is immediately visible above the fold.
- **Hero Stack Limit:** Maximum 4 text elements total (Eyebrow or Brand strip, Headline, Subtext, CTA). Never bury hero with logos or badge walls.
- **Frontend Arrow Pill CTA (Aurora & Modern Rounded Themes):** Primary conversion CTA uses a pill container (`rounded-full`), generous padding (`pl-6 pr-2 py-2`), solid accent background, dark contrasting text (`font-semibold`), and a circular dark trailing badge with an up-right diagonal arrow (`↗`, `ArrowUpRight`) that translates slightly on hover (`group-hover:translate-x-0.5 group-hover:-translate-y-0.5`).

#### B6. Iconography & Telemetry
- **Approved Libraries:** Phosphor, Solar, or Iconamoon. Standardize stroke width globally (1.5 or 2.0).
- **Never Use:** Material Icons, Material Symbols, or thick default Lucide glyphs.
- **Keyboard Shortcuts:** Physical `<kbd>` tags with monospace font, subtle border, and rounded corners.

#### B7. Motion Choreography (Fluid Dynamics)
- **Custom Easing Curves:** Snappy response `cubic-bezier(0.16, 1, 0.3, 1)` and weighted spring `cubic-bezier(0.32, 0.72, 0, 1)`. Never use linear transitions.
- **Fluid Island Nav:** Floating glass pill (`mt-6 mx-auto w-max rounded-full`), hamburger lines rotating into an X (`rotate-45` / `-rotate-45`), glass modal expansion (`backdrop-blur-3xl`), staggered mask reveals (`translate-y-12 opacity-0` → `translate-y-0 opacity-100`).
- **Scroll Interpolation:** Gentle fade-up `translate-y-16 blur-md opacity-0` → `translate-y-0 blur-0 opacity-100` over 800ms+ using `IntersectionObserver` or Framer Motion `whileInView`. Never use unthrottled window scroll listeners.
- **Mandatory Reduced Motion:** Every animation must collapse to static under `@media (prefers-reduced-motion: reduce)`.

#### B8. Content Realism & Anti-AI Slop
- **The Gradient Trap Ban:** No generic purple-to-cyan or indigo-to-blue background gradients or button glows. Backgrounds remain flat neutrals; a single saturated accent is locked globally across the product (<80% saturation).
- **Left-Edge Colored Accent Stripe Ban:** Never apply `border-l-4 border-[accent]` to cards or containers. Containers must use complete 4-sided hairline borders or clean background shifts.
- **Hype & Empty Superlatives Ban:** Banned marketing tropes: "Supercharge your workflow", "Build the future of work", "Next-Gen productivity", "Powered by AI magic", "Redefining how teams collaborate". Enforce concrete verbs and verifiable metrics.
- **Unmotivated Animation Noise Ban:** Banned meteor canvas animations, cursor-following particle sparks, ambient floating blobs, or spinning gradient borders that serve no informational or spatial hierarchy purpose. Motion must be purposeful and respect `prefers-reduced-motion`.
- **WCAG AA Minimum Contrast Guarantee:** Low-contrast muted text on dark canvases (e.g. `#64748b` on `#09090b`) is strictly prohibited. Body copy must meet 4.5:1 contrast; large text 3:1. Never use transparent buttons without visible borders.
- **Decorative Badge Overload Ban:** Never stack decorative pill chips, status tags, or emoji announcements directly above the H1 headline. Badges exist strictly for functional status indicators on live data records.
- **No Filler Text:** Write realistic draft copy. Never use placeholder Latin or generic filler.
- **No Placeholder Entities:** Diverse realistic names (no generic placeholders), organic numbers (e.g. 47.2% not 50%), contextual brand comps.
- **No AI Clichés:** Banned words include "Elevate", "Seamless", "Unleash", "Next Gen", "Game changer", "Delve", "Tapestry".
- **No Badge / Tag Clusters:** Never stack rows of multicolored outline chips or generic floating tags in headers or cards. Badges exist strictly as functional status indicators on data records, never as decorative badge spam.
- **No Fake Div Screenshots:** Never draw mock dashboards with gray div rectangles, dummy div bar charts, or fake terminal windows. Use real interactive component previews or art-directed photography.
- **No Meta-Labels:** Banned labels: "SECTION 01", "FEATURE 04", "QUESTION 05", "ABOUT US".
- **Eyebrow Restraint:** Maximum 1 eyebrow per 3 sections. Hero counts as 1. Most sections are stronger with only a confident sentence-case headline.
- **Sentence Case:** Headers use sentence case, not Title Case On Everything.

#### B9. Interactive States & Component Mastery
- **Double-Bezel (Doppelrand) Architecture:** Premium cards use concentric nested enclosures: outer shell (`rounded-[1.5rem] p-2 border border-white/10`) and inner core (`rounded-[calc(1.5rem-0.5rem)] shadow-inner`).
- **Full State Set:** Hover (subtle shift), Active (`scale(0.98)` / `translateY(1px)` physical feedback), Focus (visible ring), Loading (skeleton loaders matching layout), Empty (composed state), Error (specific inline message).
- **Button Contrast & Wrap Ban:** Contrast ratio WCAG AA min (4.5:1). Button labels must fit on 1 line on desktop without wrapping.
- **No Dead Links:** Every button is connected or visually disabled.

#### B10. Ship Requirements
- Privacy & Terms links in footer, branded 404, client-side form validation, skip-to-content keyboard link, branded favicon, meta tags, alt text on all images, semantic HTML elements.

#### B11. Mandatory Tagline Reveal Section
- Dedicated prominent section separate from hero, minimum 2 lines of text.
- Type size `text-4xl` to `text-6xl`, max width 680px.
- Words start in muted tone (25–35% opacity) and transition individually into full text color as each word crosses the scroll trigger line, using the custom spring easing curve.

#### B12. Gapless Bento Grids
- **Zero Dead Cells:** Declare `grid-flow-dense` (`grid-auto-flow: dense`) and mathematically verify column/row spans. No empty voids.
- **Visual Diversity:** Alternate card backgrounds with real imagery, interactive controls, or subtle background shifts instead of 6 identical white cards.

## Cross-Page Design Consistency

To ensure unified, professional product quality, **every other page and view in this project** (dashboard shell, internal routes, settings, data tables, modals, auth screens) must adhere to the same visual standards as the landing page:

1. **Single Typography System:** The entire project runs on **Geist** (with Geist Mono strictly for data/code). Never introduce secondary sans typefaces, italic styling, or 900-weight black fonts. Headings use `text-wrap: balance`; body copy uses `text-wrap: pretty`. No hyphenated text inside sentences.
2. **Strict Type Scale:** Every font size across dashboard, tables, cards, and forms resolves to Tailwind's type scale (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`).
3. **Unified Spacing:** Layout gaps, margins, and paddings must come from the Spacing-0 to Spacing-900 token scale. All action buttons use 8px vertical (`py-2`) and 12px horizontal (`px-3`) padding.
4. **Nested Radius Harmony:** Cards, modals, and tables use `--radius`. Nested controls and inner buttons use `--radius-sm` (derived via `inner = outer - gap`).
5. **Flat Backgrounds & 4-Sided Card Borders:** Internal dashboards and app shells use flat neutral backgrounds. Card containers must have full 4-sided hairline borders (`border border-[var(--border)]`); single-sided borders (such as `border-l-4` accent stripes) and background gradients are strictly forbidden.
6. **WCAG AA Contrast & Physical Feedback:** All text must meet WCAG AA contrast (4.5:1 for body copy, 3:1 for large text). Buttons, table rows, and interactive elements across all pages feature `active:scale-[0.98]` physical press feedback and visible focus rings (`focus-visible:ring-2`).
7. **Purposeful Motion Physics:** Modals, tooltips, toasts, and sidebar transitions all share the spring curve: `transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]`. Unmotivated animation noise (particles, floating blobs, spinning borders) is banned, and `prefers-reduced-motion` is strictly respected.
8. **Icon Consistency:** Only Phosphor, Solar, or Iconamoon icons may be used anywhere across the product.
9. **Data Realism & Anti-Hype Copy:** Empty states, dashboard stats, and table rows must feature contextual, realistic data rather than round fake numbers or placeholder labels. Interface copy uses direct, outcome-driven language free of empty marketing superlatives.
10. **Zero Decorative Badge Spam:** Badges exist strictly as discrete status indicators on data records or tables; never render rows of floating multicolored chips, outline badges, or crypto-style tag clusters.

## Quick Start

### CSS Custom Properties

```css
@import "tailwindcss";

/* terminal (stub) — mono display, dense, green-on-graphite, keyboard hints. */
:root {
  --bg: #0a0a0a;
  --fg: #d4f7df;
  --fg-muted: #758c7f;
  --surface: #111111;
  --surface-raised: #181818;
  --border: #2a2a2a;
  --accent: #22c55e;
  --accent-contrast: #04170a;
  --radius: 0.25rem;
  --radius-sm: 0.125rem;
  --shadow: 0 0 0 1px rgba(34, 197, 94, 0.15);
}

@theme inline {
  --color-background: var(--bg);
  --color-foreground: var(--fg);
  --font-sans: var(--font-sans);
}

body {
  background: var(--bg);
  color: var(--fg);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

_Generated from the `terminal` theme pack — every token above is read from this project's own `.kit/theme.json` and `globals.css`, not guessed. Regenerate with `apply-theme.py` if you change `--accent`._
