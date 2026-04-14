export function formatDate(date: string | Date, format: "short" | "long" | "input" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  if (format === "input") {
    return d.toISOString().split("T")[0];
  }
  if (format === "long") {
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${formatNumber(value, decimals)}%`;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function truncate(str: string, maxLength: number = 50): string {
  return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
