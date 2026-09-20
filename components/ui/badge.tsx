import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "danger" | "warning" | "info";
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  danger:  "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  info:    "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
