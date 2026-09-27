#!/usr/bin/env python3
"""Normalise every page to the dark token system.

The inner pages were scaffolded with light-mode fallbacks baked into their
arbitrary Tailwind values, e.g.

    border-[var(--border,#e5e5e5)]  bg-[var(--surface,#ffffff)]
    text-[var(--fg,#171717)]         hover:border-[#171717]

Those fallbacks are all near-white, so the dashboard renders light even though
the token layer in globals.css is dark. Stripping the fallbacks lets every page
inherit the dark tokens. Buttons that were dark-on-light invert to accent.

Run:  python3 scripts/dark-normalize.py [--check]
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CHECK = "--check" in sys.argv

# 1. Strip light-mode fallbacks so the token layer wins.
#    The value sits inside var(...), so a `)` separates the hex from the `]`
#    that closes the Tailwind arbitrary value:  var(--border,#e5e5e5)]
_HEX = r"#(?:ffffff|fff\b|e5e5e5|f5f5f5|fafafa|ededed|171717|737373|d4d4d8)"
FALLBACK_PAREN = re.compile(r",\s*" + _HEX + r"\s*\)")
FALLBACK_BRACKET = re.compile(r",\s*" + _HEX + r"\s*\]")

# 3. Remaining neutral-scale literals from the light scaffold.
LITERALS = [
    # dark button on a light page -> accent button on a dark page
    (r"\bbg-\[#171717\]", "bg-[var(--accent)]"),
    (r"\bbg-\[#171717\]\/90", "bg-[var(--accent-dim)]"),
    (r"\bbg-\[#1f1f1f\]", "bg-[var(--surface-raised)]"),
    (r"\bhover:bg-\[#171717\]", "hover:bg-[var(--accent-dim)]"),
    # borders
    (r"\bborder-\[#171717\]", "border-[var(--fg-muted)]"),
    (r"\bborder-\[#e5e5e5\]", "border-[var(--border)]"),
    (r"\bbg-\[#ffffff\]", "bg-[var(--surface)]"),
    (r"\bbg-\[#f5f5f5\]", "bg-[var(--bg-elevated)]"),
    # text
    (r"\btext-\[#171717\]", "text-[var(--fg)]"),
    (r"\btext-\[#737373\]", "text-[var(--fg-muted)]"),
    (r"\btext-\[#ededed\]", "text-[var(--fg)]"),
    # mid neutrals: light scaffold used these for secondary text and hairlines
    (r"\btext-\[#404040\]", "text-[var(--fg-muted)]"),
    (r"\bbg-\[#e5e5e5\]\/60", "bg-[var(--surface-raised)]"),
    (r"\bhover:bg-\[#e5e5e5\]\/60", "hover:bg-[var(--surface-raised)]"),
    (r"\bbg-\[#e5e5e5\]", "bg-[var(--surface-raised)]"),
    (r"\bborder-\[#d4d4d8\]", "border-[var(--border)]"),
    (r"\bborder-\[#3f3f46\]", "border-[var(--border-strong)]"),
    (r"\bbg-\[#3f3f46\]", "bg-[var(--surface-raised)]"),
    (r"\btext-\[#3f3f46\]", "text-[var(--fg-muted)]"),
    (r"\bborder-\[#52525b\]", "border-[var(--border-strong)]"),
    (r"\btext-\[#52525b\]", "text-[var(--fg-subtle)]"),
    (r"\bborder-\[#71717a\]", "border-[var(--border-strong)]"),
    (r"\btext-\[#71717a\]", "text-[var(--fg-subtle)]"),
    (r"\btext-\[#a1a1aa\]", "text-[var(--fg-muted)]"),
]

changed = []
total = 0

# 4. Raw SVG presentation attributes in the mock-UI illustrations. These are not
#    Tailwind classes, so they need their own pass; a white card in the mock is as
#    wrong on a dark page as a white card in the real one.
SVG_ATTRS = [
    (r'fill="#ffffff"', 'fill="var(--surface-raised)"'),
    (r'fill="#fafafa"', 'fill="var(--surface-raised)"'),
    (r'fill="#f5f5f5"', 'fill="var(--surface)"'),
    (r'fill="#ededed"', 'fill="var(--fg)"'),
    (r'stroke="#d4d4d8"', 'stroke="var(--border)"'),
    (r'stroke="#e5e5e5"', 'stroke="var(--border)"'),
    (r'fill="#171717"', 'fill="var(--fg)"'),
    (r'stroke="#171717"', 'stroke="var(--fg-muted)"'),
    (r'fill="#737373"', 'fill="var(--fg-subtle)"'),
    (r'fill="#3f3f46"', 'fill="var(--fg-muted)"'),
]

for path in sorted(ROOT.glob("app/**/*.tsx")) + sorted(ROOT.glob("components/**/*.tsx")):
    src = original = path.read_text(encoding="utf-8")
    src = FALLBACK_PAREN.sub(")", src)
    src = FALLBACK_BRACKET.sub("]", src)
    for pat, rep in LITERALS:
        src = re.sub(pat, rep, src)
    for pat, rep in SVG_ATTRS:
        src = re.sub(pat, rep, src)
    # An opacity modifier on a var() is not valid CSS; map it to the dim token.
    src = re.sub(
        r"hover:bg-\[var\(--accent\)\]/90", "hover:bg-[var(--accent-dim)]", src
    )
    # An accent button must not keep dark-theme white-on-white contrast.
    src = re.sub(
        r"(bg-\[var\(--accent\)\][^\"']*?)\btext-white\b",
        r"\1text-[var(--accent-contrast)]",
        src,
    )
    if src != original:
        changed.append((path.relative_to(ROOT), len(original) - len(src)))
        total += 1
        if not CHECK:
            path.write_text(src, encoding="utf-8")

verb = "would change" if CHECK else "changed"
print(f"{verb} {total} files")
for rel, delta in changed:
    print(f"  {rel}  (-{delta} chars)")
