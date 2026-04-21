export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-().]{7,15}$/.test(phone);
}

export function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && dateStr.trim() !== "";
}

export function isNotEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

export function isWithinRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

export type ValidationResult = { valid: boolean; message?: string };

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!isNotEmpty(value)) return { valid: false, message: `${fieldName} is required` };
  return { valid: true };
}
