#!/usr/bin/env python3
"""Guard the design-token rules that the warm palette pass established.

These are the regressions that actually happened during that work, so they are
worth failing a build over:

1. Cool hexes creeping back in. The canvas is warm umber; a stray #08090A or a
   Tailwind `zinc-*` class means someone hardcoded a colour instead of reading
   a token, and the page silently goes two-tone.
2. Hardcoded layout widths and horizontal padding. Routes must read
   --content-max / --page-pad so the content edge lands in the same place.
3. A missing mobile nav. Below md the inline nav is hidden, so the disclosure
   button is the only navigation a phone has.
4. An unused-token check in reverse: a token defined but never referenced means
   the palette grew a value nothing uses.

Run: python3 scripts/check-design-tokens.py
"""
import re
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
failures = []


def sources():
    for sub in ("app", "components"):
        for path in sorted((ROOT / sub).rglob("*.tsx")):
            yield path


# --- 1. No cool hardcoded colours in component/page source -------------------
# These are the pre-warm-palette values. The warm ones live in globals.css.
COOL = re.compile(
    r"#(?:08090A|0E1011|0F1211|151918|1F2523|2B3330|E8EDEB|8B9691|5F6A66|"
    r"EAB308|F43F5E|1c2c31|0a0a0a|121212|262626|525252|a3a3a3|1a1a1a)\b",
    re.IGNORECASE,
)
COOL_CLASSES = re.compile(r"\b(?:zinc|slate|neutral|gray|stone)-(?:50|100|200|300|400|500|600|700|800|900|950)\b")

for path in sources():
    text = path.read_text()
    for m in COOL.finditer(text):
        line = text[: m.start()].count("\n") + 1
        failures.append(f"{path.relative_to(ROOT)}:{line} cool hex {m.group(0)} (use a token)")
    for m in COOL_CLASSES.finditer(text):
        line = text[: m.start()].count("\n") + 1
        failures.append(f"{path.relative_to(ROOT)}:{line} cool utility {m.group(0)} (use a token)")

# --- 2. No hardcoded page-container width / horizontal padding -------------
# Only container-level widths are forbidden. A `max-w-3xl` on a paragraph or a
# blockquote is a deliberate prose measure and is left alone; what must not
# happen is a second page container that disagrees with --content-max, or a
# one-off horizontal padding that drifts from --page-pad.
BAD_LAYOUT = re.compile(
    r"mx-auto (?:mt-[\d./:sm-]+ )?max-w-(?:7xl|6xl|5xl|4xl|3xl)\b"
    r"|mx-auto max-w-\[\d+px\]"
    r"|mx-auto w-full max-w-(?:7xl|6xl|5xl|4xl|3xl)\b"
    r"|px-6 sm:px-10\b"
)
for path in sources():
    text = path.read_text()
    for m in BAD_LAYOUT.finditer(text):
        line = text[: m.start()].count("\n") + 1
        failures.append(
            f"{path.relative_to(ROOT)}:{line} hardcoded page container {m.group(0)} "
            f"(use --content-max / --page-pad)"
        )

# --- 3. Mobile navigation must exist ----------------------------------------
shell = (ROOT / "components" / "site-shell.tsx").read_text()
if "site-mobile-nav" not in shell:
    failures.append("site-shell.tsx: no #site-mobile-nav panel; phones would have no navigation")
if "aria-expanded" not in shell:
    failures.append("site-shell.tsx: nav toggle missing aria-expanded")
if "Escape" not in shell:
    failures.append("site-shell.tsx: nav panel does not close on Escape")

# --- 4. Every defined colour token is actually referenced -------------------
css = (ROOT / "app" / "globals.css").read_text()
defined = set(re.findall(r"^\s*(--(?:fg|bg|surface|border|accent|warn|danger|info|ok|art)-[\w-]+):", css, re.M))
referenced = set()
for path in sources():
    referenced |= set(re.findall(r"var\((--(?:fg|bg|surface|border|accent|warn|danger|info|ok|art)-[\w-]+)", path.read_text()))
unused = defined - referenced
if unused:
    failures.append("globals.css: tokens defined but never used: " + ", ".join(sorted(unused)))
    print("  hint: delete the token, or reference it — an unused palette entry is drift waiting to happen.")
    defined_used = sorted(defined & referenced)
    if defined_used:
        failures.append("")  # keeps the failure list readable
        print("  in use: " + ", ".join(defined_used))

if failures:
    print(f"design-token check: {len(failures)} problem(s)\n")
    for f in failures:
        print("  " + f)
    sys.exit(1)

print(f"design-token check: PASS ({len(defined)} colour tokens, all referenced; no cool hexes, no hardcoded layout)")
