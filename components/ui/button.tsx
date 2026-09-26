import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

// Reverse-video on hover (swap fg/bg, the terminal convention for a
// highlighted line) instead of an opacity fade. Secondary/ghost are
// bracketed text, `[ Label ]`, not filled shapes.
const VARIANTS: Record<Variant, string> = {
  primary: "border border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-transparent hover:text-[var(--accent)]",
  secondary: "border border-[var(--border)] bg-transparent text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
  ghost: "border border-transparent bg-transparent text-[var(--fg-muted)] hover:text-[var(--accent)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className = "", children, ...props },
  ref,
) {
  const bracketed = variant !== "primary";
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-1 rounded-none px-3 py-1.5 font-mono text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {bracketed ? <span aria-hidden="true">[</span> : null}
      {children}
      {bracketed ? <span aria-hidden="true">]</span> : null}
    </button>
  );
});
