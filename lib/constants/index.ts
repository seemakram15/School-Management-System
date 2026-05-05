export const GENDER = { MALE: 1, FEMALE: 2 } as const;
export const GENDER_LABELS: Record<number, string> = { 1: "Male", 2: "Female" };

export const STATUS = { INACTIVE: 0, ACTIVE: 1 } as const;
export const STATUS_LABELS: Record<number, string> = { 0: "Inactive", 1: "Active" };

export const ATTENDANCE = { ABSENT: 0, PRESENT: 1, LATE: 2 } as const;
export const ATTENDANCE_LABELS: Record<number, string> = { 0: "Absent", 1: "Present", 2: "Late" };

export const LEAVE_STATUS = { PENDING: 0, APPROVED: 1, REJECTED: 2 } as const;
export const LEAVE_STATUS_LABELS: Record<number, string> = { 0: "Pending", 1: "Approved", 2: "Rejected" };

export const SUBJECT_TYPE = { COMPULSORY: 1, OPTIONAL: 2 } as const;
export const SUBJECT_TYPE_LABELS: Record<number, string> = { 1: "Compulsory", 2: "Optional" };

export const RELIGION = { ISLAM: 1, CHRISTIANITY: 2, HINDUISM: 3, BUDDHISM: 4, OTHER: 5 } as const;
export const RELIGION_LABELS: Record<number, string> = {
  1: "Islam", 2: "Christianity", 3: "Hinduism", 4: "Buddhism", 5: "Other",
};

export const SHIFT = { MORNING: 1, EVENING: 2 } as const;
export const SHIFT_LABELS: Record<number, string> = { 1: "Morning", 2: "Evening" };

export const ITEMS_PER_PAGE = 10;
export const DATE_FORMAT = "yyyy-MM-dd";

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  STUDENTS: "/students",
  TEACHERS: "/teachers",
  EMPLOYEES: "/hrm/employees",
  CLASSES: "/academic/classes",
  SECTIONS: "/academic/sections",
  SUBJECTS: "/academic/subjects",
  ATTENDANCE: "/attendance/students",
  EXAMS: "/exams",
  MARKS: "/marks",
  RESULTS: "/results",
  ROLES: "/roles",
  SETTINGS: "/settings",
} as const;
