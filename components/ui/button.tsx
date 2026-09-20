import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success" | "warning";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:   "btn-gradient-primary font-semibold",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70 shadow-sm hover:shadow transition-all duration-200",
  danger:    "btn-gradient-danger font-semibold",
  ghost:     "hover:bg-muted text-foreground transition-colors duration-200",
  outline:   "border border-border bg-transparent hover:bg-muted text-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary",
  success:   "font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-px active:translate-y-0",
  warning:   "font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-px active:translate-y-0",
};

const successStyle = "background: linear-gradient(135deg,#16a34a,#0d9488); box-shadow: 0 4px 14px rgba(22,163,74,.3)";
const warningStyle = "background: linear-gradient(135deg,#d97706,#ea580c); box-shadow: 0 4px 14px rgba(217,119,6,.3)";

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  xs:   "px-2.5 py-1 text-xs rounded-lg gap-1",
  sm:   "px-3.5 py-1.5 text-xs rounded-xl gap-1.5",
  md:   "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg:   "px-6 py-3 text-base rounded-xl gap-2",
  icon: "p-2.5 rounded-xl",
};

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, style, ...props }: ButtonProps) {
  const inlineStyle = variant === "success" ? successStyle : variant === "warning" ? warningStyle : undefined;
  return (
    <button
      disabled={disabled || loading}
      style={inlineStyle ? { ...Object.fromEntries(inlineStyle.split(";").filter(Boolean).map(s => s.split(":").map(v => v.trim()))), ...style } : style}
      className={cn(
        "inline-flex items-center justify-center font-medium cursor-pointer",
        "disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
      {children}
    </button>
  );
}
