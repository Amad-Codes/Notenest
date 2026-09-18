import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-paper hover:bg-ink-soft dark:bg-accent dark:text-ink dark:hover:bg-accent-hover",
  secondary:
    "bg-transparent border border-line dark:border-line-dark text-ink dark:text-ink-dark hover:bg-line/40 dark:hover:bg-line-dark/40",
  ghost: "bg-transparent text-ink/70 dark:text-ink-dark/70 hover:bg-line/40 dark:hover:bg-line-dark/40",
  danger: "bg-danger text-white hover:bg-danger-hover",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3 rounded-xl gap-2",
};

/**
 * The single button component used across the app. Centralizing variants
 * here keeps every CTA visually consistent instead of one-off Tailwind
 * classes scattered through pages.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, disabled, className = "", children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...rest}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
