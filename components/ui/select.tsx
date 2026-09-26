import { forwardRef, type SelectHTMLAttributes } from "react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = "", children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`rounded-none border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-sm text-[var(--fg)] outline-none focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-[var(--accent)] ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  },
);
