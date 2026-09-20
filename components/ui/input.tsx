import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("field-input", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn("field-select pr-9 w-full", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn("field-textarea", className)}
      {...props}
    />
  );
}

export function Label({ className, children, required, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn("block text-sm font-semibold text-foreground mb-1.5", className)} {...props}>
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

export function FormField({
  label, children, error, hint, required, className,
}: {
  label?: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-destructive inline-block" />
        {error}
      </p>}
    </div>
  );
}

/* Sectioned form card */
export function FormSection({
  title, children, icon, className,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("form-section", className)}>
      <h3 className="form-section-title">
        {icon && <span className="text-primary">{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  );
}

/* Grid helper for form rows */
export function FieldRow({ cols = 2, children, className }: { cols?: 1 | 2 | 3; children: React.ReactNode; className?: string }) {
  const gridClass = cols === 1 ? "grid-cols-1" : cols === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";
  return <div className={cn(`grid gap-4 ${gridClass}`, className)}>{children}</div>;
}
