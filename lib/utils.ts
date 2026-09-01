import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GENDER: Record<string, string> = { "1": "Male", "2": "Female" };
export const BLOOD_GROUP: Record<string, string> = { "A+": "A+", "A-": "A-", "B+": "B+", "B-": "B-", "AB+": "AB+", "AB-": "AB-", "O+": "O+", "O-": "O-" };
export const DESIGNATION: Record<string, string> = { "Teacher": "Teacher", "Principal": "Principal", "Vice Principal": "Vice Principal", "Librarian": "Librarian", "Accountant": "Accountant", "Guard": "Guard", "Peon": "Peon", "Other": "Other" };
export const RELIGION: Record<string, string> = { "1": "Islam", "2": "Christianity", "3": "Hinduism", "4": "Buddhism", "5": "Other" };
export const ATTENDANCE_STATUS = { 0: "Absent", 1: "Present", 2: "Late" } as const;
export const LEAVE_STATUS = { 0: "Pending", 1: "Approved", 2: "Rejected" } as const;
export const STATUS = { 0: "Inactive", 1: "Active" } as const;
export const SHIFT: Record<string, string> = { "Morning": "Morning", "Day": "Day", "Evening": "Evening" };
export const SUBJECT_TYPE = { 1: "Compulsory", 2: "Optional" } as const;
export const SMS_RECEIVE = { 0: "None", 1: "Father", 2: "Mother", 3: "Guardian" } as const;

export function formatDate(dateStr: string | null | undefined, format = "MMM d, yyyy"): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function statusBadgeClass(status: 0 | 1) {
  return status === 1
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}
