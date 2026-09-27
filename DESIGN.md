# Traceturn — Design System & Visual Specification
> Deterministic Swarm Forensics · Classical Landscape + Terminal Architecture

**Theme:** Dark Mode Throughout (`#08090A`)

Traceturn marries the rigor of deterministic terminal forensics with the timeless visual gravity of 19th-century classical landscape oil paintings (evoking the sublime wilderness works of Albert Bierstadt, Caspar David Friedrich, and J.M.W. Turner). High-contrast typography, hairline borders, and live causal graphs sit effortlessly against atmospheric alpine and fjord landscapes.

---

## 1. Visual Identity & Art Direction

### The Architectural Juxtaposition
- **Sublime Fine-Art Landscapes:** Pure oil painting backdrops evoke vast, complex terrain — mirroring the unpredictable, multi-agent space of autonomous LLM swarms.
- **Deterministic Terminal Forensics:** Superimposed directly against the organic landscapes are ultra-precise, hairline-bordered telemetry cards, causal DAG visualizations, and literal evidence bindings.
- **Zero Generic AI Slop:** No generic purple/cyan mesh gradients, no floating geometric spheres, no fake div mockups, and no AI superlatives.

### Custom Original Artworks
1. **Hero Alpine Cirque (`/hero-landscape.jpg`):**
   - *Composition:* A dramatic alpine mountain valley at sunrise. Towering granite peaks with warm golden dawn sunlight breaking through misty atmospheric clouds over a glacial lake basin and ancient evergreen shores.
   - *Integration:* Renders full-bleed across the top viewport, softly transitioning into the dark `#08090A` canvas via a vertical alpha mask.
2. **Footer Twilight Fjord (`/footer-landscape.jpg`):**
   - *Composition:* A panoramic mountain fjord and tranquil lake at deep twilight dusk. Misty layered ridges recede toward a glowing horizon under deep teal and prussian blue skies with early evening stars emerging. A solitary stone watchtower sits atop a rocky headland.
   - *Integration:* Houses the 6-column white navigation links across the sky, with the AI summary badges anchored cleanly along the shoreline.

---

## 2. Color Tokens (Dark Palette)

All surfaces, borders, and text adhere to strict WCAG AA contrast ratios:

| Token | Hex Value | Role |
|-------|-----------|------|
| `--bg` | `#08090A` | Base canvas — deep near-black background |
| `--bg-elevated` | `#0E1011` | Elevated container fill (stats bar, blockquotes, banners) |
| `--surface` | `#0F1211` | Primary card and panel surface |
| `--surface-raised` | `#151918` | Hover and active interactive surface state |
| `--border` | `#1F2523` | 4-sided hairline border for cards, tables, and dividers |
| `--border-strong` | `#2B3330` | High-emphasis hairline borders and interactive controls |
| `--fg` | `#E8EDEB` | Primary typography — high-contrast crisp off-white |
| `--fg-muted` | `#8B9691` | Secondary prose, metric labels, descriptive copy |
| `--fg-subtle` | `#5F6A66` | Monospace tags, metadata labels, table headers |
| `--accent` | `#10B981` | Single signal accent — graph origins, pass states, primary CTA, focus rings |
| `--accent-dim` | `#0D9668` | Accent hover state |
| `--accent-contrast` | `#04150C` | Foreground text on filled accent buttons |
| `--warn` | `#EAB308` | Waiting states and unresolved gating indicators |
| `--danger` | `#F43F5E` | Drift detection, failure alerts, broken invariants |

---

## 3. Typography & Text Hierarchy

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

---

## 4. Borders & Backgrounds

- **Card Borders:** Full borders all the way around (`border border-[var(--border)]`) or none at all. Never apply an asymmetric border to only one side of a card (e.g. the common AI tell of `border-l-4`).
- **Flat Backgrounds & The Gradient Trap Ban:** Backgrounds are flat neutrals. Never use generic purple-to-cyan or indigo-to-blue linear/radial gradients in card or screen backgrounds.
- **Dark Mode Approved Backgrounds:** `#000000`, `#08090A`, `#0E1011`, `#0F1211`, `#151918`, `#181818`, `#1F1F1F`, `#272727`.
- **CTA Button Color Philosophy:** Never use stark blinding `#FFFFFF` against deep dark-mode backdrops, which creates harsh contrast glare. Instead, use the signal accent (`var(--accent)` emerald `#10B981` with dark green-black text) or an elevated frosted dark surface (`bg-white/10 text-white border border-white/20 hover:bg-white/20`) to preserve cohesive visual depth.

---

## 5. Core Components

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

### LineageGraph (`components/lineage-graph.tsx`)
**Role:** Causal claim lineage visualizer  
Deterministic radial causal DAG visualization. Reveals 14 agent assertions converging on 1 single independent origin turn. Real-time verdict telemetry and pulse animations.

### SiteHeader & SiteFooter
**Role:** System framing  
- **Header:** Sticky transparent header floating gracefully over the hero sky, clean wordmark, high-contrast action button.
- **Footer:** Full-bleed panoramic twilight landscape backdrop (`/footer-landscape.jpg`) with 6-column clean white navigation links grid and minimal AI summary action buttons (Claude, ChatGPT, Gemini).

---

## 6. Copywriting & Quality Standards

- **Zero AI Superlatives:** Banned words include *supercharge*, *seamless*, *next-gen*, *revolutionary*, *effortless*, *unleash*.
- **Concrete Technical Language:** State exact mechanisms (e.g., *"Causal blame DAG"*, *"Integer derivation counting"*, *"Literal excerpt binding"*).
- **Deterministic Verification Invariant:** Agents propose; deterministic code decides. Every decisive assertion must bind to an immutable T0 transcript substring or fail closed (`ABSTAIN_UNBOUND_EXCERPT`).
