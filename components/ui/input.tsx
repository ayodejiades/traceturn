import { forwardRef, type InputHTMLAttributes } from "react";

// Focus is a hard 2px inset outline — a block caret, not a soft ring.
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`rounded-none border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-muted)] focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-[var(--accent)] ${className}`}
        {...props}
      />
    );
  },
);
