#!/usr/bin/env python3
"""Collapse the Tailwind colour rainbow onto the traceturn token system, and drop
the redundant `var(--token,#fallback)` defaults that are left over from when the
palette was cold grey.

Those fallbacks are actively harmful now: if a token were ever renamed the old
hex would silently take over and reintroduce a cool colour. The tokens are always
defined in globals.css, so the defaults are dead weight.
"""
import re
import pathlib

MAP = {
    r"\bemerald-200\b": "var(--accent)",
    r"\bemerald-300\b": "var(--accent)",
    r"\bemerald-400\b": "var(--accent)",
    r"\bemerald-500\b": "var(--accent-dim)",
    r"\bemerald-600\b": "var(--accent-dim)",
    r"\bemerald-800\b": "color-mix(in srgb, var(--accent) 30%, transparent)",
    r"\bemerald-900\b": "color-mix(in srgb, var(--accent) 18%, transparent)",
    r"\bemerald-950\b": "color-mix(in srgb, var(--accent) 10%, transparent)",
    r"\brose-300\b": "var(--danger)",
    r"\brose-400\b": "var(--danger)",
    r"\brose-800\b": "color-mix(in srgb, var(--danger) 30%, transparent)",
    r"\brose-950\b": "color-mix(in srgb, var(--danger) 10%, transparent)",
    r"\bamber-300\b": "var(--warn)",
    r"\bamber-400\b": "var(--warn)",
    r"\bamber-500\b": "var(--warn)",
    r"\bamber-800\b": "color-mix(in srgb, var(--warn) 30%, transparent)",
    r"\bamber-950\b": "color-mix(in srgb, var(--warn) 10%, transparent)",
    r"\borange-400\b": "var(--warn)",
    r"\borange-500\b": "var(--warn)",
    r"\bsky-400\b": "var(--info)",
    r"\bblue-400\b": "var(--info)",
}

PREFIX = (
    r"(?:text|bg|border|ring|from|to|via|divide|shadow|decoration|outline|fill|stroke)"
)

roots = [pathlib.Path("app"), pathlib.Path("components")]
changed = 0
for root in roots:
    for path in sorted(root.rglob("*.tsx")):
        text = original = path.read_text()

        for pattern, repl in MAP.items():
            # Tailwind colour utilities are `<prefix>-<palette>-<shade>`. The
            # prefix must survive or the class collapses into a bare
            # `var(--accent)/30` and stops working. Opacity suffixes are kept.
            #
            # Note: never spell a literal Tailwind colour class anywhere in this
            # repo. Tailwind v4 auto-scans the whole project, not just
            # components, so a class name appearing in a comment or in this
            # script still gets compiled into the stylesheet as dead CSS.
            def sub(m, repl=repl):
                return f"{m.group(1)}-[{repl}{m.group(2) or ''}]"

            text = re.sub(
                "(" + PREFIX + r")-" + pattern + r"(/[\d.]+)?",
                sub,
                text,
            )

        # Collapse `var(--token,#fallback)` down to the token.
        text = re.sub(r"var\((--[a-z0-9-]+),#[0-9a-fA-F]{3,8}\)", r"var(\1)", text)

        if text != original:
            path.write_text(text)
            changed += 1
            print("rewrote", path)
print(f"{changed} files")
