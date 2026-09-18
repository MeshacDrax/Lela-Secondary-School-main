export const roles = [
  "ADMIN",
  "PRINCIPAL",
  "TEACHER",
  "STUDENT",
  "PARENT",
  "ACCOUNTANT",
  "LIBRARIAN"
] as const;

export type Role = (typeof roles)[number];

export type ThemeMode = "light" | "dark";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
}

export interface StudentProfile {
  id: string;
  admissionNumber: string;
  studentId: string;
  name: string;
  className: string;
  stream: string;
  gender: "Female" | "Male";
  guardian: string;
  guardianPhone: string;
  medicalInfo: string;
  status: "Active" | "Transferred" | "Alumni";
  attendanceRate: number;
  averageScore: number;
  feeBalance: number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
  tone: "green" | "gold" | "red" | "blue";
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}
